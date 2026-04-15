"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Building2, ArrowRight, Check, X, Loader2, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Contract } from "@/lib/types"
import { addMonths, format } from "date-fns"

interface PendingContractsProps {
  contracts: Contract[]
}

export function PendingContracts({ contracts }: PendingContractsProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (contractId: string, action: "accepted" | "rejected") => {
    setLoadingId(contractId)
    try {
      const supabase = createClient()
      
      const dbStatus = action === "accepted" ? "active" : action
      const updates: Partial<Contract> = { status: dbStatus as any }
      
      if (action === "accepted") {
        const startDate = new Date()
        const contract = contracts.find(c => c.id === contractId)
        if (contract) {
          updates.start_date = startDate.toISOString().split("T")[0]
          // Safety check: Fallback to 12 months if duration is missing
          const duration = contract.duration_months || 12
          updates.end_date = addMonths(startDate, duration).toISOString().split("T")[0]
        }
      }

      const { error } = await supabase
        .from("contracts")
        .update(updates)
        .eq("id", contractId)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(action === "accepted" ? "Contract accepted!" : "Contract rejected")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to update contract")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Pending Contract Requests
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendor/contracts">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-foreground">
                        {contract.client?.company_name || "Unknown Client"}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {contract.service?.name || "Service"}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {contract.duration_months} months
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${contract.cost}/month
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(contract.id, "rejected")}
                      disabled={loadingId === contract.id}
                    >
                      {loadingId === contract.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(contract.id, "accepted")}
                      disabled={loadingId === contract.id}
                    >
                      {loadingId === contract.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
