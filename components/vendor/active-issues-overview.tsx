"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, ArrowRight } from "lucide-react"
import type { Issue } from "@/lib/types"

export function ActiveIssuesOverview({ issues }: { issues: Issue[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>Latest active issues requiring your attention</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendor/issues">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active issues found.</p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <div>
                    <h4 className="text-sm font-medium">{issue.title}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{issue.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={issue.priority === "critical" ? "destructive" : "secondary"} className="text-[10px] h-5">
                    {issue.priority}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {issue.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
