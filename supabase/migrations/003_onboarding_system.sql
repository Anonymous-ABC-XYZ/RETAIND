-- Migration 003: Onboarding System
-- Tables: onboarding_templates, template_tasks, onboarding_assignments, assigned_tasks
-- Enums: task_type, task_status

-- Create task_type enum (idempotent)
DO $$ BEGIN
    CREATE TYPE task_type AS ENUM (
        'document',
        'training',
        'certification',
        'meeting',
        'form',
        'equipment',
        'access',
        'introduction',
        'assessment',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create task_status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'pending',
        'in_progress',
        'completed',
        'skipped',
        'overdue',
        'blocked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Onboarding templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    role_type TEXT,
    trade TEXT,
    duration_days INTEGER DEFAULT 90,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organisation_id, name)
);

-- Template tasks table (tasks within a template)
CREATE TABLE IF NOT EXISTS template_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    task_type task_type DEFAULT 'other' NOT NULL,
    category TEXT,
    due_day INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    requires_evidence BOOLEAN DEFAULT FALSE,
    requires_sign_off BOOLEAN DEFAULT FALSE,
    sign_off_role org_role,
    instructions TEXT,
    resources JSONB DEFAULT '[]',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Onboarding assignments table (worker assigned to a template)
CREATE TABLE IF NOT EXISTS onboarding_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    target_completion_date DATE,
    actual_completion_date DATE,
    status TEXT DEFAULT 'in_progress' NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(worker_id, template_id)
);

-- Assigned tasks table (individual task instance for a worker)
CREATE TABLE IF NOT EXISTS assigned_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES onboarding_assignments(id) ON DELETE CASCADE,
    template_task_id UUID NOT NULL REFERENCES template_tasks(id) ON DELETE RESTRICT,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    status task_status DEFAULT 'pending' NOT NULL,
    due_date DATE NOT NULL,
    completed_date TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    signed_off_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    signed_off_at TIMESTAMPTZ,
    evidence_url TEXT,
    evidence_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(assignment_id, template_task_id)
);

-- Add updated_at triggers (idempotent)
DROP TRIGGER IF EXISTS update_onboarding_templates_updated_at ON onboarding_templates;
CREATE TRIGGER update_onboarding_templates_updated_at
    BEFORE UPDATE ON onboarding_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_template_tasks_updated_at ON template_tasks;
CREATE TRIGGER update_template_tasks_updated_at
    BEFORE UPDATE ON template_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_assignments_updated_at ON onboarding_assignments;
CREATE TRIGGER update_onboarding_assignments_updated_at
    BEFORE UPDATE ON onboarding_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assigned_tasks_updated_at ON assigned_tasks;
CREATE TRIGGER update_assigned_tasks_updated_at
    BEFORE UPDATE ON assigned_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate onboarding progress
CREATE OR REPLACE FUNCTION calculate_onboarding_progress(assignment_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM assigned_tasks
    WHERE assignment_id = assignment_uuid;

    SELECT COUNT(*) INTO completed_tasks
    FROM assigned_tasks
    WHERE assignment_id = assignment_uuid
    AND status IN ('completed', 'skipped');

    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update assignment progress when task status changes
CREATE OR REPLACE FUNCTION update_assignment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE onboarding_assignments
    SET progress_percentage = calculate_onboarding_progress(NEW.assignment_id)
    WHERE id = NEW.assignment_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_task_status_change ON assigned_tasks;
CREATE TRIGGER on_task_status_change
    AFTER UPDATE OF status ON assigned_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_assignment_progress();

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_template_tasks_template_id ON template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_assignments_worker_id ON onboarding_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_assignments_template_id ON onboarding_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_assignments_status ON onboarding_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_assignment_id ON assigned_tasks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_worker_id ON assigned_tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_status ON assigned_tasks(status);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_due_date ON assigned_tasks(due_date);

-- Enable Row Level Security
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_templates (idempotent)
DROP POLICY IF EXISTS "Users can view templates in their org" ON onboarding_templates;
CREATE POLICY "Users can view templates in their org"
    ON onboarding_templates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = onboarding_templates.organisation_id
        )
    );

DROP POLICY IF EXISTS "Admins and managers can manage templates" ON onboarding_templates;
CREATE POLICY "Admins and managers can manage templates"
    ON onboarding_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = onboarding_templates.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        )
    );

-- RLS Policies for template_tasks (idempotent)
DROP POLICY IF EXISTS "Users can view template tasks in their org" ON template_tasks;
CREATE POLICY "Users can view template tasks in their org"
    ON template_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM onboarding_templates ot
            JOIN user_organisations uo ON uo.organisation_id = ot.organisation_id
            WHERE uo.user_id = auth.uid() AND ot.id = template_tasks.template_id
        )
    );

DROP POLICY IF EXISTS "Admins and managers can manage template tasks" ON template_tasks;
CREATE POLICY "Admins and managers can manage template tasks"
    ON template_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM onboarding_templates ot
            JOIN user_organisations uo ON uo.organisation_id = ot.organisation_id
            WHERE uo.user_id = auth.uid()
            AND ot.id = template_tasks.template_id
            AND uo.role IN ('ORG_ADMIN', 'MANAGER')
        )
    );

-- RLS Policies for onboarding_assignments (idempotent)
DROP POLICY IF EXISTS "Users can view assignments in their org" ON onboarding_assignments;
CREATE POLICY "Users can view assignments in their org"
    ON onboarding_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = onboarding_assignments.organisation_id
        )
    );

DROP POLICY IF EXISTS "Managers can manage assignments" ON onboarding_assignments;
CREATE POLICY "Managers can manage assignments"
    ON onboarding_assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = onboarding_assignments.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        )
    );

-- RLS Policies for assigned_tasks (idempotent)
DROP POLICY IF EXISTS "Users can view assigned tasks in their org" ON assigned_tasks;
CREATE POLICY "Users can view assigned tasks in their org"
    ON assigned_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM onboarding_assignments oa
            JOIN user_organisations uo ON uo.organisation_id = oa.organisation_id
            WHERE uo.user_id = auth.uid() AND oa.id = assigned_tasks.assignment_id
        )
    );

DROP POLICY IF EXISTS "Managers and supervisors can manage assigned tasks" ON assigned_tasks;
CREATE POLICY "Managers and supervisors can manage assigned tasks"
    ON assigned_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM onboarding_assignments oa
            JOIN user_organisations uo ON uo.organisation_id = oa.organisation_id
            WHERE uo.user_id = auth.uid()
            AND oa.id = assigned_tasks.assignment_id
            AND uo.role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        )
    );
