import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewIssueForm } from "@/components/client/new-issue-form"

interface NewIssuePageProps {
  searchParams: Promise<{ contract?: string }>
}

export default async function NewIssuePage({ searchParams }: NewIssuePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }
  
  // Fetch active contracts for this client
  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, vendor:profiles!contracts_vendor_id_fkey(*), service:services(*)")
    .eq("client_id", user.id)
    .in("status", ["active", "accepted"])
    .order("created_at", { ascending: false })

  const preselectedContract = params.contract || null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Raise New Issue</h1>
        <p className="text-muted-foreground">Create a new issue and AI will generate optimal SLA parameters.</p>
      </div>

      <NewIssueForm contracts={contracts || []} preselectedContractId={preselectedContract} />
    </div>
  )
}
