import { createClient } from "@/lib/supabase/server"
import { VendorStats } from "@/components/vendor/vendor-stats"
import { PendingContracts } from "@/components/vendor/pending-contracts"
import { ActiveIssuesOverview } from "@/components/vendor/active-issues-overview"

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch vendor data
  const [profileResult, contractsResult, issuesResult, penaltiesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user?.id).single(),
    supabase
      .from("contracts")
      .select("*, client:profiles!contracts_client_id_fkey(*), service:services(*)")
      .eq("vendor_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("issues")
      .select("*, client:profiles!issues_client_id_fkey(*), contract:contracts(*, service:services(*))")
      .eq("vendor_id", user?.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("penalties")
      .select("*")
      .eq("vendor_id", user?.id)
  ])

  const profile = profileResult.data
  const contracts = contractsResult.data || []
  const issues = issuesResult.data || []
  const penalties = penaltiesResult.data || []

  // Calculate stats
  const pendingContracts = contracts.filter(c => c.status === "pending").length
  const activeContracts = contracts.filter(c => c.status === "active" || c.status === "accepted").length
  const totalIssuesHandled = issues.length
  const resolvedIssues = issues.filter(i => i.status === "completed" || i.status === "resolved").length
  const slaSuccessRate = totalIssuesHandled > 0 
    ? Math.round((issues.filter(i => !i.sla_violated).length / totalIssuesHandled) * 100)
    : 100
  const warnings = penalties.filter(p => p.penalty_type === "warning").length
  const totalPenalties = penalties.filter(p => p.penalty_type === "penalty").length

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Dashboard</h1>
        <p className="text-muted-foreground">Track your performance and manage contracts with precision.</p>
      </header>

        <section>
          <VendorStats 
            totalIssuesHandled={totalIssuesHandled}
            slaSuccessRate={slaSuccessRate}
            warnings={warnings}
            penalties={totalPenalties}
            rating={profile?.rating || 5}
            pendingContracts={pendingContracts}
            activeContracts={activeContracts}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="h-full">
            <PendingContracts contracts={contracts.filter(c => c.status === "pending").slice(0, 3)} />
          </section>
          <section className="h-full">
            <ActiveIssuesOverview issues={issues.filter(i => !["completed", "resolved"].includes(i.status)).slice(0, 4)} />
          </section>
        </div>
    </div>
  )
}
