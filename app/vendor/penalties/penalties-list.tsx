"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, DollarSign, Calendar } from "lucide-react"

export function VendorPenaltiesList({ penalties }: { penalties: any[] }) {
  if (penalties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <span className="text-green-500 text-2xl font-bold">✓</span>
          </div>
          <p className="text-lg">Excellent!</p>
          <p>You have zero SLA breaches or penalties on your account.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {penalties.map(penalty => (
        <Card key={penalty.id} className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">Penalty: {penalty.penalty_type.toUpperCase()}</CardTitle>
              </div>
              <Badge variant="destructive">${penalty.amount || 0}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{penalty.reason || "SLA breach violation."}</p>
            <div className="grid grid-cols-2 gap-4 mt-4 py-2 border-t border-destructive/20 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase tracking-wider">Related Issue</span>
                <span className="font-medium">{penalty.issue?.title || "Unknown Issue"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase tracking-wider">Date Applied</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(penalty.applied_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
