import { createClient } from "@/lib/supabase/server"
import { VendorContractsList } from "@/components/vendor/vendor-contracts-list"

export default async function VendorContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  // Fetch contracts for vendor
  const { data: contracts } = await supabase
    .from("contracts")
    .select(`
      *,
      client:profiles!contracts_client_id_fkey(*),
      service:services(*)
    `)
    .eq("vendor_id", profile.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contracts</h1>
        <p className="text-muted-foreground">Manage your service agreements and client contracts.</p>
      </div>
      <VendorContractsList initialContracts={contracts || []} />
    </div>
  )
}
