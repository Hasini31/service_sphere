-- ServiceSphere Complete Sample Data Seed Script
-- Run this AFTER creating users via demo login at http://localhost:3000/auth/sign-up
-- Get your user IDs first: SELECT id, email, company_name, role FROM public.profiles;
-- Replace CLIENT_ID_1-5 and VENDOR_ID_1-5 with actual user IDs below

-- ============================================
-- SAMPLE SERVICES (13 total)
-- ============================================
INSERT INTO public.services (id, vendor_id, name, description, category, base_price, default_sla_response_hours, default_sla_resolution_hours, is_active) VALUES
-- Nexus IT Services (3 services)
(gen_random_uuid(), 'VENDOR_ID_1', 'Network Infrastructure Setup', 'Complete network setup including routers, switches, and configuration', 'Network', 5000.00, 24, 72, true),
(gen_random_uuid(), 'VENDOR_ID_1', 'Server Maintenance', 'Monthly server maintenance and monitoring services', 'Maintenance', 1500.00, 4, 24, true),
(gen_random_uuid(), 'VENDOR_ID_1', 'Cloud Migration', 'End-to-end cloud migration services', 'Cloud', 12000.00, 48, 168, true),
-- CyberCore Security (3 services)
(gen_random_uuid(), 'VENDOR_ID_2', 'Security Audit', 'Comprehensive security audit and vulnerability assessment', 'Security', 3500.00, 24, 72, true),
(gen_random_uuid(), 'VENDOR_ID_2', 'Penetration Testing', 'Advanced penetration testing services', 'Security', 8000.00, 48, 168, true),
(gen_random_uuid(), 'VENDOR_ID_2', 'Incident Response', '24/7 incident response and threat mitigation', 'Security', 6000.00, 1, 4, true),
-- CloudMastery Solutions (2 services)
(gen_random_uuid(), 'VENDOR_ID_3', 'AWS Management', 'Complete AWS infrastructure management', 'Cloud', 4500.00, 8, 24, true),
(gen_random_uuid(), 'VENDOR_ID_3', 'Azure Migration', 'Azure cloud migration and optimization', 'Cloud', 10000.00, 48, 168, true),
-- DataPro Networks (2 services)
(gen_random_uuid(), 'VENDOR_ID_4', 'Data Backup Solutions', 'Automated backup and disaster recovery', 'Storage', 3000.00, 4, 24, true),
(gen_random_uuid(), 'VENDOR_ID_4', 'Database Optimization', 'Database performance tuning and optimization', 'Database', 4000.00, 8, 48, true),
-- SecureOps Infra (3 services)
(gen_random_uuid(), 'VENDOR_ID_5', 'Firewall Management', 'Firewall configuration and management', 'Security', 2500.00, 4, 24, true),
(gen_random_uuid(), 'VENDOR_ID_5', 'VPN Setup', 'Secure VPN implementation for remote teams', 'Network', 2000.00, 8, 24, true),
(gen_random_uuid(), 'VENDOR_ID_5', 'Compliance Consulting', 'SOC2, HIPAA, and GDPR compliance consulting', 'Compliance', 8000.00, 48, 168, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE CONTRACTS (10 total)
-- ============================================
INSERT INTO public.contracts (id, client_id, vendor_id, service_id, status, sla_response_hours, sla_resolution_hours, penalty_percentage, contract_value, start_date, end_date, terms) VALUES
-- TechCorp contracts (3)
(gen_random_uuid(), 'CLIENT_ID_1', 'VENDOR_ID_1', (SELECT id FROM public.services WHERE name = 'Network Infrastructure Setup' LIMIT 1), 'active', 24, 72, 5.00, 5000.00, '2024-01-15', '2025-01-15', 'Standard network maintenance contract'),
(gen_random_uuid(), 'CLIENT_ID_1', 'VENDOR_ID_2', (SELECT id FROM public.services WHERE name = 'Security Audit' LIMIT 1), 'active', 24, 72, 5.00, 3500.00, '2024-03-01', '2024-09-01', 'Security audit services'),
(gen_random_uuid(), 'CLIENT_ID_1', 'VENDOR_ID_3', (SELECT id FROM public.services WHERE name = 'AWS Management' LIMIT 1), 'active', 8, 24, 5.00, 4500.00, '2023-11-01', '2025-11-01', 'AWS management services'),
-- InnovateTech contracts (2)
(gen_random_uuid(), 'CLIENT_ID_2', 'VENDOR_ID_2', (SELECT id FROM public.services WHERE name = 'Penetration Testing' LIMIT 1), 'active', 48, 168, 5.00, 8000.00, '2024-02-01', '2025-02-01', 'Penetration testing services'),
(gen_random_uuid(), 'CLIENT_ID_2', 'VENDOR_ID_4', (SELECT id FROM public.services WHERE name = 'Database Optimization' LIMIT 1), 'accepted', 8, 48, 5.00, 4000.00, '2024-06-01', '2024-12-01', 'Database optimization services'),
-- GlobalSoft contracts (2)
(gen_random_uuid(), 'CLIENT_ID_3', 'VENDOR_ID_3', (SELECT id FROM public.services WHERE name = 'Azure Migration' LIMIT 1), 'active', 48, 168, 5.00, 10000.00, '2023-12-01', '2025-06-01', 'Azure migration services'),
(gen_random_uuid(), 'CLIENT_ID_3', 'VENDOR_ID_5', (SELECT id FROM public.services WHERE name = 'Compliance Consulting' LIMIT 1), 'active', 48, 168, 5.00, 8000.00, '2024-01-15', '2025-01-15', 'Compliance consulting services'),
-- DataWise contracts (1)
(gen_random_uuid(), 'CLIENT_ID_4', 'VENDOR_ID_4', (SELECT id FROM public.services WHERE name = 'Data Backup Solutions' LIMIT 1), 'active', 4, 24, 5.00, 3000.00, '2024-04-01', '2025-04-01', 'Data backup solutions'),
-- CloudNine contracts (2)
(gen_random_uuid(), 'CLIENT_ID_5', 'VENDOR_ID_1', (SELECT id FROM public.services WHERE name = 'Cloud Migration' LIMIT 1), 'pending', 48, 168, 5.00, 12000.00, NULL, NULL, 'Cloud migration services - pending acceptance'),
(gen_random_uuid(), 'CLIENT_ID_5', 'VENDOR_ID_5', (SELECT id FROM public.services WHERE name = 'Firewall Management' LIMIT 1), 'active', 4, 24, 5.00, 2500.00, '2024-05-01', '2025-05-01', 'Firewall management services')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE ISSUES (10 total)
-- ============================================
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, ai_suggested_priority, ai_suggested_response_hours, ai_suggested_resolution_hours, resolved_at) VALUES
-- Active issues (3)
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Standard network maintenance contract' LIMIT 1), 'CLIENT_ID_1', 'VENDOR_ID_1', 'Network connectivity issues', 'Experiencing intermittent network outages affecting critical services', 'high', 'in_progress', NOW() + INTERVAL '22 hours', NOW() + INTERVAL '70 hours', 0.75, NULL, false, NULL, 'high', 2, 4, NULL),
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Security audit services' LIMIT 1), 'CLIENT_ID_1', 'VENDOR_ID_2', 'Security vulnerability detected', 'Found potential security vulnerability in authentication system', 'critical', 'in_progress', NOW() + INTERVAL '23 hours', NOW() + INTERVAL '71 hours', 0.33, NULL, false, NULL, 'critical', 1, 2, NULL),
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Standard network maintenance contract' LIMIT 1), 'CLIENT_ID_1', 'VENDOR_ID_1', 'Slow network speeds', 'Network throughput is below expected levels', 'medium', 'accepted', NOW() + INTERVAL '20 hours', NOW() + INTERVAL '68 hours', 1.0, NULL, false, NULL, 'medium', 4, 8, NULL),
-- Resolved issues (4)
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'AWS management services' LIMIT 1), 'CLIENT_ID_1', 'VENDOR_ID_3', 'AWS billing discrepancy', 'Unexpected charges in AWS billing', 'medium', 'resolved', NOW() - INTERVAL '3 days' + INTERVAL '24 hours', NOW() - INTERVAL '2 days' + INTERVAL '72 hours', 1.5, 6.0, false, NULL, 'medium', 4, 8, NOW() - INTERVAL '2 days'),
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Penetration testing services' LIMIT 1), 'CLIENT_ID_2', 'VENDOR_ID_2', 'Penetration test findings', 'Review and address penetration test vulnerabilities', 'high', 'completed', NOW() - INTERVAL '1 week' + INTERVAL '48 hours', NOW() - INTERVAL '6 days' + INTERVAL '168 hours', 0.42, 3.0, false, NULL, 'high', 2, 4, NOW() - INTERVAL '6 days'),
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Azure migration services' LIMIT 1), 'CLIENT_ID_3', 'VENDOR_ID_3', 'Azure deployment failure', 'Application failing to deploy to Azure', 'high', 'resolved', NOW() - INTERVAL '5 days' + INTERVAL '48 hours', NOW() - INTERVAL '4 days' + INTERVAL '168 hours', 1.0, 5.0, false, NULL, 'high', 4, 8, NOW() - INTERVAL '4 days'),
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Compliance consulting services' LIMIT 1), 'CLIENT_ID_3', 'VENDOR_ID_5', 'Compliance audit delay', 'Compliance audit taking longer than expected', 'medium', 'resolved', NOW() - INTERVAL '2 weeks' + INTERVAL '48 hours', NOW() - INTERVAL '1 week' + INTERVAL '168 hours', 3.0, 15.0, true, 'resolution_time', 'medium', 8, 16, NOW() - INTERVAL '1 week'),
-- Issues with SLA violations (2)
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Data backup solutions' LIMIT 1), 'CLIENT_ID_4', 'VENDOR_ID_4', 'Backup restoration failed', 'Unable to restore from backup', 'critical', 'resolved', NOW() - INTERVAL '1 week' + INTERVAL '4 hours', NOW() - INTERVAL '6 days' + INTERVAL '24 hours', 2.0, 4.0, true, 'response_time', 'critical', 1, 2, NOW() - INTERVAL '6 days'),
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Firewall management services' LIMIT 1), 'CLIENT_ID_5', 'VENDOR_ID_5', 'Firewall blocking legitimate traffic', 'Firewall rules blocking required business traffic', 'high', 'raised', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '24 hours', NULL, NULL, false, NULL, 'high', 1, 4, NULL),
-- New issue (1)
(gen_random_uuid(), (SELECT id FROM public.contracts WHERE terms = 'Database optimization services' LIMIT 1), 'CLIENT_ID_2', 'VENDOR_ID_4', 'Database performance degradation', 'Database queries running slower than usual', 'medium', 'accepted', NOW() + INTERVAL '7 hours', NOW() + INTERVAL '47 hours', 0.5, NULL, false, NULL, 'medium', 4, 8, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE PERFORMANCE RECORDS (6 total)
-- ============================================
INSERT INTO public.performance_records (id, vendor_id, contract_id, period_start, period_end, total_issues, resolved_on_time, resolved_late, avg_response_time_hours, avg_resolution_time_hours, sla_compliance_rate) VALUES
-- Nexus IT Services performance (2 records)
(gen_random_uuid(), 'VENDOR_ID_1', (SELECT id FROM public.contracts WHERE terms = 'Standard network maintenance contract' LIMIT 1), '2024-01-01', '2024-01-31', 5, 4, 1, 0.75, 5.0, 80.0),
(gen_random_uuid(), 'VENDOR_ID_1', (SELECT id FROM public.contracts WHERE terms = 'AWS management services' LIMIT 1), '2024-01-01', '2024-01-31', 3, 3, 0, 1.5, 6.0, 100.0),
-- CyberCore Security performance (1 record)
(gen_random_uuid(), 'VENDOR_ID_2', (SELECT id FROM public.contracts WHERE terms = 'Penetration testing services' LIMIT 1), '2024-02-01', '2024-02-29', 4, 4, 0, 0.42, 3.0, 100.0),
-- CloudMastery Solutions performance (1 record)
(gen_random_uuid(), 'VENDOR_ID_3', (SELECT id FROM public.contracts WHERE terms = 'Azure migration services' LIMIT 1), '2024-01-01', '2024-01-31', 6, 5, 1, 1.0, 5.0, 83.3),
-- DataPro Networks performance (1 record)
(gen_random_uuid(), 'VENDOR_ID_4', (SELECT id FROM public.contracts WHERE terms = 'Data backup solutions' LIMIT 1), '2024-04-01', '2024-04-30', 2, 1, 1, 2.0, 4.0, 50.0),
-- SecureOps Infra performance (1 record)
(gen_random_uuid(), 'VENDOR_ID_5', (SELECT id FROM public.contracts WHERE terms = 'Compliance consulting services' LIMIT 1), '2024-04-01', '2024-04-30', 3, 2, 1, 3.0, 15.0, 66.7)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE PENALTIES (2 total)
-- ============================================
INSERT INTO public.penalties (id, issue_id, vendor_id, contract_id, penalty_type, amount, rating_impact, reason) VALUES
-- DataPro Networks penalty (flagged vendor)
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'Backup restoration failed' LIMIT 1), 'VENDOR_ID_4', (SELECT id FROM public.contracts WHERE terms = 'Data backup solutions' LIMIT 1), 'penalty', 500.00, -0.5, 'SLA violation - backup restoration failed'),
-- SecureOps Infra penalty
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'Compliance audit delay' LIMIT 1), 'VENDOR_ID_5', (SELECT id FROM public.contracts WHERE terms = 'Compliance consulting services' LIMIT 1), 'warning', NULL, -0.2, 'Compliance audit delay exceeded SLA')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE RATINGS (5 total)
-- ============================================
INSERT INTO public.ratings (id, issue_id, client_id, vendor_id, rating, comment) VALUES
-- Ratings for Nexus IT Services
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'AWS billing discrepancy' LIMIT 1), 'CLIENT_ID_1', 'VENDOR_ID_1', 5, 'Excellent cloud migration service'),
-- Ratings for CyberCore Security
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'Penetration test findings' LIMIT 1), 'CLIENT_ID_2', 'VENDOR_ID_2', 5, 'Outstanding penetration testing service'),
-- Ratings for CloudMastery Solutions
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'Azure deployment failure' LIMIT 1), 'CLIENT_ID_3', 'VENDOR_ID_3', 4, 'Azure deployment issue resolved well'),
-- Ratings for DataPro Networks
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'Backup restoration failed' LIMIT 1), 'CLIENT_ID_4', 'VENDOR_ID_4', 3, 'Backup issues concerning, needs improvement'),
-- Ratings for SecureOps Infra
(gen_random_uuid(), (SELECT id FROM public.issues WHERE title = 'Compliance audit delay' LIMIT 1), 'CLIENT_ID_3', 'VENDOR_ID_5', 4, 'Compliance audit delay was disappointing')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE NOTIFICATIONS (8 total)
-- ============================================
INSERT INTO public.notifications (id, user_id, title, message, type, related_issue_id, related_contract_id, is_read) VALUES
-- Notifications for TechCorp (CLIENT_ID_1)
(gen_random_uuid(), 'CLIENT_ID_1', 'New Issue Accepted', 'Your issue "Network connectivity issues" has been accepted by Nexus IT Services', 'issue', (SELECT id FROM public.issues WHERE title = 'Network connectivity issues' LIMIT 1), NULL, false),
(gen_random_uuid(), 'CLIENT_ID_1', 'Issue In Progress', 'Issue "Network connectivity issues" is now in progress', 'issue', (SELECT id FROM public.issues WHERE title = 'Network connectivity issues' LIMIT 1), NULL, false),
(gen_random_uuid(), 'CLIENT_ID_1', 'Contract Created', 'Your contract with Nexus IT Services has been created', 'contract', NULL, (SELECT id FROM public.contracts WHERE terms = 'Standard network maintenance contract' LIMIT 1), true),
-- Notifications for InnovateTech (CLIENT_ID_2)
(gen_random_uuid(), 'CLIENT_ID_2', 'Issue Resolved', 'Your issue "Penetration test findings" has been resolved', 'issue', (SELECT id FROM public.issues WHERE title = 'Penetration test findings' LIMIT 1), NULL, false),
(gen_random_uuid(), 'CLIENT_ID_2', 'Contract Accepted', 'Your contract with DataPro Networks has been accepted', 'contract', NULL, (SELECT id FROM public.contracts WHERE terms = 'Database optimization services' LIMIT 1), true),
-- Notifications for Nexus IT Services (VENDOR_ID_1)
(gen_random_uuid(), 'VENDOR_ID_1', 'New Issue Raised', 'New issue "Network connectivity issues" raised by TechCorp Solutions', 'issue', (SELECT id FROM public.issues WHERE title = 'Network connectivity issues' LIMIT 1), NULL, false),
-- Notifications for CyberCore Security (VENDOR_ID_2)
(gen_random_uuid(), 'VENDOR_ID_2', 'New Issue Raised', 'New issue "Security vulnerability detected" raised by TechCorp Solutions', 'issue', (SELECT id FROM public.issues WHERE title = 'Security vulnerability detected' LIMIT 1), NULL, false),
(gen_random_uuid(), 'VENDOR_ID_2', 'Rating Received', 'You received a 5.0 rating from InnovateTech Inc', 'rating', (SELECT id FROM public.issues WHERE title = 'Penetration test findings' LIMIT 1), NULL, false)
ON CONFLICT (id) DO NOTHING;
