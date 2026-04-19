-- Comprehensive Realistic Data Seeding for ServiceSphere
-- Timeframe: Last 3 Months (Approx. Jan 15, 2026 - Apr 15, 2026)

-- Clear existing data in tables to ensure a clean slate
-- Note: This is destructive. Do not run on a production database with valuable data.
TRUNCATE TABLE public.ratings, public.penalties, public.performance_records, public.issues, public.contracts, public.services RESTART IDENTITY CASCADE;
-- Profiles are linked to auth.users, so we'll update them instead of truncating.

DO $$
DECLARE
    -- Timestamps for the last 3 months
    three_months_ago TIMESTAMPTZ := NOW() - INTERVAL '3 months';
    now_time TIMESTAMPTZ := NOW();

    -- Client and Vendor IDs
    client1_id UUID;
    client2_id UUID;
    client3_id UUID;
    vendor1_id UUID;
    vendor2_id UUID;
    vendor3_id UUID;
    vendor4_id UUID;

    -- Service IDs
    service1_id UUID;
    service2_id UUID;
    service3_id UUID;
    service4_id UUID;
    service5_id UUID;
    service6_id UUID;
    service7_id UUID;
    service8_id UUID;

    -- Contract IDs
    contract1_id UUID;
    contract2_id UUID;
    contract3_id UUID;
    contract4_id UUID;
    contract5_id UUID;
    contract6_id UUID;
    contract7_id UUID;

    -- Issue variables
    issue_raised_at TIMESTAMPTZ;
    ai_resp_time INT;
    ai_res_time INT;
    actual_resp_time INT;
    actual_res_time INT;
    sla_violated_bool BOOLEAN;

