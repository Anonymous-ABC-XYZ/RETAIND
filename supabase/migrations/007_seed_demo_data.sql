-- Migration 007: Seed Demo Organization and User
-- Creates demo org "Northfield Mechanical & Electrical" with ID 00000000-0000-0000-0000-000000000001
-- Creates org invite for demo@retaind.app as ORG_ADMIN

-- Insert demo organization
INSERT INTO organisations (
    id,
    name,
    slug,
    industry,
    address,
    city,
    postcode,
    country,
    phone,
    website,
    subscription_tier,
    subscription_status,
    max_workers,
    settings
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Northfield Mechanical & Electrical',
    'northfield-me',
    'Construction - M&E Contracting',
    '123 Industrial Estate',
    'Manchester',
    'M1 1AA',
    'United Kingdom',
    '+44 161 123 4567',
    'https://northfield-me.example.com',
    'professional',
    'active',
    100,
    '{"theme": "default", "notifications": {"email": true, "push": true}}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Create org invite for demo user (idempotent)
-- When demo@retaind.app signs up, handle_new_user() will auto-accept this invite
INSERT INTO org_invites (
    organisation_id,
    email,
    role,
    status,
    message,
    expires_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@retaind.app',
    'ORG_ADMIN',
    'pending',
    'Welcome to the RETAIND demo! You have been granted admin access.',
    NOW() + INTERVAL '365 days'
) ON CONFLICT (organisation_id, email, status) DO UPDATE SET
    expires_at = NOW() + INTERVAL '365 days',
    updated_at = NOW();

-- Note: The demo user (demo@retaind.app / RetaindDemo2025!) should be created via:
-- 1. Supabase Dashboard > Authentication > Users > Add User
-- 2. Or via the app's sign up flow
-- 3. Or via Supabase Auth API

-- When the user is created, the handle_new_user() trigger will:
-- 1. Create a profile for the user
-- 2. Auto-accept the org invite above
-- 3. Add the user to the organisation as ORG_ADMIN
