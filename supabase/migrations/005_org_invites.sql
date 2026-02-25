-- ============================================================
-- Migration 005: Org Invites
-- ============================================================
-- Table: org_invites
-- Allows org admins to invite users by email before they sign up
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE org_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_org_role NOT NULL DEFAULT 'VIEWER',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, email)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_org_invites_org ON org_invites(organisation_id);
CREATE INDEX idx_org_invites_email ON org_invites(email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- Org admins can view invites for their orgs
CREATE POLICY "Org admins can view invites"
  ON org_invites FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
    OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Org admins can create invites
CREATE POLICY "Org admins can insert invites"
  ON org_invites FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Org admins can update invites (e.g., change role)
CREATE POLICY "Org admins can update invites"
  ON org_invites FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );

-- Org admins can delete invites
CREATE POLICY "Org admins can delete invites"
  ON org_invites FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM user_organisations
      WHERE user_id = auth.uid() AND role = 'ORG_ADMIN'
    )
  );
