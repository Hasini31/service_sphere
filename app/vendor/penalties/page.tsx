import { createClient } from "@/lib/supabase/server"
import { VendorPenaltiesList } from "./penalties-list"

export default async function VendorPenaltiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch penalties for vendor
  const { data: penalties } = await supabase
    .from("penalties")
    .select(`
      *,
      issue:issues(title),
      contract:contracts(contract_value, service:services(name))
    `)
    .eq("vendor_id", user.id)
    .order("applied_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Penalties & Infractions
        </h1>
        <p className="text-muted-foreground">Review alerts, SLA breaches, and financial penalties applied to your account.</p>
      </div>
      <VendorPenaltiesList penalties={penalties || []} />
    </div>
  )
}
