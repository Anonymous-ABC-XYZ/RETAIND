-- Migration 006: Helper Functions
-- Function: calculate_worker_risk_score
-- Update handle_new_user() to auto-accept org invites

-- Function to calculate worker risk score
CREATE OR REPLACE FUNCTION calculate_worker_risk_score(worker_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    score INTEGER := 0;
    risk_level TEXT;
    open_issues_count INTEGER;
    critical_issues_count INTEGER;
    high_issues_count INTEGER;
    overdue_tasks_count INTEGER;
    onboarding_progress INTEGER;
    days_since_start INTEGER;
    worker_record workers%ROWTYPE;
BEGIN
    -- Get worker record
    SELECT * INTO worker_record FROM workers WHERE id = worker_uuid;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Worker not found');
    END IF;

    -- Count open issues by severity
    SELECT COUNT(*) INTO open_issues_count
    FROM issues
    WHERE worker_id = worker_uuid
    AND status NOT IN ('resolved', 'closed');

    SELECT COUNT(*) INTO critical_issues_count
    FROM issues
    WHERE worker_id = worker_uuid
    AND status NOT IN ('resolved', 'closed')
    AND severity = 'critical';

    SELECT COUNT(*) INTO high_issues_count
    FROM issues
    WHERE worker_id = worker_uuid
    AND status NOT IN ('resolved', 'closed')
    AND severity = 'high';

    -- Count overdue onboarding tasks
    SELECT COUNT(*) INTO overdue_tasks_count
    FROM assigned_tasks at
    JOIN onboarding_assignments oa ON oa.id = at.assignment_id
    WHERE oa.worker_id = worker_uuid
    AND at.status IN ('pending', 'in_progress')
    AND at.due_date < CURRENT_DATE;

    -- Get onboarding progress
    SELECT COALESCE(progress_percentage, 100) INTO onboarding_progress
    FROM onboarding_assignments
    WHERE worker_id = worker_uuid
    AND status = 'in_progress'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Calculate days since start
    days_since_start := CURRENT_DATE - worker_record.start_date;

    -- Calculate risk score
    -- Base score from open issues (5 points each)
    score := score + (open_issues_count * 5);

    -- Critical issues add extra 15 points each
    score := score + (critical_issues_count * 15);

    -- High severity issues add extra 10 points each
    score := score + (high_issues_count * 10);

    -- Overdue tasks (10 points each)
    score := score + (overdue_tasks_count * 10);

    -- Onboarding progress factor (if in onboarding, low progress = higher risk)
    IF worker_record.status = 'onboarding' AND onboarding_progress IS NOT NULL THEN
        -- Add up to 25 points based on incomplete onboarding
        score := score + ((100 - onboarding_progress) / 4);
    END IF;

    -- New employee factor (extra risk for first 90 days)
    IF days_since_start < 90 THEN
        score := score + 5;
    END IF;

    -- Probation factor
    IF worker_record.status = 'probation' THEN
        score := score + 10;
    END IF;

    -- Cap score at 100
    score := LEAST(score, 100);

    -- Determine risk level
    risk_level := CASE
        WHEN score >= 75 THEN 'critical'
        WHEN score >= 50 THEN 'high'
        WHEN score >= 25 THEN 'medium'
        ELSE 'low'
    END;

    -- Update worker record
    UPDATE workers
    SET risk_score = score,
        risk_level = risk_level,
        last_risk_assessment = NOW()
    WHERE id = worker_uuid;

    RETURN jsonb_build_object(
        'score', score,
        'level', risk_level,
        'factors', jsonb_build_object(
            'open_issues', open_issues_count,
            'critical_issues', critical_issues_count,
            'high_issues', high_issues_count,
            'overdue_tasks', overdue_tasks_count,
            'onboarding_progress', onboarding_progress,
            'days_since_start', days_since_start
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate all worker risk scores in an org
CREATE OR REPLACE FUNCTION recalculate_org_risk_scores(org_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    worker_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR worker_record IN
        SELECT id FROM workers WHERE organisation_id = org_uuid
    LOOP
        PERFORM calculate_worker_risk_score(worker_record.id);
        updated_count := updated_count + 1;
    END LOOP;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user() to auto-accept pending org invites
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
BEGIN
    -- Create profile for new user (idempotent - handle if profile already exists)
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();

    -- Auto-accept any pending org invites for this email (wrapped in exception handler)
    BEGIN
        FOR invite_record IN
            SELECT id, organisation_id, role FROM org_invites
            WHERE email = NEW.email
            AND status = 'pending'
            AND expires_at > NOW()
        LOOP
            -- Update invite status
            UPDATE org_invites
            SET status = 'accepted', accepted_at = NOW()
            WHERE id = invite_record.id;

            -- Create user_organisation membership
            INSERT INTO user_organisations (user_id, organisation_id, role, is_primary)
            VALUES (NEW.id, invite_record.organisation_id, invite_record.role, FALSE)
            ON CONFLICT (user_id, organisation_id) DO UPDATE
            SET role = EXCLUDED.role;
        END LOOP;
    EXCEPTION
        WHEN undefined_table THEN
            -- org_invites table doesn't exist yet, skip invite processing
            NULL;
        WHEN OTHERS THEN
            -- Log but don't fail user creation for invite issues
            RAISE WARNING 'Error processing org invites for %: %', NEW.email, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard metrics for an org
CREATE OR REPLACE FUNCTION get_org_dashboard_metrics(org_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_workers', (
            SELECT COUNT(*) FROM workers
            WHERE organisation_id = org_uuid
            AND status NOT IN ('terminated', 'resigned')
        ),
        'active_workers', (
            SELECT COUNT(*) FROM workers
            WHERE organisation_id = org_uuid
            AND status = 'active'
        ),
        'onboarding_workers', (
            SELECT COUNT(*) FROM workers
            WHERE organisation_id = org_uuid
            AND status = 'onboarding'
        ),
        'probation_workers', (
            SELECT COUNT(*) FROM workers
            WHERE organisation_id = org_uuid
            AND status = 'probation'
        ),
        'at_risk_workers', (
            SELECT COUNT(*) FROM workers
            WHERE organisation_id = org_uuid
            AND status NOT IN ('terminated', 'resigned')
            AND risk_level IN ('high', 'critical')
        ),
        'open_issues', (
            SELECT COUNT(*) FROM issues
            WHERE organisation_id = org_uuid
            AND status NOT IN ('resolved', 'closed')
        ),
        'critical_issues', (
            SELECT COUNT(*) FROM issues
            WHERE organisation_id = org_uuid
            AND status NOT IN ('resolved', 'closed')
            AND severity = 'critical'
        ),
        'overdue_tasks', (
            SELECT COUNT(*) FROM assigned_tasks at
            JOIN onboarding_assignments oa ON oa.id = at.assignment_id
            WHERE oa.organisation_id = org_uuid
            AND at.status IN ('pending', 'in_progress')
            AND at.due_date < CURRENT_DATE
        ),
        'risk_distribution', (
            SELECT jsonb_build_object(
                'low', COUNT(*) FILTER (WHERE risk_level = 'low'),
                'medium', COUNT(*) FILTER (WHERE risk_level = 'medium'),
                'high', COUNT(*) FILTER (WHERE risk_level = 'high'),
                'critical', COUNT(*) FILTER (WHERE risk_level = 'critical')
            )
            FROM workers
            WHERE organisation_id = org_uuid
            AND status NOT IN ('terminated', 'resigned')
        ),
        'issues_by_type', (
            SELECT jsonb_object_agg(issue_type, count)
            FROM (
                SELECT issue_type::TEXT, COUNT(*) as count
                FROM issues
                WHERE organisation_id = org_uuid
                AND status NOT IN ('resolved', 'closed')
                GROUP BY issue_type
            ) t
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate risk when issues change
CREATE OR REPLACE FUNCTION trigger_recalculate_risk_on_issue()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_worker_risk_score(OLD.worker_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_worker_risk_score(NEW.worker_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_issue_change_recalculate_risk ON issues;
CREATE TRIGGER on_issue_change_recalculate_risk
    AFTER INSERT OR UPDATE OR DELETE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_risk_on_issue();

-- Trigger to recalculate risk when tasks change
CREATE OR REPLACE FUNCTION trigger_recalculate_risk_on_task()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_worker_risk_score(OLD.worker_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_worker_risk_score(NEW.worker_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_task_change_recalculate_risk ON assigned_tasks;
CREATE TRIGGER on_task_change_recalculate_risk
    AFTER INSERT OR UPDATE OR DELETE ON assigned_tasks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_risk_on_task();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_worker_risk_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_dashboard_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_org_invite(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION decline_org_invite(TEXT) TO authenticated;
