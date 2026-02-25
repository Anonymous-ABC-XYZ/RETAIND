-- ============================================================
-- Migration 004: Issues, CPD & Playbooks
-- ============================================================
-- Tables: issues, cpd_records, mentor_notes, playbooks
-- Enums: issue_type, issue_severity, issue_status
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE issue_type AS ENUM (
  'conduct',
  'performance',
  'attendance',
  'health_safety',
  'welfare',
  'grievance',
  'other'
);

CREATE TYPE issue_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE issue_status AS ENUM (
  'open',
  'investigating',
  'action_required',
  'monitoring',
  'resolved',
  'escalated',
  'closed'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Issues: incidents, concerns, HR matters
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  issue_type issue_type NOT NULL DEFAULT 'other',
  severity issue_severity NOT NULL DEFAULT 'medium',
  status issue_status NOT NULL DEFAULT 'open',

  date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
  date_resolved DATE,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CPD Records: training, certifications, professional development
CREATE TABLE cpd_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'technical', 'safety', 'soft_skills', 'certification'
  provider TEXT,
  hours NUMERIC(5,2),
  completion_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'expired')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentor Notes: notes from mentors/supervisors about workers
CREATE TABLE mentor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'progress', 'concern', 'praise', 'meeting')),
  is_private BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playbooks: guidance documents and SOPs
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- markdown content
  category TEXT, -- e.g., 'onboarding', 'health_safety', 'compliance', 'management'
  tags TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_issues_org ON issues(organisation_id);
CREATE INDEX idx_issues_worker ON issues(worker_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_type ON issues(issue_type);

CREATE INDEX idx_cpd_records_org ON cpd_records(organisation_id);
CREATE INDEX idx_cpd_records_worker ON cpd_records(worker_id);

CREATE INDEX idx_mentor_notes_org ON mentor_notes(organisation_id);
CREATE INDEX idx_mentor_notes_worker ON mentor_notes(worker_id);

CREATE INDEX idx_playbooks_org ON playbooks(organisation_id);
CREATE INDEX idx_playbooks_category ON playbooks(category);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cpd_records_updated_at
  BEFORE UPDATE ON cpd_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_mentor_notes_updated_at
  BEFORE UPDATE ON mentor_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_playbooks_updated_at
  BEFORE UPDATE ON playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

-- Issues: org members can view
CREATE POLICY "Org members can view issues"
  ON issues FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert issues"
  ON issues FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

CREATE POLICY "Managers can update issues"
  ON issues FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

CREATE POLICY "Org admins can delete issues"
  ON issues FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- CPD Records: org members can view
CREATE POLICY "Org members can view cpd records"
  ON cpd_records FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert cpd records"
  ON cpd_records FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

CREATE POLICY "Managers can update cpd records"
  ON cpd_records FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

CREATE POLICY "Org admins can delete cpd records"
  ON cpd_records FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Mentor Notes: org members can view non-private notes
CREATE POLICY "Org members can view mentor notes"
  ON mentor_notes FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
    AND (
      NOT is_private
      OR author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_organisations
        WHERE user_id = auth.uid()
          AND organisation_id = mentor_notes.organisation_id
          AND role IN ('ORG_ADMIN', 'MANAGER')
      )
    )
  );

CREATE POLICY "Managers can insert mentor notes"
  ON mentor_notes FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER', 'TEAM_LEADER')
    )
  );

CREATE POLICY "Authors can update own notes"
  ON mentor_notes FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_organisations
      WHERE user_id = auth.uid()
        AND organisation_id = mentor_notes.organisation_id
        AND role = 'ORG_ADMIN'
    )
  );

CREATE POLICY "Authors can delete own notes"
  ON mentor_notes FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_organisations
      WHERE user_id = auth.uid()
        AND organisation_id = mentor_notes.organisation_id
        AND role = 'ORG_ADMIN'
    )
  );

-- Playbooks: org members can view published playbooks
CREATE POLICY "Org members can view published playbooks"
  ON playbooks FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
    AND (
      is_published
      OR created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_organisations
        WHERE user_id = auth.uid()
          AND organisation_id = playbooks.organisation_id
          AND role IN ('ORG_ADMIN', 'MANAGER')
      )
    )
  );

CREATE POLICY "Managers can insert playbooks"
  ON playbooks FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Managers can update playbooks"
  ON playbooks FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Org admins can delete playbooks"
  ON playbooks FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );
