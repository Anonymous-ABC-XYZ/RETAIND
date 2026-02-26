-- Migration 001: Core Auth & Organizations
-- Tables: profiles, organisations, user_organisations, super_admins
-- Trigger: handle_new_user() on auth.users insert

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create org_role enum (idempotent)
DO $$ BEGIN
    CREATE TYPE org_role AS ENUM ('ORG_ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATIVE', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Organisations table
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    industry TEXT,
    address TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT DEFAULT 'United Kingdom',
    phone TEXT,
    website TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    max_workers INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User-Organisation relationship (many-to-many with role)
CREATE TABLE IF NOT EXISTS user_organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'VIEWER',
    is_primary BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, organisation_id)
);

-- Super admins table (platform-level admins)
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for new user (idempotent - handle if profile already exists)
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup (drop first to make idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers (drop first to make idempotent)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organisations_updated_at ON organisations;
CREATE TRIGGER update_organisations_updated_at
    BEFORE UPDATE ON organisations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_organisations_user_id ON user_organisations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organisations_organisation_id ON user_organisations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_organisations_slug ON organisations(slug);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (drop first to make idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view profiles in same org" ON profiles;
CREATE POLICY "Users can view profiles in same org"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations uo1
            JOIN user_organisations uo2 ON uo1.organisation_id = uo2.organisation_id
            WHERE uo1.user_id = auth.uid() AND uo2.user_id = profiles.id
        )
    );

-- RLS Policies for organisations
DROP POLICY IF EXISTS "Users can view organisations they belong to" ON organisations;
CREATE POLICY "Users can view organisations they belong to"
    ON organisations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid() AND organisation_id = organisations.id
        )
    );

DROP POLICY IF EXISTS "Org admins can update their organisations" ON organisations;
CREATE POLICY "Org admins can update their organisations"
    ON organisations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = organisations.id
            AND role = 'ORG_ADMIN'
        )
    );

-- RLS Policies for user_organisations
DROP POLICY IF EXISTS "Users can view their own memberships" ON user_organisations;
CREATE POLICY "Users can view their own memberships"
    ON user_organisations FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view memberships in their org" ON user_organisations;
CREATE POLICY "Users can view memberships in their org"
    ON user_organisations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations uo
            WHERE uo.user_id = auth.uid() AND uo.organisation_id = user_organisations.organisation_id
        )
    );

DROP POLICY IF EXISTS "Org admins can manage memberships" ON user_organisations;
CREATE POLICY "Org admins can manage memberships"
    ON user_organisations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations uo
            WHERE uo.user_id = auth.uid()
            AND uo.organisation_id = user_organisations.organisation_id
            AND uo.role = 'ORG_ADMIN'
        )
    );

-- RLS Policies for super_admins
DROP POLICY IF EXISTS "Super admins can view super_admins table" ON super_admins;
CREATE POLICY "Super admins can view super_admins table"
    ON super_admins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM super_admins sa WHERE sa.user_id = auth.uid()
        )
    );
