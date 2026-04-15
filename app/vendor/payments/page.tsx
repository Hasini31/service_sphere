import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, CheckCircle2, Clock, Building2 } from "lucide-react"

export default async function VendorPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  const { data: contracts } = await supabase
    .from("contracts")
    .select(`
      *,
      client:profiles!contracts_client_id_fkey(company_name, company_size, email),
      service:services(name)
    `)
    .eq("vendor_id", profile.id)
    .order("created_at", { ascending: false })

  const totalMonthlyRevenue = contracts?.filter(c => c.status === 'active').reduce((acc, c) => acc + (c.cost || 0), 0) || 0

  return (
    <div className="space-y-8 italic">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments & Revenue</h1>
          <p className="text-muted-foreground">Track your subscription income and client payment status</p>
        </div>
        <Card className="bg-primary text-primary-foreground min-w-[200px]">
          <CardContent className="p-4 flex flex-col items-center">
            <p className="text-xs uppercase font-bold opacity-80">Monthly Revenue</p>
            <p className="text-3xl font-extrabold">${totalMonthlyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {contracts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No payment records found.</p>
            </CardContent>
          </Card>
        ) : (
          contracts?.map((contract) => (
            <Card key={contract.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{contract.client?.company_name}</h3>
                      <p className="text-sm text-muted-foreground">{contract.service?.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Monthly Rate</p>
                      <p className="text-xl font-bold font-mono text-primary">${contract.cost || 0}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Status</p>
                      <Badge 
                        variant={contract.status === 'active' ? 'default' : 'secondary'}
                        className={contract.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {contract.status === 'active' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {contract.status}
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 px-6 py-2 flex justify-between text-[11px] text-muted-foreground border-t">
                  <span>Contract ID: {contract.id.slice(0, 8)}...</span>
                  <span>Email: {contract.client?.email}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
