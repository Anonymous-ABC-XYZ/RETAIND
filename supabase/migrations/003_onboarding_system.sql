-- ============================================================
-- Migration 003: Onboarding System
-- ============================================================
-- Tables: onboarding_templates, template_tasks,
--         onboarding_assignments, assigned_tasks
-- Enums: task_type, task_status
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE task_type AS ENUM (
  'document',
  'training',
  'checklist',
  'sign_off',
  'meeting',
  'assessment',
  'certification',
  'other'
);

CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'overdue',
  'skipped'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Onboarding Templates: reusable templates per role/trade
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  target_trade TEXT,
  duration_days INTEGER DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template Tasks: tasks within a template
CREATE TABLE template_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type task_type NOT NULL DEFAULT 'checklist',
  day_due INTEGER, -- day number relative to start (e.g., day 7)
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Assignments: a template assigned to a worker
CREATE TABLE onboarding_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_end_date DATE,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assigned Tasks: individual tasks for a worker's assignment
CREATE TABLE assigned_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES onboarding_assignments(id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES template_tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type task_type NOT NULL DEFAULT 'checklist',
  status task_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  evidence_url TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_onboarding_templates_org ON onboarding_templates(organisation_id);
CREATE INDEX idx_template_tasks_template ON template_tasks(template_id);
CREATE INDEX idx_onboarding_assignments_org ON onboarding_assignments(organisation_id);
CREATE INDEX idx_onboarding_assignments_worker ON onboarding_assignments(worker_id);
CREATE INDEX idx_assigned_tasks_assignment ON assigned_tasks(assignment_id);
CREATE INDEX idx_assigned_tasks_status ON assigned_tasks(status);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER trg_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_onboarding_assignments_updated_at
  BEFORE UPDATE ON onboarding_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_assigned_tasks_updated_at
  BEFORE UPDATE ON assigned_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;

-- Onboarding Templates: org members can view
CREATE POLICY "Org members can view templates"
  ON onboarding_templates FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

-- Onboarding Templates: admins/managers can manage
CREATE POLICY "Org admins can insert templates"
  ON onboarding_templates FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Org admins can update templates"
  ON onboarding_templates FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Org admins can delete templates"
  ON onboarding_templates FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Template Tasks: viewable if user can see the template
CREATE POLICY "Org members can view template tasks"
  ON template_tasks FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM onboarding_templates
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Org admins can insert template tasks"
  ON template_tasks FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM onboarding_templates
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations
        WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
      )
    )
  );

CREATE POLICY "Org admins can update template tasks"
  ON template_tasks FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM onboarding_templates
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations
        WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
      )
    )
  );

CREATE POLICY "Org admins can delete template tasks"
  ON template_tasks FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM onboarding_templates
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations
        WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
      )
    )
  );

-- Onboarding Assignments: org members can view
CREATE POLICY "Org members can view assignments"
  ON onboarding_assignments FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can insert assignments"
  ON onboarding_assignments FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

CREATE POLICY "Org admins can update assignments"
  ON onboarding_assignments FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

-- Assigned Tasks: viewable if user can see the assignment
CREATE POLICY "Org members can view assigned tasks"
  ON assigned_tasks FOR SELECT
  USING (
    assignment_id IN (
      SELECT id FROM onboarding_assignments
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can insert assigned tasks"
  ON assigned_tasks FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM onboarding_assignments
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations
        WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
      )
    )
  );

CREATE POLICY "Managers can update assigned tasks"
  ON assigned_tasks FOR UPDATE
  USING (
    assignment_id IN (
      SELECT id FROM onboarding_assignments
      WHERE organisation_id IN (
        SELECT organisation_id FROM user_organisations
        WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
      )
    )
  );
