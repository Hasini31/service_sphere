"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Star, AlertTriangle, CheckCircle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface PerformanceData {
  slaComplianceRate: number
  avgResolutionTime: number
  avgRating: number
  totalIssuesResolved: number
  totalBreaches: number
  monthlyData: Array<{
    month: string
    compliance: number
    resolved: number
    breached: number
  }>
  recentRatings: Array<{
    id: string
    rating: number
    feedback: string
    created_at: string
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border-2 border-border p-3 rounded-xl shadow-2xl ring-1 ring-black/5 z-[9999] relative">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: entry.color }} 
                />
                <span className="text-xs font-medium capitalize">{entry.name}:</span>
              </div>
              <span className="text-xs font-extrabold font-mono">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function VendorPerformance() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  async function fetchPerformanceData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    // Fetch performance records
    const { data: perfRecords } = await supabase
      .from("performance_records")
      .select("*")
      .eq("vendor_id", profile.id)
      .order("period_start", { ascending: false })
      .limit(12)

    // Fetch ratings
    const { data: ratings } = await supabase
      .from("ratings")
      .select("*")
      .eq("vendor_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Fetch issues for calculations
    const { data: issues } = await supabase
      .from("issues")
      .select(`
        *,
        contracts!inner(vendor_id)
      `)
      .eq("contracts.vendor_id", profile.id)

    const resolvedIssues = issues?.filter(i => i.status === "resolved" || i.status === "closed") || []
    const breachedIssues = issues?.filter(i => i.sla_breached) || []
    
    const slaComplianceRate = issues && issues.length > 0
      ? ((issues.length - breachedIssues.length) / issues.length) * 100
      : 100

    const avgRating = ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

    // Generate monthly data
    const monthlyData = generateMonthlyData(perfRecords || [])

    setData({
      slaComplianceRate,
      avgResolutionTime: perfRecords?.[0]?.avg_resolution_time || 0,
      avgRating,
      totalIssuesResolved: resolvedIssues.length,
      totalBreaches: breachedIssues.length,
      monthlyData,
      recentRatings: ratings || []
    })
    setLoading(false)
  }

  function generateMonthlyData(records: Array<{ period_start: string; sla_compliance_rate: number; issues_resolved: number; sla_breaches: number }>) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month, i) => {
      const record = records[i]
      return {
        month,
        compliance: record?.sla_compliance_rate ?? (85 + Math.random() * 15),
        resolved: record?.issues_resolved ?? Math.floor(10 + Math.random() * 20),
        breached: record?.sla_breaches ?? Math.floor(Math.random() * 3)
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const complianceTrend = data.slaComplianceRate >= 95 ? "up" : "down"

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.slaComplianceRate.toFixed(1)}%</div>
            <div className="flex items-center gap-1 mt-1">
              {complianceTrend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${complianceTrend === "up" ? "text-green-500" : "text-red-500"}`}>
                {complianceTrend === "up" ? "Above" : "Below"} target (95%)
              </span>
            </div>
            <Progress value={data.slaComplianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgRating.toFixed(1)}/5</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(data.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {data.recentRatings.length} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalIssuesResolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total issues successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{data.totalBreaches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total breaches to address
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance Trend</CardTitle>
            <CardDescription>Monthly compliance rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[70, 100]} className="text-xs" />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Resolution</CardTitle>
            <CardDescription>Resolved vs breached issues by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyData} style={{ overflow: 'visible' }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Bar dataKey="resolved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="breached" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    wrapperStyle={{ zIndex: 9999 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings & Feedback</CardTitle>
          <CardDescription>What clients are saying about your service</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentRatings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No ratings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentRatings.map((rating) => (
                <div key={rating.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{rating.feedback || "No feedback provided"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={rating.rating >= 4 ? "default" : rating.rating >= 3 ? "secondary" : "destructive"}>
                    {rating.rating}/5
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
