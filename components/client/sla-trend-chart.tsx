"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart as LineChartIcon } from "lucide-react"
import type { Issue } from "@/lib/types"
import { format, subDays, startOfDay } from "date-fns"

interface SLATrendChartProps {
  issues: Issue[]
}

export function SLATrendChart({ issues }: SLATrendChartProps) {
  const chartData = useMemo(() => {
    // Generate last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i))
      return {
        date,
        dateStr: format(date, "MMM dd"),
        issues: 0,
        resolved: 0,
        slaCompliant: 0,
      }
    })

    // Count issues per day
    issues.forEach(issue => {
      const issueDate = startOfDay(new Date(issue.raised_at))
      const dayData = days.find(d => d.date.getTime() === issueDate.getTime())
      if (dayData) {
        dayData.issues++
        if (issue.status === "completed" || issue.status === "resolved") {
          dayData.resolved++
        }
        if (!issue.sla_violated) {
          dayData.slaCompliant++
        }
      }
    })

    return days.map(d => ({
      name: d.dateStr,
      issues: d.issues,
      resolved: d.resolved,
      compliance: d.issues > 0 ? Math.round((d.slaCompliant / d.issues) * 100) : 100,
    }))
  }, [issues])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-primary" />
          SLA Trend (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <LineChartIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No data to display yet</p>
            </div>
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="issues" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                  name="Issues Raised"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                  name="Resolved"
                />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-3))' }}
                  name="SLA Compliance %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
