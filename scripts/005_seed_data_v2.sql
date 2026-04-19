-- Cache Buster: 2026-04-15 04:00 PM
-- Comprehensive Realistic Data Seeding for ServiceSphere (V3 - All Users)
-- Timeframe: Last 3 Months (Approx. Jan 15, 2026 - Apr 15, 2026)

-- Clear existing data in tables to ensure a clean slate
TRUNCATE TABLE 
  public.invoices, 
  public.vendor_ratings, 
  public.performance, 
  public.activity_log, 
  public.issues, 
  public.contracts, 
  public.services, 
  public.service_requests 
RESTART IDENTITY CASCADE;

DO $$
DECLARE
    -- Timestamps
    three_months_ago TIMESTAMPTZ := NOW() - INTERVAL '3 months';
    now_time TIMESTAMPTZ := NOW();

    -- Profile IDs
    client1_id UUID; client2_id UUID; client3_id UUID; client4_id UUID; client5_id UUID; client6_id UUID;
    vendor1_id UUID; vendor2_id UUID; vendor3_id UUID; vendor4_id UUID; vendor5_id UUID;

    -- Service IDs
    service1_id UUID; service2_id UUID; service3_id UUID; service4_id UUID; service5_id UUID;
    service6_id UUID; service7_id UUID; service8_id UUID; service9_id UUID; service10_id UUID;

    -- Contract IDs
    contract1_id UUID; contract2_id UUID; contract3_id UUID; contract4_id UUID; contract5_id UUID;
    contract6_id UUID; contract7_id UUID; contract8_id UUID; contract9_id UUID;

    -- Loop variables
    issue_id_var UUID;
    request_id_var UUID;
    issue_raised_at TIMESTAMPTZ;
    ai_resp_time INT;
    ai_res_time INT;
    actual_resp_time INT;
    actual_res_time INT;
    sla_violated_bool BOOLEAN;
    current_client_id UUID;
    current_vendor_id UUID;
    current_contract_id UUID;

