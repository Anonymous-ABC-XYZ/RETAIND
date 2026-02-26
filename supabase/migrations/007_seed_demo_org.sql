-- ============================================================
-- Migration 007: Seed Demo Organization
-- ============================================================
-- Creates the demo org "Northfield Mechanical & Electrical"
-- with a fixed UUID and an invite for demo@retaind.app
-- ============================================================

-- Create the demo organisation with a known UUID
INSERT INTO organisations (id, name, slug, industry)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Northfield Mechanical & Electrical',
  'northfield-me',
  'Construction & Engineering'
)
ON CONFLICT (id) DO NOTHING;

-- Create an org invite for the demo user
-- When demo@retaind.app signs up, handle_new_user() will
-- auto-accept this invite and grant ORG_ADMIN access
INSERT INTO org_invites (organisation_id, email, role, expires_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@retaind.app',
  'ORG_ADMIN',
  NULL  -- never expires
)
ON CONFLICT (organisation_id, email) DO NOTHING;
