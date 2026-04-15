"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, DollarSign, Target, Check, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

export function VendorContractsList({ initialContracts }: { initialContracts: any[] }) {
  const [contracts, setContracts] = useState(initialContracts)
  const supabase = createClient()

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("contracts")
      .update({ status })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update status")
    } else {
      toast.success(`Contract ${status === 'active' ? 'accepted' : 'rejected'}`)
      const { data } = await supabase
        .from("contracts")
        .select(`
          *,
          client:profiles!contracts_client_id_fkey(*),
          service:services(*)
        `)
        .eq("id", id)
        .single()
      
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    }
  }

  const activeContracts = contracts.filter(c => c.status === "active")
  const pendingContracts = contracts.filter(c => c.status === "pending" || c.status === "accepted")
  const completedContracts = contracts.filter(c => c.status === "completed" || c.status === "cancelled")

  function ContractCard({ contract }: { contract: any }) {
    const isPending = contract.status === "pending" || contract.status === "accepted"
    
    return (
      <Card key={contract.id} className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{contract.service?.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" /> {contract.client?.company_name}
              </CardDescription>
            </div>
            <Badge 
              variant={contract.status === "active" ? "outline" : "secondary"}
              className={contract.status === "active" ? "border-green-500/20 bg-green-500/10 text-green-600 px-1 py-1 rounded-full" : "uppercase text-[10px]"}
            >
              {contract.status === "active" ? (
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              ) : (
                contract.status.toUpperCase()
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Start Date</span>
              <p className="font-semibold flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                {contract.start_date ? format(new Date(contract.start_date), "MMM d, yyyy") : "TBD"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">MRR</span>
              <p className="font-semibold flex items-center gap-1 text-primary">
                <DollarSign className="h-3 w-3" />
                {contract.cost || contract.contract_value || 0}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed pt-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Res. SLA</span>
                <span className="font-mono">{contract.sla_resolution_hours}h</span>
              </div>
            </div>
            {isPending && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" onClick={() => updateStatus(contract.id, 'rejected')}>
                  <X className="h-3 w-3 mr-1" /> Reject
                </Button>
                <Button size="sm" className="h-8 px-2" onClick={() => updateStatus(contract.id, 'active')}>
                  <Check className="h-3 w-3 mr-1" /> Accept
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
        <TabsTrigger value="active">Active ({activeContracts.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({pendingContracts.length})</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="mt-6">
        {activeContracts.length === 0 ? (
          <EmptyState message="No active contracts found." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeContracts.map(c => <ContractCard key={c.id} contract={c} />)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-6">
        {pendingContracts.length === 0 ? (
          <EmptyState message="No pending requests." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingContracts.map(c => <ContractCard key={c.id} contract={c} />)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        {completedContracts.length === 0 ? (
          <EmptyState message="No contract history." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-70">
            {completedContracts.map(c => <ContractCard key={c.id} contract={c} />)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-muted/10 border-dashed">
      <CardContent className="py-12 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>{message}</p>
      </CardContent>
    </Card>
  )
}