BEGIN
    -- Step 1: Get existing profile IDs for clients and vendors
    -- This assumes you have already created these users in Supabase auth
    SELECT id INTO client1_id FROM public.profiles WHERE email = 'jordan@retailcorp.com';
    SELECT id INTO client2_id FROM public.profiles WHERE email = 'casey@healthfirst.org';
    SELECT id INTO client3_id FROM public.profiles WHERE email = 'alex@financeinc.com';
    SELECT id INTO vendor1_id FROM public.profiles WHERE email = 'support@cloudserve.net';
    SELECT id INTO vendor2_id FROM public.profiles WHERE email = 'contact@datasecure.io';
    SELECT id INTO vendor3_id FROM public.profiles WHERE email = 'admin@webhostpro.com';
    SELECT id INTO vendor4_id FROM public.profiles WHERE email = 'help@itsolutions.tech';

    -- Step 2: Create Services for Vendors
    INSERT INTO public.services (vendor_id, name, description, category, price) VALUES
    (vendor1_id, 'Cloud Storage Solutions', 'Scalable and secure cloud storage for enterprise.', 'Cloud Services', 5000),
    (vendor1_id, 'Managed Kubernetes', 'Fully managed Kubernetes cluster for container orchestration.', 'Cloud Services', 8000),
    (vendor2_id, 'Cybersecurity Audit', 'Comprehensive security audit and penetration testing.', 'Security', 12000),
    (vendor2_id, '24/7 Network Monitoring', 'Real-time network monitoring and threat detection.', 'Security', 6000),
    (vendor3_id, 'Enterprise Web Hosting', 'High-performance web hosting with 99.99% uptime guarantee.', 'Web Services', 3000),
    (vendor3_id, 'Domain Management', 'DNS and domain registration services.', 'Web Services', 500),
    (vendor4_id, 'IT Helpdesk Support', 'On-demand IT support for corporate environments.', 'IT Support', 4000),
    (vendor4_id, 'Hardware Procurement', 'Procurement and setup of IT hardware.', 'IT Support', 10000)
    RETURNING id, id, id, id, id, id, id, id INTO service1_id, service2_id, service3_id, service4_id, service5_id, service6_id, service7_id, service8_id;

    -- Step 3: Create Contracts between Clients and Vendors
    -- Contract 1: Client 1 & Vendor 1 (Active)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client1_id, vendor1_id, service1_id, 'active', 12, 60000, three_months_ago, three_months_ago + INTERVAL '12 months')
    RETURNING id INTO contract1_id;

    -- Contract 2: Client 1 & Vendor 2 (Active)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client1_id, vendor2_id, service3_id, 'active', 6, 72000, three_months_ago + INTERVAL '1 month', three_months_ago + INTERVAL '7 months')
    RETURNING id INTO contract2_id;

    -- Contract 3: Client 2 & Vendor 3 (Pending)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client2_id, vendor3_id, service5_id, 'pending', 24, 72000, now_time, now_time + INTERVAL '24 months')
    RETURNING id INTO contract3_id;

    -- Contract 4: Client 2 & Vendor 4 (Active)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client2_id, vendor4_id, service7_id, 'active', 12, 48000, three_months_ago + INTERVAL '10 days', three_months_ago + INTERVAL '12 months 10 days')
    RETURNING id INTO contract4_id;

    -- Contract 5: Client 3 & Vendor 1 (Rejected)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client3_id, vendor1_id, service2_id, 'rejected', 12, 96000, now_time, now_time + INTERVAL '12 months');

    -- Contract 6: Client 3 & Vendor 2 (Active)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client3_id, vendor2_id, service4_id, 'active', 12, 72000, three_months_ago, three_months_ago + INTERVAL '12 months')
    RETURNING id INTO contract6_id;

    -- Contract 7: Client 1 & Vendor 4 (Completed)
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client1_id, vendor4_id, service8_id, 'completed', 3, 30000, three_months_ago - INTERVAL '1 month', three_months_ago + INTERVAL '2 months')
    RETURNING id INTO contract7_id;

    -- Step 4: Generate Issues for Active Contracts
    -- Loop to create multiple issues
    FOR i IN 1..20 LOOP
        -- Randomly select a contract
        CASE (i % 4)
            WHEN 0 THEN
                contract1_id := contract1_id;
            WHEN 1 THEN
                contract1_id := contract2_id;
            WHEN 2 THEN
                contract1_id := contract4_id;
            ELSE
                contract1_id := contract6_id;
        END CASE;

        -- Generate issue details
        issue_raised_at := three_months_ago + (random() * (now_time - three_months_ago));
        ai_resp_time := 30 + floor(random() * 30); -- 30-60 mins
        ai_res_time := 120 + floor(random() * 240); -- 2-6 hours

        -- Simulate SLA violations (25% chance)
        sla_violated_bool := random() < 0.25;
        IF sla_violated_bool THEN
            actual_resp_time := ai_resp_time + floor(random() * 30); -- Violate response SLA
            actual_res_time := ai_res_time + floor(random() * 120); -- Violate resolution SLA
        ELSE
            actual_resp_time := ai_resp_time - floor(random() * 15); -- Meet response SLA
            actual_res_time := ai_res_time - floor(random() * 60); -- Meet resolution SLA
        END IF;

        INSERT INTO public.issues (
            contract_id, client_id, vendor_id, title, description, priority, status,
            service_type, ai_response_time_minutes, ai_resolution_time_minutes,
            actual_response_time_minutes, actual_resolution_time_minutes, sla_violated,
            raised_at, resolved_at
        )
        SELECT
            c.id, c.client_id, c.vendor_id,
            'Issue #' || i || ' on ' || s.name,
            'Details for issue #' || i || ': performance degradation observed.',
            (ARRAY['low', 'medium', 'high', 'critical'])[floor(random() * 4) + 1]::issue_priority,
            'resolved',
            s.category,
            ai_resp_time,
            ai_res_time,
            actual_resp_time,
            actual_res_time,
            sla_violated_bool,
            issue_raised_at,
            issue_raised_at + (actual_res_time * INTERVAL '1 minute')
        FROM public.contracts c JOIN public.services s ON c.service_id = s.id
        WHERE c.id = contract1_id;
    END LOOP;

    -- Step 5: Calculate and Update Vendor Ratings (Simplified Logic)
    -- This should ideally be a trigger or a scheduled function in a real app.
    FOR vendor_id_rec IN SELECT id FROM public.profiles WHERE role = 'vendor' LOOP
        DECLARE
            total_issues INT;
            successful_issues INT;
            sla_rate DECIMAL;
            avg_resp_score DECIMAL;
            penalty_count INT;
            final_score DECIMAL;
            final_rating INT;
        BEGIN
            SELECT
                COUNT(*),
                COUNT(*) FILTER (WHERE sla_violated = false)
            INTO total_issues, successful_issues
            FROM public.issues WHERE vendor_id = vendor_id_rec.id;

            IF total_issues > 0 THEN
                sla_rate := (successful_issues::DECIMAL / total_issues) * 100;
            ELSE
                sla_rate := 100.0;
            END IF;

            -- Simplified scoring for demo
            SELECT COALESCE(AVG(
                CASE
                    WHEN actual_response_time_minutes <= ai_response_time_minutes THEN 100
                    ELSE GREATEST(0, 100 - (actual_response_time_minutes - ai_response_time_minutes))
                END
            ), 100)
            INTO avg_resp_score
            FROM public.issues WHERE vendor_id = vendor_id_rec.id;

            SELECT COUNT(*) INTO penalty_count FROM public.issues WHERE vendor_id = vendor_id_rec.id AND sla_violated = true;

            -- Final Score Calculation
            final_score := (
                (CASE WHEN total_issues > 10 THEN 100 WHEN total_issues > 5 THEN 80 ELSE 60 END) + -- Volume Score
                sla_rate + -- SLA Score
                avg_resp_score + -- Response Score
                GREATEST(0, 100 - (penalty_count * 10)) -- Penalty Score
            ) / 4.0;

            -- Convert score to rating
            IF final_score >= 90 THEN final_rating := 5;
            ELSIF final_score >= 75 THEN final_rating := 4;
            ELSIF final_score >= 60 THEN final_rating := 3;
            ELSIF final_score >= 40 THEN final_rating := 2;
            ELSE final_rating := 1;
            END IF;

            -- Update profile
            UPDATE public.profiles
            SET
                rating = final_rating,
                total_issues_handled = total_issues,
                sla_success_rate = sla_rate
            WHERE id = vendor_id_rec.id;

            -- Insert a summary rating
            INSERT INTO public.ratings (vendor_id, client_id, rating, feedback)
            SELECT vendor_id_rec.id, c.client_id, final_rating, 'Automated performance rating.'
            FROM public.contracts c WHERE c.vendor_id = vendor_id_rec.id
            GROUP BY c.client_id
            LIMIT 1;
        END;
    END LOOP;

END $$;