BEGIN
    -- Step 1: Get all profile IDs from the provided user list (with LIMIT 1 to prevent duplicate errors)
    SELECT id INTO client1_id FROM public.profiles WHERE email = 'jordan@retailcorp.com' LIMIT 1;
    SELECT id INTO client2_id FROM public.profiles WHERE email = 'mia@finedge.com' LIMIT 1;
    SELECT id INTO client3_id FROM public.profiles WHERE email = 'omar@logitrack.com' LIMIT 1;
    SELECT id INTO client4_id FROM public.profiles WHERE email = 'ops@retailcorp.net' LIMIT 1;
    SELECT id INTO client5_id FROM public.profiles WHERE email = 'mgr@growthnexus.com' LIMIT 1;
    SELECT id INTO client6_id FROM public.profiles WHERE email = 'lead@apexlogistics.com' LIMIT 1;

    SELECT id INTO vendor1_id FROM public.profiles WHERE email = 'alex@technova.com' LIMIT 1;
    SELECT id INTO vendor2_id FROM public.profiles WHERE email = 'priya@cloudbridge.com' LIMIT 1;
    SELECT id INTO vendor3_id FROM public.profiles WHERE email = 'admin@cyberguard.com' LIMIT 1;
    SELECT id INTO vendor4_id FROM public.profiles WHERE email = 'admin@cloudscale.com' LIMIT 1;
    SELECT id INTO vendor5_id FROM public.profiles WHERE email = 'lead@devopsflow.com' LIMIT 1;

    -- Step 2: Create Services for all Vendors
    INSERT INTO public.services (vendor_id, name, description, category, price) VALUES
    (vendor1_id, 'AI Model Training', 'Custom AI model development and training.', 'AI Services', 15000),
    (vendor1_id, 'Data Analytics Platform', 'Managed data analytics and visualization platform.', 'Data Services', 9000),
    (vendor2_id, 'Cloud Migration', 'Seamless migration of infrastructure to the cloud.', 'Cloud Services', 25000),
    (vendor2_id, 'Serverless Functions', 'Develop and deploy serverless applications.', 'Cloud Services', 7000),
    (vendor3_id, 'Managed Firewall', '24/7 managed firewall and intrusion detection.', 'Security', 8000),
    (vendor3_id, 'DDoS Protection', 'Advanced DDoS mitigation services.', 'Security', 10000),
    (vendor4_id, 'Elastic Load Balancing', 'Automatic scaling and load balancing for web apps.', 'Web Services', 4000),
    (vendor4_id, 'CDN & Caching', 'Global content delivery network for faster performance.', 'Web Services', 3500),
    (vendor5_id, 'CI/CD Pipeline Setup', 'Automated build, test, and deployment pipelines.', 'DevOps', 12000),
    (vendor5_id, 'Infrastructure as Code (IaC)', 'Manage infrastructure using Terraform and Ansible.', 'DevOps', 11000)
    RETURNING id, id, id, id, id, id, id, id, id, id INTO service1_id, service2_id, service3_id, service4_id, service5_id, service6_id, service7_id, service8_id, service9_id, service10_id;

    -- Step 3: Create a wide array of Contracts
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client1_id, vendor1_id, service1_id, 'active', 12, 180000, three_months_ago, three_months_ago + INTERVAL '12 months') RETURNING id INTO contract1_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client2_id, vendor2_id, service3_id, 'active', 6, 150000, three_months_ago + INTERVAL '1 month', three_months_ago + INTERVAL '7 months') RETURNING id INTO contract2_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client3_id, vendor3_id, service5_id, 'active', 24, 192000, now_time - INTERVAL '1 month', now_time + INTERVAL '23 months') RETURNING id INTO contract3_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client4_id, vendor4_id, service7_id, 'active', 12, 48000, three_months_ago + INTERVAL '10 days', three_months_ago + INTERVAL '12 months 10 days') RETURNING id INTO contract4_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client5_id, vendor5_id, service9_id, 'active', 12, 144000, now_time - INTERVAL '2 weeks', now_time + INTERVAL '11 months 2 weeks') RETURNING id INTO contract5_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client6_id, vendor1_id, service2_id, 'active', 12, 108000, three_months_ago, three_months_ago + INTERVAL '12 months') RETURNING id INTO contract6_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client1_id, vendor3_id, service6_id, 'pending', 12, 120000, now_time, now_time + INTERVAL '12 months');
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client2_id, vendor4_id, service8_id, 'completed', 3, 10500, three_months_ago, now_time - INTERVAL '1 day') RETURNING id INTO contract8_id;
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client3_id, vendor5_id, service10_id, 'rejected', 6, 66000, now_time, now_time + INTERVAL '6 months');
    INSERT INTO public.contracts (client_id, vendor_id, service_id, status, duration_months, cost, start_date, end_date) VALUES
    (client4_id, vendor2_id, service4_id, 'active', 12, 84000, now_time - INTERVAL '1 month', now_time + INTERVAL '11 months') RETURNING id INTO contract9_id;

    -- Step 4: Generate Issues, Service Requests, and Performance for Active Contracts
    FOR i IN 1..50 LOOP
        -- Randomly select an active contract
        CASE (i % 7)
            WHEN 0 THEN current_contract_id := contract1_id;
            WHEN 1 THEN current_contract_id := contract2_id;
            WHEN 2 THEN current_contract_id := contract3_id;
            WHEN 3 THEN current_contract_id := contract4_id;
            WHEN 4 THEN current_contract_id := contract5_id;
            WHEN 5 THEN current_contract_id := contract6_id;
            ELSE current_contract_id := contract9_id;
        END CASE;

        SELECT client_id, vendor_id INTO current_client_id, current_vendor_id FROM public.contracts WHERE id = current_contract_id;

        issue_raised_at := three_months_ago + (random() * (now_time - three_months_ago));
        ai_resp_time := 20 + floor(random() * 40); -- 20-60 mins
        ai_res_time := 100 + floor(random() * 300); -- 1.5-5 hours

        sla_violated_bool := random() < 0.20; -- 20% violation chance
        IF sla_violated_bool THEN
            actual_resp_time := ai_resp_time + floor(random() * 30);
            actual_res_time := ai_res_time + floor(random() * 120);
        ELSE
            actual_resp_time := GREATEST(1, ai_resp_time - floor(random() * 15));
            actual_res_time := GREATEST(1, ai_res_time - floor(random() * 60));
        END IF;

        -- Insert into issues
        INSERT INTO public.issues (
            contract_id, client_id, vendor_id, title, description, priority, status, service_type,
            ai_response_time_minutes, ai_resolution_time_minutes, actual_response_time_minutes,
            actual_resolution_time_minutes, sla_violated, raised_at, resolved_at, risk_level, risk_analysis
        )
        SELECT
            current_contract_id, current_client_id, current_vendor_id,
            'Issue #' || i || ' on ' || s.name,
            'Details for issue #' || i || ': performance degradation observed.',
            (ARRAY['low', 'medium', 'high', 'critical'])[floor(random() * 4) + 1]::issue_priority,
            'resolved', s.category, ai_resp_time, ai_res_time, actual_resp_time, actual_res_time,
            sla_violated_bool, issue_raised_at, issue_raised_at + (actual_res_time * INTERVAL '1 minute'),
            CASE WHEN sla_violated_bool THEN 'medium' ELSE 'low' END,
            CASE WHEN sla_violated_bool THEN 'SLA violated, potential for client dissatisfaction.' ELSE 'Standard operational issue.' END
        FROM public.contracts c JOIN public.services s ON c.service_id = s.id WHERE c.id = current_contract_id
        RETURNING id INTO issue_id_var;

        -- Insert into service_requests (mirroring issues)
        INSERT INTO public.service_requests (
            id, contract_id, client_id, vendor_id, title, issue_description, service_type,
            ai_response_time, ai_resolution_time, raised_at, resolved_at
        )
        SELECT
            issue_id_var, current_contract_id, current_client_id, current_vendor_id,
            'Request for ' || title, description, (SELECT category FROM services WHERE id=c.service_id),
            ai_response_time_minutes, ai_resolution_time_minutes, raised_at, resolved_at
        FROM public.issues, public.contracts c WHERE issues.id = issue_id_var AND c.id = current_contract_id
        RETURNING id INTO request_id_var;

        -- Insert into performance
        INSERT INTO public.performance (
            request_id, vendor_id, actual_response_time, actual_resolution_time,
            sla_response_met, sla_resolution_met, penalty_applied, penalty_level, remarks
        )
        VALUES (
            request_id_var, current_vendor_id, actual_resp_time, actual_res_time,
            actual_resp_time <= ai_resp_time, actual_res_time <= ai_res_time,
            sla_violated_bool,
            CASE WHEN sla_violated_bool THEN 'penalty' ELSE NULL END,
            CASE WHEN sla_violated_bool THEN 'SLA breach detected.' ELSE 'Met SLA requirements.' END
        );
    END LOOP;

    -- Step 5: Generate Invoices for active/completed contracts
    FOR current_contract_id IN SELECT id FROM public.contracts WHERE status IN ('active', 'completed') LOOP
        INSERT INTO public.invoices (contract_id, client_id, vendor_id, amount, status, due_date)
        SELECT id, client_id, vendor_id, cost / duration_months, 'paid', (start_date + INTERVAL '1 month')::date
        FROM public.contracts WHERE id = current_contract_id;
    END LOOP;

    -- Step 6: Calculate and Update Vendor Ratings
    DECLARE
        vendor_id_rec RECORD;
    BEGIN
        FOR vendor_id_rec IN SELECT id FROM public.profiles WHERE role = 'vendor' LOOP
            DECLARE
                total_issues INT;
                sla_violations INT;
                sla_success_rate_val DECIMAL;
                warnings_val INT;
                penalties_val INT;
                is_flagged_val BOOLEAN;
                final_rating DECIMAL;
            BEGIN
                SELECT
                    COUNT(*),
                    COUNT(*) FILTER (WHERE sla_violated = true)
                INTO total_issues, sla_violations
                FROM public.issues WHERE vendor_id = vendor_id_rec.id;

                penalties_val := sla_violations;
                warnings_val := floor(random() * 5); -- Random warnings
                is_flagged_val := penalties_val > 3;

                IF total_issues > 0 THEN
                    sla_success_rate_val := ((total_issues - sla_violations)::DECIMAL / total_issues) * 100.0;
                ELSE
                    sla_success_rate_val := 100.0;
                END IF;

                -- Simplified rating logic based on success rate
                IF sla_success_rate_val >= 95.0 THEN final_rating := 5.0;
                ELSIF sla_success_rate_val >= 85.0 THEN final_rating := 4.0;
                ELSIF sla_success_rate_val >= 70.0 THEN final_rating := 3.0;
                ELSIF sla_success_rate_val >= 50.0 THEN final_rating := 2.0;
                ELSE final_rating := 1.0;
                END IF;

                -- Insert/Update vendor_ratings table
                INSERT INTO public.vendor_ratings (
                    vendor_id, rating, total_issues, resolved_issues, sla_success_rate, warnings, penalties, is_flagged
                ) VALUES (
                    vendor_id_rec.id, final_rating, total_issues, total_issues, sla_success_rate_val, warnings_val, penalties_val, is_flagged_val
                )
                ON CONFLICT (vendor_id) DO UPDATE SET
                    rating = EXCLUDED.rating,
                    total_issues = EXCLUDED.total_issues,
                    resolved_issues = EXCLUDED.resolved_issues,
                    sla_success_rate = EXCLUDED.sla_success_rate,
                    warnings = EXCLUDED.warnings,
                    penalties = EXCLUDED.penalties,
                    is_flagged = EXCLUDED.is_flagged,
                    updated_at = NOW();

                -- Also update the profiles table for quick access
                UPDATE public.profiles
                SET
                    rating = final_rating,
                    total_issues_handled = total_issues,
                    sla_success_rate = sla_success_rate_val,
                    is_flagged = is_flagged_val
                WHERE id = vendor_id_rec.id;
            END;
        END LOOP;
    END;

END $$;
