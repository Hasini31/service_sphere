"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Issue } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface RecentIssuesProps {
  issues: Issue[]
}

const statusColors: Record<string, string> = {
  raised: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-orange-500/10 text-orange-600 border-orange-200",
  resolved: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  reopened: "bg-red-500/10 text-red-600 border-red-200",
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-600",
  medium: "bg-blue-500/10 text-blue-600",
  high: "bg-orange-500/10 text-orange-600",
  critical: "bg-red-500/10 text-red-600",
}

export function RecentIssues({ issues }: RecentIssuesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Recent Issues
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/client/issues">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No issues yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{issue.title}</h4>
                    <Badge variant="outline" className={priorityColors[issue.priority]}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{issue.vendor?.company_name || "Unknown Vendor"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(issue.created_at || new Date()), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[issue.status]}>
                  {issue.status.replace("_", " ")}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
