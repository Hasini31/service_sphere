"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Building2, Star, Calendar, DollarSign, AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Contract } from "@/lib/types"
import { format } from "date-fns"

interface ContractsListProps {
  contracts: Contract[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-200",
  rejected: "bg-red-500/10 text-red-600 border-red-200",
  active: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  cancelled: "bg-slate-500/10 text-slate-600 border-slate-200",
}

export function ContractsList({ contracts }: ContractsListProps) {
  const [activeTab, setActiveTab] = useState("all")

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === "all") return true
    if (activeTab === "active") return contract.status === "active" || contract.status === "accepted"
    if (activeTab === "pending") return contract.status === "pending"
    if (activeTab === "completed") return contract.status === "completed" || contract.status === "rejected" || contract.status === "cancelled"
    return true
  })

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({contracts.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({contracts.filter(c => c.status === "active" || c.status === "accepted").length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({contracts.filter(c => c.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({contracts.filter(c => ["completed", "rejected", "cancelled"].includes(c.status)).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">No contracts found</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/client/services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {contract.service?.name || "Service"}
                        </h3>
                        <Badge variant="outline" className={statusColors[contract.status]}>
                          {contract.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {contract.vendor?.company_name || "Unknown Vendor"}
                        </span>
                        {contract.vendor?.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {Number(contract.vendor.rating).toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {contract.duration_months} months
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${contract.cost}/month
                        </span>
                      </div>

                      {contract.start_date && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {format(new Date(contract.start_date), "MMM dd, yyyy")} - {" "}
                          {contract.end_date ? format(new Date(contract.end_date), "MMM dd, yyyy") : "Ongoing"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/client/contracts/${contract.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
