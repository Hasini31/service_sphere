"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Contract {
  id: string
  status: string
  contract_value: number
  start_date: string
  end_date: string
  terms: string
  client: {
    id: string
    company_name: string
    full_name: string
  }
  service: {
    id: string
    name: string
    category: string
  }
}

export function VendorContractsList({ initialContracts }: { initialContracts: Contract[] }) {
  const [contracts] = useState(initialContracts)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4">
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No contracts found</p>
          </CardContent>
        </Card>
      ) : (
        contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{contract.service?.name || "Unknown Service"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Client: {contract.client?.company_name || contract.client?.full_name || "Unknown"}
                  </p>
                </div>
                <Badge className={getStatusBadge(contract.status)}>
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contract Value</p>
                  <p className="font-medium">${contract.contract_value?.toLocaleString() || "0"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{contract.service?.category || "N/A"}</p>
                </div>
              </div>
              {contract.terms && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {contract.terms}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
