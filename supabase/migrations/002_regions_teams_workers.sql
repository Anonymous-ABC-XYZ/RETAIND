-- ============================================================
-- Migration 002: Workforce Structure
-- ============================================================
-- Tables: regions, teams, workers
-- Enums: worker_status, employment_type
-- RLS policies for org-scoped access
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE worker_status AS ENUM (
  'onboarding',
  'active',
  'probation',
  'at_risk',
  'offboarding',
  'departed'
);

CREATE TYPE employment_type AS ENUM (
  'full_time',
  'part_time',
  'contract',
  'apprentice',
  'agency'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Regions: geographical areas within an org
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, name)
);

-- Teams: functional teams within regions
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, region_id, name)
);

-- Workers: the core workforce entity
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,

  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,

  -- Employment info
  job_title TEXT,
  trade TEXT,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  status worker_status NOT NULL DEFAULT 'onboarding',
  start_date DATE,
  probation_end_date DATE,

  -- Risk tracking
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

  -- Mentor / supervisor
  mentor_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES workers(id) ON DELETE SET NULL,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_regions_org ON regions(organisation_id);
CREATE INDEX idx_teams_org ON teams(organisation_id);
CREATE INDEX idx_teams_region ON teams(region_id);
CREATE INDEX idx_workers_org ON workers(organisation_id);
CREATE INDEX idx_workers_team ON workers(team_id);
CREATE INDEX idx_workers_region ON workers(region_id);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_risk_level ON workers(risk_level);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER trg_regions_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Helper: check if user belongs to org
-- (used in policies below via subquery)

-- Regions: members can view regions in their orgs
CREATE POLICY "Org members can view regions"
  ON regions FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

-- Regions: org admins can manage regions
CREATE POLICY "Org admins can insert regions"
  ON regions FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

CREATE POLICY "Org admins can update regions"
  ON regions FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

CREATE POLICY "Org admins can delete regions"
  ON regions FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Teams: members can view teams in their orgs
CREATE POLICY "Org members can view teams"
  ON teams FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

-- Teams: org admins/managers can manage teams
CREATE POLICY "Org admins can insert teams"
  ON teams FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Org admins can update teams"
  ON teams FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Org admins can delete teams"
  ON teams FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Workers: members can view workers in their orgs
CREATE POLICY "Org members can view workers"
  ON workers FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

-- Workers: admins/managers can insert workers
CREATE POLICY "Org admins can insert workers"
  ON workers FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

-- Workers: admins/managers can update workers
CREATE POLICY "Org admins can update workers"
  ON workers FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role IN ('ORG_ADMIN', 'MANAGER')
    )
  );

-- Workers: admins can delete workers
CREATE POLICY "Org admins can delete workers"
  ON workers FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );
