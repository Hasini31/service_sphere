"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { Issue } from "@/lib/types"

export function PerformanceChart({ issues }: { issues: Issue[] }) {
  // Mock monthly data based on issues length or just dummy data
  const data = [
    { name: "Jan", compliance: 85 },
    { name: "Feb", compliance: 88 },
    { name: "Mar", compliance: 92 },
    { name: "Apr", compliance: issues.length > 5 ? 95 : 90 },
    { name: "May", compliance: 94 },
    { name: "Jun", compliance: 96 },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>SLA Compliance Trend</CardTitle>
        <CardDescription>Monthly performance rate (%)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
        <div className="h-[200px] w-full max-w-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}}
                domain={[70, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="compliance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ fill: "hsl(var(--primary))", r: 4 }} 
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
