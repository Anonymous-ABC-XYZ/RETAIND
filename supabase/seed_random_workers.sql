-- Seed random workers for the demo organization
-- Run this via Supabase SQL editor

-- First ensure regions exist
INSERT INTO regions (id, organisation_id, name, code, description, is_active)
VALUES
  ('00000000-0000-0000-0002-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'North West', 'NW', 'Covers Manchester, Liverpool, and surrounding areas', true),
  ('00000000-0000-0000-0002-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'South East', 'SE', 'Covers London, Kent, Surrey, and Sussex', true),
  ('00000000-0000-0000-0002-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Midlands', 'MID', 'Covers Birmingham, Nottingham, and Leicester', true),
  ('00000000-0000-0000-0002-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'London', 'LON', 'Greater London area', true)
ON CONFLICT (id) DO NOTHING;

-- Then ensure teams exist
INSERT INTO teams (id, organisation_id, region_id, name, code, is_active)
VALUES
  -- North West teams
  ('00000000-0000-0000-0003-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000001'::uuid, 'Electrical - NW', 'ELEC-NW', true),
  ('00000000-0000-0000-0003-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000001'::uuid, 'Mechanical - NW', 'MECH-NW', true),
  ('00000000-0000-0000-0003-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000001'::uuid, 'HVAC - NW', 'HVAC-NW', true),
  -- South East teams
  ('00000000-0000-0000-0003-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000002'::uuid, 'Electrical - SE', 'ELEC-SE', true),
  ('00000000-0000-0000-0003-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000002'::uuid, 'Mechanical - SE', 'MECH-SE', true),
  ('00000000-0000-0000-0003-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000002'::uuid, 'Plumbing - SE', 'PLMB-SE', true),
  -- Midlands teams
  ('00000000-0000-0000-0003-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000003'::uuid, 'Electrical - Midlands', 'ELEC-MID', true),
  ('00000000-0000-0000-0003-000000000008'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000003'::uuid, 'Mechanical - Midlands', 'MECH-MID', true),
  ('00000000-0000-0000-0003-000000000009'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000003'::uuid, 'Fire Systems - Midlands', 'FIRE-MID', true),
  -- London teams
  ('00000000-0000-0000-0003-000000000010'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000004'::uuid, 'Electrical - London', 'ELEC-LON', true),
  ('00000000-0000-0000-0003-000000000011'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000004'::uuid, 'Mechanical - London', 'MECH-LON', true),
  ('00000000-0000-0000-0003-000000000012'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0002-000000000004'::uuid, 'BMS - London', 'BMS-LON', true)
ON CONFLICT (id) DO NOTHING;

-- Now seed 100 random workers
DO $$
DECLARE
  org_id UUID := '00000000-0000-0000-0000-000000000001';
  worker_id UUID;
  first_names TEXT[] := ARRAY['Oliver', 'George', 'Arthur', 'Noah', 'Muhammad', 'Leo', 'Oscar', 'Harry', 'Archie', 'Jack', 'Henry', 'Charlie', 'Freddie', 'Theo', 'Thomas', 'Alfie', 'Jacob', 'James', 'William', 'Lucas', 'Edward', 'Ethan', 'Alexander', 'Joseph', 'Samuel', 'Daniel', 'Adam', 'Mohammed', 'David', 'Ryan', 'Ben', 'Luke', 'Sophie', 'Emily', 'Olivia', 'Amelia', 'Isla', 'Ava', 'Mia', 'Grace', 'Freya', 'Lily', 'Ella', 'Charlotte', 'Sophia', 'Isabella', 'Evelyn', 'Harper', 'Jessica', 'Emma', 'Hannah', 'Eleanor', 'Alice', 'Ruby', 'Lucy', 'Chloe'];
  last_names TEXT[] := ARRAY['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Johnson', 'Roberts', 'Robinson', 'Thompson', 'Wright', 'Walker', 'White', 'Edwards', 'Hughes', 'Green', 'Hall', 'Lewis', 'Harris', 'Clarke', 'Patel', 'Jackson', 'Wood', 'Turner', 'Martin', 'Cooper', 'Hill', 'Ward', 'Morris', 'Moore', 'Clark', 'Lee', 'King', 'Baker', 'Harrison', 'Morgan', 'Allen', 'James', 'Scott', 'Adams', 'Mitchell', 'Phillips', 'Campbell', 'Parker', 'Collins', 'Stewart', 'Murphy', 'Cook', 'Rogers', 'Bell', 'Kelly', 'Murray', 'Price'];
  team_ids UUID[] := ARRAY[
    '00000000-0000-0000-0003-000000000001'::uuid, '00000000-0000-0000-0003-000000000002'::uuid, '00000000-0000-0000-0003-000000000003'::uuid,
    '00000000-0000-0000-0003-000000000004'::uuid, '00000000-0000-0000-0003-000000000005'::uuid, '00000000-0000-0000-0003-000000000006'::uuid,
    '00000000-0000-0000-0003-000000000007'::uuid, '00000000-0000-0000-0003-000000000008'::uuid, '00000000-0000-0000-0003-000000000009'::uuid,
    '00000000-0000-0000-0003-000000000010'::uuid, '00000000-0000-0000-0003-000000000011'::uuid, '00000000-0000-0000-0003-000000000012'::uuid
  ];
  region_ids UUID[] := ARRAY[
    '00000000-0000-0000-0002-000000000001'::uuid, '00000000-0000-0000-0002-000000000001'::uuid, '00000000-0000-0000-0002-000000000001'::uuid,
    '00000000-0000-0000-0002-000000000002'::uuid, '00000000-0000-0000-0002-000000000002'::uuid, '00000000-0000-0000-0002-000000000002'::uuid,
    '00000000-0000-0000-0002-000000000003'::uuid, '00000000-0000-0000-0002-000000000003'::uuid, '00000000-0000-0000-0002-000000000003'::uuid,
    '00000000-0000-0000-0002-000000000004'::uuid, '00000000-0000-0000-0002-000000000004'::uuid, '00000000-0000-0000-0002-000000000004'::uuid
  ];
  trades TEXT[] := ARRAY['Electrical', 'Mechanical', 'HVAC', 'Electrical', 'Mechanical', 'Plumbing', 'Electrical', 'Mechanical', 'Fire Systems', 'Electrical', 'Mechanical', 'BMS'];
  job_titles_electrical TEXT[] := ARRAY['Electrician', 'Senior Electrician', 'Lead Electrician', 'Electrical Engineer', 'Apprentice Electrician'];
  job_titles_mechanical TEXT[] := ARRAY['Mechanical Engineer', 'Pipefitter', 'Mechanical Fitter', 'Senior Mechanical Engineer', 'Apprentice Pipefitter'];
  job_titles_hvac TEXT[] := ARRAY['HVAC Engineer', 'HVAC Technician', 'Senior HVAC Engineer', 'HVAC Apprentice'];
  job_titles_plumbing TEXT[] := ARRAY['Plumber', 'Senior Plumber', 'Lead Plumber', 'Apprentice Plumber'];
  job_titles_fire TEXT[] := ARRAY['Fire Systems Engineer', 'Fire Alarm Technician', 'Fire Systems Apprentice', 'Sprinkler Fitter'];
  job_titles_bms TEXT[] := ARRAY['BMS Engineer', 'BMS Technician', 'Senior BMS Engineer', 'BMS Apprentice'];
  statuses worker_status[] := ARRAY['active', 'active', 'active', 'active', 'active', 'active', 'onboarding', 'onboarding', 'probation', 'suspended']::worker_status[];
  employment_types employment_type[] := ARRAY['full_time', 'full_time', 'full_time', 'full_time', 'part_time', 'contract', 'apprentice', 'casual', 'agency', 'full_time']::employment_type[];
  cscs_types TEXT[] := ARRAY['Gold', 'Blue', 'Green Trainee', 'Red Provisional', 'Black Manager', 'White Professional'];
  cities TEXT[] := ARRAY['Manchester', 'Liverpool', 'Birmingham', 'London', 'Leeds', 'Sheffield', 'Bristol', 'Nottingham', 'Leicester', 'Newcastle'];
  streets TEXT[] := ARRAY['High Street', 'Church Road', 'Station Road', 'Victoria Road', 'Park Road', 'London Road', 'Mill Lane', 'Main Street', 'Green Lane', 'Oak Avenue'];

  i INTEGER;
  first_name TEXT;
  last_name TEXT;
  team_idx INTEGER;
  team_id UUID;
  region_id UUID;
  trade TEXT;
  job_title TEXT;
  status worker_status;
  emp_type employment_type;
  start_date DATE;
  risk_score INTEGER;
  risk_level TEXT;
  has_cscs BOOLEAN;
  cscs_type TEXT;
  cscs_expiry DATE;
  cscs_number TEXT;
  probation_end DATE;
  hourly_rate DECIMAL;
  day_rate DECIMAL;
  is_apprentice BOOLEAN;
  is_senior BOOLEAN;
BEGIN
  FOR i IN 1..100 LOOP
    -- Generate deterministic UUID based on index
    worker_id := ('00000000-0000-0000-0001-' || lpad(i::text, 12, '0'))::uuid;

    -- Random selections
    first_name := first_names[1 + floor(random() * array_length(first_names, 1))::int];
    last_name := last_names[1 + floor(random() * array_length(last_names, 1))::int];
    team_idx := 1 + floor(random() * 12)::int;
    team_id := team_ids[team_idx];
    region_id := region_ids[team_idx];
    trade := trades[team_idx];

    -- Select job title based on trade
    CASE trade
      WHEN 'Electrical' THEN job_title := job_titles_electrical[1 + floor(random() * array_length(job_titles_electrical, 1))::int];
      WHEN 'Mechanical' THEN job_title := job_titles_mechanical[1 + floor(random() * array_length(job_titles_mechanical, 1))::int];
      WHEN 'HVAC' THEN job_title := job_titles_hvac[1 + floor(random() * array_length(job_titles_hvac, 1))::int];
      WHEN 'Plumbing' THEN job_title := job_titles_plumbing[1 + floor(random() * array_length(job_titles_plumbing, 1))::int];
      WHEN 'Fire Systems' THEN job_title := job_titles_fire[1 + floor(random() * array_length(job_titles_fire, 1))::int];
      WHEN 'BMS' THEN job_title := job_titles_bms[1 + floor(random() * array_length(job_titles_bms, 1))::int];
      ELSE job_title := 'Electrician';
    END CASE;

    is_apprentice := job_title ILIKE '%apprentice%';
    is_senior := job_title ILIKE '%senior%' OR job_title ILIKE '%lead%';

    -- Status and employment type
    status := statuses[1 + floor(random() * array_length(statuses, 1))::int];

    IF is_apprentice THEN
      emp_type := 'apprentice'::employment_type;
    ELSE
      emp_type := employment_types[1 + floor(random() * array_length(employment_types, 1))::int];
    END IF;

    -- Dates
    start_date := DATE '2016-01-01' + (random() * 3287)::int;

    -- Risk score
    risk_score := floor(random() * 30)::int;
    IF status = 'onboarding' THEN risk_score := risk_score + 20 + floor(random() * 20)::int; END IF;
    IF status = 'probation' THEN risk_score := risk_score + 30 + floor(random() * 20)::int; END IF;
    IF status = 'suspended' THEN risk_score := risk_score + 60 + floor(random() * 20)::int; END IF;
    IF is_apprentice THEN risk_score := risk_score + floor(random() * 15)::int; END IF;
    IF risk_score > 100 THEN risk_score := 100; END IF;

    -- Risk level
    IF risk_score >= 70 THEN risk_level := 'critical';
    ELSIF risk_score >= 50 THEN risk_level := 'high';
    ELSIF risk_score >= 25 THEN risk_level := 'medium';
    ELSE risk_level := 'low';
    END IF;

    -- CSCS card
    has_cscs := random() > 0.15;
    IF has_cscs THEN
      IF is_apprentice THEN
        cscs_type := 'Green Trainee';
      ELSE
        cscs_type := cscs_types[1 + floor(random() * array_length(cscs_types, 1))::int];
      END IF;
      cscs_expiry := start_date + INTERVAL '5 years';
      cscs_number := 'CSCS' || (100000000 + floor(random() * 899999999)::bigint)::text;
    ELSE
      cscs_type := NULL;
      cscs_expiry := NULL;
      cscs_number := NULL;
    END IF;

    -- Probation end date
    IF status IN ('onboarding', 'probation') THEN
      probation_end := start_date + INTERVAL '90 days';
    ELSE
      probation_end := NULL;
    END IF;

    -- Rates
    IF is_apprentice THEN
      hourly_rate := 8 + floor(random() * 5)::int;
      day_rate := NULL;
    ELSIF is_senior THEN
      hourly_rate := 25 + floor(random() * 16)::int;
      day_rate := 200 + floor(random() * 151)::int;
    ELSE
      hourly_rate := 15 + floor(random() * 14)::int;
      day_rate := 120 + floor(random() * 101)::int;
    END IF;

    -- Insert worker
    INSERT INTO workers (
      id, organisation_id, team_id, region_id,
      first_name, last_name, email, phone, date_of_birth,
      address, city, postcode,
      emergency_contact_name, emergency_contact_phone,
      employee_number, job_title, trade, status, employment_type,
      start_date, probation_end_date,
      cscs_card_number, cscs_card_type, cscs_expiry_date, ni_number,
      hourly_rate, day_rate, risk_score, risk_level
    ) VALUES (
      worker_id, org_id, team_id, region_id,
      first_name, last_name,
      lower(first_name) || '.' || lower(last_name) || (1 + floor(random() * 99)::int)::text || '@northfield-me.com',
      '+44 7' || (700 + floor(random() * 300)::int)::text || ' ' || (100000 + floor(random() * 900000)::int)::text,
      DATE '1960-01-01' + (random() * 17167)::int,
      (1 + floor(random() * 200)::int)::text || ' ' || streets[1 + floor(random() * array_length(streets, 1))::int],
      cities[1 + floor(random() * array_length(cities, 1))::int],
      chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int) || (1 + floor(random() * 20)::int)::text || ' ' || (1 + floor(random() * 9)::int)::text || chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int),
      first_names[1 + floor(random() * array_length(first_names, 1))::int] || ' ' || last_names[1 + floor(random() * array_length(last_names, 1))::int],
      '+44 7' || (700 + floor(random() * 300)::int)::text || ' ' || (100000 + floor(random() * 900000)::int)::text,
      CASE floor(random() * 3)::int WHEN 0 THEN 'NME' WHEN 1 THEN 'EMP' ELSE 'WKR' END || '-' || (1000 + floor(random() * 9000)::int)::text,
      job_title, trade, status, emp_type,
      start_date, probation_end,
      cscs_number, cscs_type, cscs_expiry,
      chr(65 + floor(random() * 19)::int) || chr(65 + floor(random() * 19)::int) || (10 + floor(random() * 90)::int)::text || (10 + floor(random() * 90)::int)::text || (10 + floor(random() * 90)::int)::text || chr(65 + floor(random() * 4)::int),
      hourly_rate, day_rate, risk_score, risk_level
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      date_of_birth = EXCLUDED.date_of_birth,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      postcode = EXCLUDED.postcode,
      emergency_contact_name = EXCLUDED.emergency_contact_name,
      emergency_contact_phone = EXCLUDED.emergency_contact_phone,
      employee_number = EXCLUDED.employee_number,
      job_title = EXCLUDED.job_title,
      trade = EXCLUDED.trade,
      status = EXCLUDED.status,
      employment_type = EXCLUDED.employment_type,
      start_date = EXCLUDED.start_date,
      probation_end_date = EXCLUDED.probation_end_date,
      cscs_card_number = EXCLUDED.cscs_card_number,
      cscs_card_type = EXCLUDED.cscs_card_type,
      cscs_expiry_date = EXCLUDED.cscs_expiry_date,
      ni_number = EXCLUDED.ni_number,
      hourly_rate = EXCLUDED.hourly_rate,
      day_rate = EXCLUDED.day_rate,
      risk_score = EXCLUDED.risk_score,
      risk_level = EXCLUDED.risk_level,
      updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Successfully seeded 100 random workers!';
END $$;

-- Verify the seed
SELECT 'Workers seeded:' as info, COUNT(*) as count FROM workers WHERE organisation_id = '00000000-0000-0000-0000-000000000001';
SELECT status, COUNT(*) as count FROM workers WHERE organisation_id = '00000000-0000-0000-0000-000000000001' GROUP BY status ORDER BY count DESC;
