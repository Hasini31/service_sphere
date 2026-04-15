// ServiceSphere Database Types

export type UserRole = 'company' | 'vendor'
export type CompanyType = 'product' | 'service'
export type ContractStatus = 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled'
export type IssueStatus = 'raised' | 'accepted' | 'in_progress' | 'resolved' | 'completed' | 'reopened'
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical'
export type PenaltyType = 'warning' | 'penalty' | 'rating_decrease' | 'flagged'

export interface Profile {
  id: string
  email: string
  company_name: string
  role: UserRole
  company_type: CompanyType | null
  company_size: 'small' | 'medium' | 'large' | null
  rating: number
  total_issues_handled: number
  sla_success_rate: number
  is_flagged: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  vendor_id: string
  name: string
  description: string | null
  category: string
  price_small: number | null
  price_medium: number | null
  price_large: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  vendor?: Profile
}

export interface Contract {
  id: string
  client_id: string
  vendor_id: string
  service_id: string
  status: ContractStatus
  duration_months: number
  cost: number
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  client?: Profile
  vendor?: Profile
  service?: Service
}

export interface Issue {
  id: string
  contract_id: string
  client_id: string
  vendor_id: string
  title: string
  description: string
  priority: IssuePriority
  status: IssueStatus
  service_type: string | null
  ai_response_time_minutes: number | null
  ai_resolution_time_minutes: number | null
  actual_response_time_minutes: number | null
  actual_resolution_time_minutes: number | null
  raised_at: string
  accepted_at: string | null
  started_at: string | null
  resolved_at: string | null
  completed_at: string | null
  reopened_at: string | null
  vendor_notes: string | null
  client_feedback: string | null
  sla_violated: boolean
  created_at: string
  updated_at: string
  contract?: Contract
  client?: Profile
  vendor?: Profile
}

export interface PerformanceRecord {
  id: string
  vendor_id: string
  issue_id: string
  response_time_score: number | null
  resolution_time_score: number | null
  sla_compliance_score: number | null
  overall_score: number | null
  created_at: string
}

export interface Penalty {
  id: string
  vendor_id: string
  issue_id: string | null
  penalty_type: PenaltyType
  reason: string
  month_year: string
  created_at: string
}

export interface Rating {
  id: string
  vendor_id: string
  client_id: string
  contract_id: string | null
  rating: number
  feedback: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

// AI SLA Generation types
export interface SLAConfig {
  serviceType: string
  priority: IssuePriority
  responseTimeMinutes: number
  resolutionTimeMinutes: number
}

// Dashboard stats
export interface DashboardStats {
  activeContracts: number
  issuesRaised: number
  slaCompliancePercent: number
  averageVendorRating: number
}

export interface VendorStats {
  totalIssuesHandled: number
  slaSuccessRate: number
  totalWarnings: number
  totalPenalties: number
  rating: number
  pendingContracts: number
  activeContracts: number
}
