import { createClient } from "@/lib/supabase/server"
import { ServicesList } from "@/components/client/services-list"

export default async function ServicesPage() {
  const supabase = await createClient()
  
  // Fetch all active services with vendor info
  const { data: services } = await supabase
    .from("services")
    .select("*, vendor:profiles!services_vendor_id_fkey(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Find Services</h1>
        <p className="text-muted-foreground">Browse available services and create contracts with vendors.</p>
      </div>

      <ServicesList services={services || []} />
    </div>
  )
}
