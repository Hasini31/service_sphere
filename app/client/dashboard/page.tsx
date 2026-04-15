import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/client/dashboard-stats"
import { RecentIssues } from "@/components/client/recent-issues"
import { ContractOverview } from "@/components/client/contract-overview"

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch dashboard data
  const [contractsResult, issuesResult] = await Promise.all([
    supabase
      .from("contracts")
      .select("*, vendor:profiles!contracts_vendor_id_fkey(*), service:services(*)")
      .eq("client_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("issues")
      .select("*, vendor:profiles!issues_vendor_id_fkey(*), contract:contracts(*)")
      .eq("client_id", user?.id)
      .order("created_at", { ascending: false })
  ])

  const contracts = contractsResult.data || []
  const issues = issuesResult.data || []

  // Calculate stats
  const activeContracts = contracts.filter(c => c.status === "active" || c.status === "accepted").length
  const totalIssues = issues.length
  const activeIssues = issues.filter(i => i.status === "open" || i.status === "in_progress").length
  const resolvedIssues = issues.filter(i => i.status === "completed" || i.status === "resolved").length
  const slaCompliance = totalIssues > 0 
    ? Math.round((issues.filter(i => !i.sla_violated).length / totalIssues) * 100)
    : 100

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back! Here is your SLA overview.</p>
      </div>

      <DashboardStats 
        activeContracts={activeContracts}
        totalIssues={totalIssues}
        slaCompliance={slaCompliance}
        activeIssues={activeIssues}
      />

      <div className="mt-8 space-y-6">
        <ContractOverview contracts={contracts.filter(c => c.status === "active" || c.status === "accepted").slice(0, 5)} />
      </div>

      <div className="mt-6">
        <RecentIssues issues={issues.slice(0, 5)} />
      </div>
    </div>
  )
}
