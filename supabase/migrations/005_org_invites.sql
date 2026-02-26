-- Migration 005: Org Invites
-- Table: org_invites

-- Create invite status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE invite_status AS ENUM (
        'pending',
        'accepted',
        'declined',
        'expired',
        'revoked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Organization invites table
CREATE TABLE IF NOT EXISTS org_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role org_role NOT NULL DEFAULT 'VIEWER',
    status invite_status DEFAULT 'pending' NOT NULL,
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    message TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add unique constraint if not exists (handle potential partial creation)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'org_invites_org_email_status_key'
    ) THEN
        ALTER TABLE org_invites ADD CONSTRAINT org_invites_org_email_status_key UNIQUE(organisation_id, email, status);
    END IF;
END $$;

-- Add updated_at trigger (idempotent)
DROP TRIGGER IF EXISTS update_org_invites_updated_at ON org_invites;
CREATE TRIGGER update_org_invites_updated_at
    BEFORE UPDATE ON org_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_org_invites_organisation_id ON org_invites(organisation_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON org_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON org_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_status ON org_invites(status);

-- Enable Row Level Security
ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_invites (idempotent)
DROP POLICY IF EXISTS "Org admins can view invites for their org" ON org_invites;
CREATE POLICY "Org admins can view invites for their org"
    ON org_invites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = org_invites.organisation_id
            AND role = 'ORG_ADMIN'
        )
    );

DROP POLICY IF EXISTS "Users can view invites sent to their email" ON org_invites;
CREATE POLICY "Users can view invites sent to their email"
    ON org_invites FOR SELECT
    USING (
        email = (SELECT email FROM profiles WHERE id = auth.uid())
        AND status = 'pending'
    );

DROP POLICY IF EXISTS "Org admins can create invites" ON org_invites;
CREATE POLICY "Org admins can create invites"
    ON org_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = org_invites.organisation_id
            AND role = 'ORG_ADMIN'
        )
    );

DROP POLICY IF EXISTS "Org admins can update invites (revoke)" ON org_invites;
CREATE POLICY "Org admins can update invites (revoke)"
    ON org_invites FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_organisations
            WHERE user_id = auth.uid()
            AND organisation_id = org_invites.organisation_id
            AND role = 'ORG_ADMIN'
        )
    );

DROP POLICY IF EXISTS "Invited users can accept/decline their invites" ON org_invites;
CREATE POLICY "Invited users can accept/decline their invites"
    ON org_invites FOR UPDATE
    USING (
        email = (SELECT email FROM profiles WHERE id = auth.uid())
        AND status = 'pending'
    );

-- Function to accept an invite
CREATE OR REPLACE FUNCTION accept_org_invite(invite_token TEXT)
RETURNS JSONB AS $$
DECLARE
    invite_record org_invites%ROWTYPE;
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM profiles WHERE id = auth.uid();

    SELECT * INTO invite_record
    FROM org_invites
    WHERE token = invite_token
    AND email = user_email
    AND status = 'pending'
    AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired invite'
        );
    END IF;

    UPDATE org_invites
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invite_record.id;

    INSERT INTO user_organisations (user_id, organisation_id, role, is_primary)
    VALUES (auth.uid(), invite_record.organisation_id, invite_record.role, FALSE)
    ON CONFLICT (user_id, organisation_id) DO UPDATE
    SET role = EXCLUDED.role;

    RETURN jsonb_build_object(
        'success', true,
        'organisation_id', invite_record.organisation_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline an invite
CREATE OR REPLACE FUNCTION decline_org_invite(invite_token TEXT)
RETURNS JSONB AS $$
DECLARE
    invite_record org_invites%ROWTYPE;
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM profiles WHERE id = auth.uid();

    SELECT * INTO invite_record
    FROM org_invites
    WHERE token = invite_token
    AND email = user_email
    AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid invite'
        );
    END IF;

    UPDATE org_invites
    SET status = 'declined', declined_at = NOW()
    WHERE id = invite_record.id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE org_invites
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
