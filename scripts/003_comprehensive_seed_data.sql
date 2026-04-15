-- ============================================================================
-- COMPREHENSIVE SEED DATA WITH SLA VIOLATIONS, WARNINGS, PENALTIES, RATINGS
-- Target Vendor: a1000000-0000-0000-0000-000000000001 (TechNova Solutions)
-- ============================================================================

-- ============================================================================
-- 1. INSERT SERVICES FOR TechNova (if not exists, or add more)
-- ============================================================================
INSERT INTO public.services (id, vendor_id, name, description, category, base_price, default_sla_response_hours, default_sla_resolution_hours, is_active) VALUES
  ('ed000000-0000-0000-0000-000000000101', 'a1000000-0000-0000-0000-000000000001', 'Network Security Audit', 'Comprehensive security assessment and vulnerability scanning for enterprise networks', 'Security', 5000, 4, 48, true),
  ('ed000000-0000-0000-0000-000000000102', 'a1000000-0000-0000-0000-000000000001', '24/7 Cloud Infrastructure Support', 'Round-the-clock monitoring and maintenance of cloud infrastructure', 'Cloud Support', 3500, 2, 24, true),
  ('ed000000-0000-0000-0000-000000000103', 'a1000000-0000-0000-0000-000000000001', 'Database Optimization', 'Performance tuning and optimization for SQL/NoSQL databases', 'Database', 4000, 6, 72, true),
  ('ed000000-0000-0000-0000-000000000104', 'a1000000-0000-0000-0000-000000000001', 'Incident Response Service', 'Emergency cybersecurity incident handling and recovery', 'Security', 8000, 1, 8, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. INSERT CONTRACTS BETWEEN TechNova AND CLIENTS
-- ============================================================================
INSERT INTO public.contracts (id, client_id, vendor_id, service_id, status, sla_response_hours, sla_resolution_hours, penalty_percentage, contract_value, start_date, end_date, terms) VALUES
  ('fc000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'ed000000-0000-0000-0000-000000000101', 'active', 4, 48, 5.00, 25000, '2024-01-01', '2025-01-01', 'Network security monitoring with 4hr response, 48hr resolution SLA'),
  ('fc000000-0000-0000-0000-000000000102', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'ed000000-0000-0000-0000-000000000102', 'active', 2, 24, 5.00, 42000, '2024-02-01', '2025-02-01', '24/7 cloud support with 2hr response, 24hr resolution SLA'),
  ('fc000000-0000-0000-0000-000000000103', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'ed000000-0000-0000-0000-000000000104', 'active', 1, 8, 7.50, 65000, '2024-03-01', '2025-03-01', 'Incident response with 1hr response, 8hr resolution SLA - CRITICAL'),
  ('fc000000-0000-0000-0000-000000000104', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'ed000000-0000-0000-0000-000000000103', 'active', 6, 72, 5.00, 18000, '2024-04-01', '2025-04-01', 'Database optimization with 6hr response, 72hr resolution SLA')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. INSERT ISSUES WITH VARIOUS SLA VIOLATIONS
-- Target: 5 warnings total, 1 penalty (when warnings > 2)
-- ============================================================================

-- Issue 1: Response Time Violation (WARNING #1)
-- Raised: 48 hours ago, First Response: 6 hours late (SLA: 4hrs, Actual: 10hrs)
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, resolved_at, created_at) VALUES
  ('e2ce8448-1e50-40a3-9ca4-80ad7aaaa0001', 'fc000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 
   'Critical Firewall Misconfiguration Detected', 
   'Network security audit revealed a critical misconfiguration in the main firewall allowing unauthorized external access to internal systems. Immediate attention required.', 
   'critical', 'resolved', 
   NOW() - INTERVAL '44 hours', NOW() + INTERVAL '4 hours', 
   10, 18, true, 'response_time_exceeded', 
   NOW() - INTERVAL '30 hours', NOW() - INTERVAL '48 hours')
ON CONFLICT (id) DO NOTHING;

-- Issue 2: Resolution Time Violation (WARNING #2)
-- Raised: 5 days ago, Response on time, Resolution: 24 hours late (SLA: 48hrs, Actual: 72hrs)
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, resolved_at, created_at) VALUES
  ('e2ce8448-1e50-40a3-9ca4-80ad7aaaa0002', 'fc000000-0000-0000-0000-000000000102', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 
   'Cloud Server Downtime - Database Connection Failure', 
   'Production cloud servers experiencing intermittent downtime due to database connection pool exhaustion. Application users cannot access critical business data.', 
   'high', 'resolved', 
   NOW() - INTERVAL '119 hours', NOW() - INTERVAL '48 hours', 
   1, 72, true, 'resolution_time_exceeded', 
   NOW() - INTERVAL '24 hours', NOW() - INTERVAL '120 hours')
ON CONFLICT (id) DO NOTHING;

-- Issue 3: BOTH Response AND Resolution Time Violations (WARNING #3)
-- Response: 8 hours late, Resolution: 48 hours late - VERY SEVERE
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, resolved_at, created_at) VALUES
  ('e2ce8448-1e50-40a3-9ca4-80ad7aaaa0003', 'fc000000-0000-0000-0000-000000000103', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 
   'SECURITY BREACH - Unauthorized Data Access Attempt', 
   'Multiple failed login attempts detected followed by successful breach of staging environment. Potential data exfiltration. Emergency incident response required immediately.', 
   'critical', 'resolved', 
   NOW() - INTERVAL '95 hours', NOW() - INTERVAL '88 hours', 
   9, 56, true, 'both_response_and_resolution_exceeded', 
   NOW() - INTERVAL '8 hours', NOW() - INTERVAL '96 hours')
ON CONFLICT (id) DO NOTHING;

-- Issue 4: Response Time Violation (WARNING #4) - This triggers penalty after 3 warnings
-- Response: 3 hours late (SLA: 2hrs, Actual: 5hrs)
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, resolved_at, created_at) VALUES
  ('e2ce8448-1e50-40a3-9ca4-80ad7aaaa0004', 'fc000000-0000-0000-0000-000000000102', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 
   'Load Balancer Configuration Error Causing Service Degradation', 
   'Load balancer misconfigured causing uneven traffic distribution. Some servers overloaded while others underutilized. Customer-facing services experiencing 30% performance degradation.', 
   'high', 'resolved', 
   NOW() - INTERVAL '21 hours', NOW() + INTERVAL '3 hours', 
   5, 20, true, 'response_time_exceeded', 
   NOW() - INTERVAL '4 hours', NOW() - INTERVAL '24 hours')
ON CONFLICT (id) DO NOTHING;

-- Issue 5: Resolution Time Violation (WARNING #5) - FINAL WARNING
-- Resolution: 30 hours late (SLA: 72hrs, Actual: 102hrs)
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, resolved_at, created_at) VALUES
  ('e2ce8448-1e50-40a3-9ca4-80ad7aaaa0005', 'fc000000-0000-0000-0000-000000000104', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 
   'Database Query Performance Critical Failure', 
   'Primary production database queries timing out after 30 seconds. Business reports failing to generate. Customer transactions experiencing severe delays up to 45 seconds per operation.', 
   'high', 'resolved', 
   NOW() - INTERVAL '222 hours', NOW() - INTERVAL '120 hours', 
   4, 102, true, 'resolution_time_exceeded', 
   NOW() - INTERVAL '18 hours', NOW() - INTERVAL '240 hours')
ON CONFLICT (id) DO NOTHING;

-- Issue 6: NO VIOLATION - Good performance (for contrast)
INSERT INTO public.issues (id, contract_id, client_id, vendor_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, response_time_hours, resolution_time_hours, sla_breached, breach_type, resolved_at, created_at) VALUES
  ('e2ce8448-1e50-40a3-9ca4-80ad7aaaa0006', 'fc000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 
   'SSL Certificate Renewal Request', 
   'SSL certificates expiring in 30 days. Need renewal and installation on all web servers to prevent browser security warnings.', 
   'medium', 'resolved', 
   NOW() - INTERVAL '36 hours', NOW() - INTERVAL '10 hours', 
   2, 12, false, NULL, 
   NOW() - INTERVAL '24 hours', NOW() - INTERVAL '48 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. INSERT PENALTIES - 1 PENALTY FOR TechNova (triggered when warnings > 2)
-- ============================================================================
-- TechNova has 5 warnings total, so gets 1 penalty (and potentially more)
INSERT INTO public.penalties (id, issue_id, vendor_id, contract_id, penalty_type, amount, rating_impact, reason, applied_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0003', 'a1000000-0000-0000-0000-000000000001', 'fc000000-0000-0000-0000-000000000103', 'penalty', 4875.00, -0.8, 
   'Multiple SLA violations: Issue #3 had both response and resolution time breaches for a CRITICAL security incident. Total warnings: 3 triggered penalty.', NOW() - INTERVAL '7 days'),
  ('a0000000-0000-0000-0000-000000000002', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0005', 'a1000000-0000-0000-0000-000000000001', 'fc000000-0000-0000-0000-000000000104', 'warning', 900.00, -0.3, 
   'Resolution time exceeded by 30 hours on high-priority database issue. Warning #5 recorded.', NOW() - INTERVAL '18 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. INSERT CLIENT RATINGS FOR TechNova (Algorithm-based)
-- Rating calculation considers: total issues, warnings, penalties, SLA compliance
-- ============================================================================

-- Client 1 (RetailCorp): 2 issues, 1 warning from their issues. Rating: 3.5/5
INSERT INTO public.ratings (id, issue_id, client_id, vendor_id, rating, comment, created_at) VALUES
  ('r0000000-0000-0000-0000-000000000001', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 3, 
   'Firewall issue was resolved but vendor took 10 hours to respond instead of promised 4 hours. Security risk was significant.', NOW() - INTERVAL '25 days'),
  ('r0000000-0000-0000-0000-000000000002', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0006', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 4, 
   'SSL renewal was handled quickly and professionally. Good communication throughout.', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Client 2 (FinEdge): 2 issues, 2 warnings (1 response, 1 resolution violation). Rating: 2.5/5
INSERT INTO public.ratings (id, issue_id, client_id, vendor_id, rating, comment, created_at) VALUES
  ('r0000000-0000-0000-0000-000000000003', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0002', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 2, 
   'Server downtime took 3 DAYS to resolve instead of 24 hours. Cost us significant revenue. Very disappointed with the SLA breach.', NOW() - INTERVAL '22 days'),
  ('r0000000-0000-0000-0000-000000000004', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0004', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 3, 
   'Load balancer issue resolved but late response caused extended service degradation.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Client 3 (LogiTrack): 1 critical security issue, severe violations. Rating: 1/5
INSERT INTO public.ratings (id, issue_id, client_id, vendor_id, rating, comment, created_at) VALUES
  ('r0000000-0000-0000-0000-000000000005', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0003', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 1, 
   'UNACCEPTABLE. We had a SECURITY BREACH and it took 9 HOURS for first response (SLA: 1hr) and 56 hours total resolution. Data was potentially exposed. We are considering contract termination.', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Client 4 (RetailCorp Solutions): 1 severe database issue. Rating: 2/5
INSERT INTO public.ratings (id, issue_id, client_id, vendor_id, rating, comment, created_at) VALUES
  ('r0000000-0000-0000-0000-000000000006', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0005', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 2, 
   'Database performance issue took over 100 hours to fix. Business operations were severely impacted. SLA compliance is concerning.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. INSERT PERFORMANCE RECORDS FOR TechNova (Monthly)
-- ============================================================================
INSERT INTO public.performance_records (id, vendor_id, contract_id, period_start, period_end, total_issues, resolved_on_time, resolved_late, avg_response_time_hours, avg_resolution_time_hours, sla_compliance_rate) VALUES
  ('pr000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'fc000000-0000-0000-0000-000000000101', '2024-03-01', '2024-03-31', 2, 1, 1, 6.0, 15.0, 50.0),
  ('pr000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'fc000000-0000-0000-0000-000000000102', '2024-03-01', '2024-03-31', 2, 0, 2, 3.0, 46.0, 0.0),
  ('pr000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'fc000000-0000-0000-0000-000000000103', '2024-03-01', '2024-03-31', 1, 0, 1, 9.0, 56.0, 0.0),
  ('pr000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'fc000000-0000-0000-0000-000000000104', '2024-03-01', '2024-03-31', 1, 0, 1, 4.0, 102.0, 0.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. UPDATE VENDOR PROFILE WITH NEW STATS
-- ============================================================================
UPDATE public.profiles 
SET 
  rating = 2.4,  -- Average of all ratings: (3+4+2+3+1+2)/6 = 2.5, adjusted down for penalties
  total_issues_resolved = 6,
  updated_at = NOW()
WHERE id = 'a1000000-0000-0000-0000-000000000001';

-- ============================================================================
-- 8. INSERT NOTIFICATIONS FOR ALL STAKEHOLDERS
-- ============================================================================
INSERT INTO public.notifications (id, user_id, title, message, type, related_issue_id, related_contract_id, is_read, created_at) VALUES
  ('n0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Issue Resolved - Firewall Misconfiguration', 'Your firewall issue has been resolved. Response time exceeded SLA by 6 hours.', 'issue_resolved', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0001', 'fc000000-0000-0000-0000-000000000101', true, NOW() - INTERVAL '30 hours'),
  ('n0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Warning Issued - SLA Response Breach', 'Warning issued for Issue #1: Response time exceeded by 6 hours. Warning count: 1', 'warning', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0001', 'fc000000-0000-0000-0000-000000000101', false, NOW() - INTERVAL '30 hours'),
  ('n0000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Issue Resolved - Database Connection', 'Server downtime issue resolved but took 72 hours (exceeded 24hr SLA by 48 hours)', 'issue_resolved', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0002', 'fc000000-0000-0000-0000-000000000102', true, NOW() - INTERVAL '24 hours'),
  ('n0000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Warning Issued - SLA Resolution Breach', 'Warning #2: Resolution time exceeded by 48 hours for database connection issue.', 'warning', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0002', 'fc000000-0000-0000-0000-000000000102', false, NOW() - INTERVAL '24 hours'),
  ('n0000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'CRITICAL: Security Incident Resolved', 'Security breach has been contained and resolved. However, SLA was severely breached.', 'issue_resolved', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0003', 'fc000000-0000-0000-0000-000000000103', true, NOW() - INTERVAL '8 hours'),
  ('n0000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'PENALTY APPLIED - Multiple SLA Violations', 'PENALTY #1: $4,875 penalty applied due to critical security incident with multiple SLA breaches. Rating impact: -0.8', 'penalty', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0003', 'fc000000-0000-0000-0000-000000000103', false, NOW() - INTERVAL '7 days'),
  ('n0000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Warning #4: Load Balancer Response Delay', 'Warning issued for 3-hour response delay on load balancer issue.', 'warning', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0004', 'fc000000-0000-0000-0000-000000000102', false, NOW() - INTERVAL '4 hours'),
  ('n0000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 'Issue Resolved - Database Performance', 'Database optimization completed but exceeded SLA by 30 hours.', 'issue_resolved', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0005', 'fc000000-0000-0000-0000-000000000104', true, NOW() - INTERVAL '18 hours'),
  ('n0000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'Warning #5: Database Resolution Breach', 'Final warning issued for 30-hour resolution delay on database performance issue.', 'warning', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0005', 'fc000000-0000-0000-0000-000000000104', false, NOW() - INTERVAL '18 hours'),
  ('n0000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000001', 'New Rating Received', 'Client RetailCorp Ltd. has rated your service 3/5 stars for the firewall issue.', 'rating', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0001', NULL, false, NOW() - INTERVAL '25 days'),
  ('n0000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000003', 'New Rating Received', 'Client LogiTrack Systems has rated your service 1/5 stars. URGENT: Client considering contract termination!', 'rating', 'e2ce8448-1e50-40a3-9ca4-80ad7aaaa0003', NULL, true, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY OF DATA INSERTED:
-- TechNova Solutions (Vendor 1) now has:
-- - 6 issues total (5 with SLA breaches, 1 clean)
-- - 5 warnings (response & resolution violations)
-- - 1 penalty of $4,875 + 1 minor warning penalty of $900
-- - Average rating: ~2.4/5 (calculated from ratings: 3,4,2,3,1,2)
-- - Total rating impact from penalties: -1.1 points
-- ============================================================================
