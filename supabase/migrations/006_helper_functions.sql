-- ============================================================
-- Migration 006: Helper Functions
-- ============================================================
-- Functions:
--   - calculate_worker_risk_score(worker_uuid UUID)
--   - Updated handle_new_user() to auto-accept org invites
-- ============================================================

-- ============================================================
-- RISK SCORE CALCULATION FUNCTION
-- ============================================================
-- Calculates a 0-100 risk score for a worker based on:
--   - Open issues (5 pts each)
--   - Critical issues (15 pts extra each)
--   - Onboarding progress shortfall (up to 50 pts)
--   - Overdue tasks (10 pts each)

CREATE OR REPLACE FUNCTION calculate_worker_risk_score(worker_uuid UUID)
RETURNS TABLE(score INTEGER, level TEXT) AS $$
DECLARE
  v_score INTEGER := 0;
  v_open_issues INTEGER;
  v_critical_issues INTEGER;
  v_onboarding_progress INTEGER;
  v_overdue_tasks INTEGER;
  v_level TEXT;
BEGIN
  -- Count open issues
  SELECT COUNT(*) INTO v_open_issues
  FROM issues
  WHERE worker_id = worker_uuid
    AND status NOT IN ('resolved', 'closed');

  v_score := v_score + (v_open_issues * 5);

  -- Count critical open issues (extra weight)
  SELECT COUNT(*) INTO v_critical_issues
  FROM issues
  WHERE worker_id = worker_uuid
    AND status NOT IN ('resolved', 'closed')
    AND severity = 'critical';

  v_score := v_score + (v_critical_issues * 15);

  -- Onboarding progress (lower progress = higher risk)
  SELECT COALESCE(100 - progress_percentage, 0) / 2 INTO v_onboarding_progress
  FROM onboarding_assignments
  WHERE worker_id = worker_uuid
    AND completed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  v_score := v_score + COALESCE(v_onboarding_progress, 0);

  -- Overdue tasks
  SELECT COUNT(*) INTO v_overdue_tasks
  FROM assigned_tasks at
  JOIN onboarding_assignments oa ON oa.id = at.assignment_id
  WHERE oa.worker_id = worker_uuid
    AND at.status IN ('pending', 'in_progress')
    AND at.due_date < CURRENT_DATE;

  v_score := v_score + (v_overdue_tasks * 10);

  -- Cap at 100
  v_score := LEAST(v_score, 100);

  -- Determine level
  v_level := CASE
    WHEN v_score >= 75 THEN 'critical'
    WHEN v_score >= 50 THEN 'high'
    WHEN v_score >= 25 THEN 'medium'
    ELSE 'low'
  END;

  RETURN QUERY SELECT v_score, v_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- UPDATED handle_new_user() - AUTO-ACCEPT ORG INVITES
-- ============================================================
-- When a new user signs up, check if there's a pending org invite
-- for their email. If so, automatically:
--   1. Create the profile
--   2. Create the user_organisation membership
--   3. Mark the invite as accepted

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- 1. Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );

  -- 2. Check for pending org invites
  FOR v_invite IN
    SELECT * FROM public.org_invites
    WHERE email = NEW.email
      AND accepted_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  LOOP
    -- Create org membership
    INSERT INTO public.user_organisations (user_id, organisation_id, role, is_default)
    VALUES (NEW.id, v_invite.organisation_id, v_invite.role, true)
    ON CONFLICT (user_id, organisation_id) DO NOTHING;

    -- Mark invite as accepted
    UPDATE public.org_invites
    SET accepted_at = now()
    WHERE id = v_invite.id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- UTILITY: Update worker risk scores (batch)
-- ============================================================
-- Call this periodically or after relevant data changes

CREATE OR REPLACE FUNCTION update_all_worker_risk_scores(org_uuid UUID)
RETURNS void AS $$
DECLARE
  v_worker RECORD;
  v_risk RECORD;
BEGIN
  FOR v_worker IN
    SELECT id FROM workers WHERE organisation_id = org_uuid
  LOOP
    SELECT * INTO v_risk FROM calculate_worker_risk_score(v_worker.id);
    UPDATE workers
    SET risk_score = v_risk.score,
        risk_level = v_risk.level
    WHERE id = v_worker.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
