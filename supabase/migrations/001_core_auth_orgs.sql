-- ============================================================
-- Migration 001: Core Auth & Organizations
-- ============================================================
-- Tables: profiles, organisations, user_organisations, super_admins
-- Trigger: handle_new_user() on auth.users insert
-- RLS policies for org-scoped access
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_org_role AS ENUM (
  'ORG_ADMIN',
  'MANAGER',
  'TEAM_LEADER',
  'OPERATIVE',
  'VIEWER'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles: mirrors auth.users with extra fields
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organisations: multi-tenant root entity
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User-Organisation membership (many-to-many with role)
CREATE TABLE user_organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  role user_org_role NOT NULL DEFAULT 'VIEWER',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organisation_id)
);

-- Super admins: platform-level admins (not org-scoped)
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_organisations_user ON user_organisations(user_id);
CREATE INDEX idx_user_organisations_org ON user_organisations(organisation_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_organisations_updated_at
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- HANDLE NEW USER TRIGGER
-- ============================================================
-- Automatically creates a profile row when a new auth user signs up.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles: users can view profiles of org members they share an org with
CREATE POLICY "Users can view org member profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT uo.user_id FROM user_organisations uo
      WHERE uo.organisation_id IN (
        SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
      )
    )
  );

-- Organisations: users can view orgs they belong to
CREATE POLICY "Users can view their organisations"
  ON organisations FOR SELECT
  USING (
    id IN (
      SELECT organisation_id FROM user_organisations WHERE user_id = auth.uid()
    )
  );

-- Organisations: org admins can update their orgs
CREATE POLICY "Org admins can update organisations"
  ON organisations FOR UPDATE
  USING (
    id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- User-Organisations: users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON user_organisations FOR SELECT
  USING (user_id = auth.uid());

-- User-Organisations: org admins can view all memberships in their orgs
CREATE POLICY "Org admins can view org memberships"
  ON user_organisations FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- User-Organisations: org admins can insert memberships
CREATE POLICY "Org admins can add org members"
  ON user_organisations FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- User-Organisations: org admins can update memberships
CREATE POLICY "Org admins can update org members"
  ON user_organisations FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  )
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- User-Organisations: org admins can delete memberships
CREATE POLICY "Org admins can remove org members"
  ON user_organisations FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Super admins: only super admins can view
CREATE POLICY "Super admins can view super_admins"
  ON super_admins FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.uid() IN (SELECT user_id FROM super_admins)
  );
