-- Migration 002: Workforce Structure
-- Tables: regions, teams, workers
-- Enums: worker_status, employment_type

-- Create worker_status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE worker_status AS ENUM (
        'active',
        'onboarding',
        'probation',
        'suspended',
        'terminated',
        'resigned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create employment_type enum (idempotent)
DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM (
        'full_time',
        'part_time',
        'contract',
        'apprentice',
        'casual',
        'agency'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organisation_id, name)
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organisation_id, name)
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
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
    date_of_birth DATE,
    address TEXT,
    city TEXT,
    postcode TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    -- Employment info
    employee_number TEXT,
    job_title TEXT NOT NULL,
    trade TEXT,
    status worker_status DEFAULT 'onboarding' NOT NULL,
    employment_type employment_type DEFAULT 'full_time' NOT NULL,
    start_date DATE NOT NULL,
    probation_end_date DATE,
    end_date DATE,

    -- Certifications & qualifications
    cscs_card_number TEXT,
    cscs_card_type TEXT,
    cscs_expiry_date DATE,
    ni_number TEXT,

    -- Work details
    hourly_rate DECIMAL(10, 2),
    day_rate DECIMAL(10, 2),
    line_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Risk tracking
    risk_score INTEGER DEFAULT 0,
    risk_level TEXT DEFAULT 'low',
    last_risk_assessment TIMESTAMPTZ,

    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add updated_at triggers (idempotent)
DROP TRIGGER IF EXISTS update_regions_updated_at ON regions;
CREATE TRIGGER update_regions_updated_at
    BEFORE UPDATE ON regions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workers_updated_at ON workers;
CREATE TRIGGER update_workers_updated_at
    BEFORE UPDATE ON workers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_regions_organisation_id ON regions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_teams_organisation_id ON teams(organisation_id);
CREATE INDEX IF NOT EXISTS idx_teams_region_id ON teams(region_id);
CREATE INDEX IF NOT EXISTS idx_workers_organisation_id ON workers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_workers_team_id ON workers(team_id);
CREATE INDEX IF NOT EXISTS idx_workers_region_id ON workers(region_id);
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_risk_level ON workers(risk_level);

-- Enable Row Level Security
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regions (idempotent)
DROP POLICY IF EXISTS "Users can view regions in their org" ON regions;
CREATE POLICY "Users can view regions in their org"
    ON regions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = regions.organisation_id
        )
    );

DROP POLICY IF EXISTS "Org admins can manage regions" ON regions;
CREATE POLICY "Org admins can manage regions"
    ON regions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = regions.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        )
    );

-- RLS Policies for teams (idempotent)
DROP POLICY IF EXISTS "Users can view teams in their org" ON teams;
CREATE POLICY "Users can view teams in their org"
    ON teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = teams.organisation_id
        )
    );

DROP POLICY IF EXISTS "Org admins and managers can manage teams" ON teams;
CREATE POLICY "Org admins and managers can manage teams"
    ON teams FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = teams.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER')
        )
    );

-- RLS Policies for workers (idempotent)
DROP POLICY IF EXISTS "Users can view workers in their org" ON workers;
CREATE POLICY "Users can view workers in their org"
    ON workers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = workers.organisation_id
        )
    );

DROP POLICY IF EXISTS "Managers and above can manage workers" ON workers;
CREATE POLICY "Managers and above can manage workers"
    ON workers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = workers.organisation_id
            AND role IN ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR')
        )
    );
