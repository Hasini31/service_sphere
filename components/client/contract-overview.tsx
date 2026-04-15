"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, ArrowRight, Building2, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Contract } from "@/lib/types"

interface ContractOverviewProps {
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

export function ContractOverview({ contracts }: ContractOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Active Contracts
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/client/contracts">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No contracts yet</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/client/services">Browse Services</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground">
                      {contract.vendor?.company_name || "Unknown Vendor"}
                    </h4>
                    {contract.vendor?.rating && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {Number(contract.vendor.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {contract.service?.name || "Service"} - ${contract.cost}/month
                  </p>
                </div>
                <Badge variant="outline" className={statusColors[contract.status]}>
                  {contract.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
