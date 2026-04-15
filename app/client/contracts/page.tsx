import { createClient } from "@/lib/supabase/server"
import { ContractsList } from "@/components/client/contracts-list"

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all contracts for this client
  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, vendor:profiles!contracts_vendor_id_fkey(*), service:services(*)")
    .eq("client_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contracts</h1>
        <p className="text-muted-foreground">Manage your contracts with vendors.</p>
      </div>

      <ContractsList contracts={contracts || []} />
    </div>
  )
}
