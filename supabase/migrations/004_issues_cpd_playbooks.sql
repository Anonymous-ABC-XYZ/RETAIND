-- Migration 004: Issues & Training
-- Tables: issues, cpd_records, mentor_notes, playbooks
-- Enums: issue_type, issue_severity, issue_status

-- Create issue_type enum (idempotent)
DO $$ BEGIN
    CREATE TYPE issue_type AS ENUM (
        'performance',
        'attendance',
        'conduct',
        'safety',
        'quality',
        'training',
        'documentation',
        'equipment',
        'communication',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create issue_severity enum (idempotent)
DO $$ BEGIN
    CREATE TYPE issue_severity AS ENUM (
        'low',
        'medium',
        'high',
        'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create issue_status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE issue_status AS ENUM (
        'open',
        'in_progress',
        'pending_review',
        'resolved',
        'escalated',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    issue_type issue_type NOT NULL,
    severity issue_severity DEFAULT 'medium' NOT NULL,
    status issue_status DEFAULT 'open' NOT NULL,
    due_date DATE,
    resolved_date TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    root_cause TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    is_confidential BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CPD (Continuing Professional Development) Records table
CREATE TABLE IF NOT EXISTS cpd_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    provider TEXT,
    category TEXT,
    training_type TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    hours_completed DECIMAL(5, 2),
    cost DECIMAL(10, 2),
    status TEXT DEFAULT 'completed',
    certificate_number TEXT,
    certificate_url TEXT,
    expiry_date DATE,
    notes TEXT,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Mentor notes table
CREATE TABLE IF NOT EXISTS mentor_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    note_type TEXT DEFAULT 'general',
    title TEXT,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Playbooks table (guidance documents)
CREATE TABLE IF NOT EXISTS playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    content TEXT NOT NULL,
    role_types TEXT[],
    trades TEXT[],
    version TEXT DEFAULT '1.0',
    is_published BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    last_reviewed_at TIMESTAMPTZ,
    last_reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Playbook acknowledgments table
CREATE TABLE IF NOT EXISTS playbook_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(playbook_id, worker_id)
);

-- Add updated_at triggers (idempotent)
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issue_comments_updated_at ON issue_comments;
CREATE TRIGGER update_issue_comments_updated_at
    BEFORE UPDATE ON issue_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cpd_records_updated_at ON cpd_records;
CREATE TRIGGER update_cpd_records_updated_at
    BEFORE UPDATE ON cpd_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentor_notes_updated_at ON mentor_notes;
CREATE TRIGGER update_mentor_notes_updated_at
    BEFORE UPDATE ON mentor_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playbooks_updated_at ON playbooks;
CREATE TRIGGER update_playbooks_updated_at
    BEFORE UPDATE ON playbooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_issues_organisation_id ON issues(organisation_id);
CREATE INDEX IF NOT EXISTS idx_issues_worker_id ON issues(worker_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_cpd_records_organisation_id ON cpd_records(organisation_id);
CREATE INDEX IF NOT EXISTS idx_cpd_records_worker_id ON cpd_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notes_organisation_id ON mentor_notes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_mentor_notes_worker_id ON mentor_notes(worker_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_organisation_id ON playbooks(organisation_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_category ON playbooks(category);
CREATE INDEX IF NOT EXISTS idx_playbook_acknowledgments_playbook_id ON playbook_acknowledgments(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_acknowledgments_worker_id ON playbook_acknowledgments(worker_id);

-- Enable Row Level Security
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for issues (idempotent)
DROP POLICY IF EXISTS "Users can view issues in their org" ON issues;
CREATE POLICY "Users can view issues in their org"
    ON issues FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = issues.organisation_id
        )
        AND (NOT is_confidential OR EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = issues.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        ))
    );

DROP POLICY IF EXISTS "Managers can manage issues" ON issues;
CREATE POLICY "Managers can manage issues"
    ON issues FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = issues.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        )
    );

-- RLS Policies for issue_comments (idempotent)
DROP POLICY IF EXISTS "Users can view non-internal comments" ON issue_comments;
CREATE POLICY "Users can view non-internal comments"
    ON issue_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM issues i
            JOIN user_organisations uo ON uo.organisation_id = i.organisation_id
            WHERE uo.user_id = auth.uid() AND i.id = issue_comments.issue_id
        )
        AND (NOT is_internal OR EXISTS (
            SELECT 1 FROM issues i
            JOIN user_organisations uo ON uo.organisation_id = i.organisation_id
            WHERE uo.user_id = auth.uid()
            AND i.id = issue_comments.issue_id
            AND uo.role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        ))
    );

DROP POLICY IF EXISTS "Org members can add comments" ON issue_comments;
CREATE POLICY "Org members can add comments"
    ON issue_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM issues i
            JOIN user_organisations uo ON uo.organisation_id = i.organisation_id
            WHERE uo.user_id = auth.uid() AND i.id = issue_comments.issue_id
        )
    );

-- RLS Policies for cpd_records (idempotent)
DROP POLICY IF EXISTS "Users can view CPD records in their org" ON cpd_records;
CREATE POLICY "Users can view CPD records in their org"
    ON cpd_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = cpd_records.organisation_id
        )
    );

DROP POLICY IF EXISTS "Managers can manage CPD records" ON cpd_records;
CREATE POLICY "Managers can manage CPD records"
    ON cpd_records FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = cpd_records.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        )
    );

-- RLS Policies for mentor_notes (idempotent)
DROP POLICY IF EXISTS "Users can view non-private mentor notes in their org" ON mentor_notes;
CREATE POLICY "Users can view non-private mentor notes in their org"
    ON mentor_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = mentor_notes.organisation_id
        )
        AND (NOT is_private OR mentor_id = auth.uid() OR EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = mentor_notes.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        ))
    );

DROP POLICY IF EXISTS "Mentors and managers can manage mentor notes" ON mentor_notes;
CREATE POLICY "Mentors and managers can manage mentor notes"
    ON mentor_notes FOR ALL
    USING (
        mentor_id = auth.uid() OR EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = mentor_notes.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        )
    );

-- RLS Policies for playbooks (idempotent)
DROP POLICY IF EXISTS "Users can view published playbooks in their org" ON playbooks;
CREATE POLICY "Users can view published playbooks in their org"
    ON playbooks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = playbooks.organisation_id
        )
        AND (is_published OR EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = playbooks.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        ))
    );

DROP POLICY IF EXISTS "Admins and managers can manage playbooks" ON playbooks;
CREATE POLICY "Admins and managers can manage playbooks"
    ON playbooks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = playbooks.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        )
    );

-- RLS Policies for playbook_acknowledgments (idempotent)
DROP POLICY IF EXISTS "Users can view acknowledgments in their org" ON playbook_acknowledgments;
CREATE POLICY "Users can view acknowledgments in their org"
    ON playbook_acknowledgments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM playbooks p
            JOIN user_organisations uo ON uo.organisation_id = p.organisation_id
            WHERE uo.user_id = auth.uid() AND p.id = playbook_acknowledgments.playbook_id
        )
    );

DROP POLICY IF EXISTS "Managers can manage acknowledgments" ON playbook_acknowledgments;
CREATE POLICY "Managers can manage acknowledgments"
    ON playbook_acknowledgments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM playbooks p
            JOIN user_organisations uo ON uo.organisation_id = p.organisation_id
            WHERE uo.user_id = auth.uid()
            AND p.id = playbook_acknowledgments.playbook_id
            AND uo.role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        )
    );
