import { createClient } from "@/lib/supabase/server"
import { IssuesList } from "@/components/client/issues-list"

export default async function IssuesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all issues for this client
  const { data: issues } = await supabase
    .from("issues")
    .select("*, vendor:profiles!issues_vendor_id_fkey(*), contract:contracts(*, service:services(*))")
    .eq("client_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Issues</h1>
        <p className="text-muted-foreground">Track and manage all your raised issues.</p>
      </div>

      <IssuesList issues={issues || []} />
    </div>
  )
}
