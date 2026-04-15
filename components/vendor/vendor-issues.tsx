"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Clock, CheckCircle, XCircle, AlertTriangle, Package } from "lucide-react"
import type { Issue } from "@/lib/types"

const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: XCircle,
  breached: AlertTriangle,
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-muted text-muted-foreground",
  breached: "bg-destructive/20 text-destructive",
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-destructive/20 text-destructive",
}

export function VendorIssues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    fetchIssues()
  }, [])

  async function fetchIssues() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    const { data } = await supabase
      .from("issues")
      .select(`
        *,
        contracts!inner(
          vendor_id,
          services(name)
        )
      `)
      .eq("contracts.vendor_id", profile.id)
      .order("created_at", { ascending: false })

    if (data) setIssues(data)
    setLoading(false)
  }

  async function updateIssueStatus(issueId: string, newStatus: string) {
    const updateData: Record<string, unknown> = { status: newStatus }
    
    if (newStatus === "resolved") {
      updateData.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("issues")
      .update(updateData)
      .eq("id", issueId)

    if (!error) {
      fetchIssues()
    }
  }

  // 1. Get all unique service names from all issues (for structure)
  const allServiceNames = Array.from(new Set(issues.map(i => (i.contracts as any)?.services?.name || "Other Services")))

  // 2. Filter issues
  const filteredIssues = filter === "all" 
    ? issues 
    : issues.filter(issue => issue.status === filter)

  // 3. Group filtered issues
  const issuesByService = filteredIssues.reduce((acc, issue) => {
    const serviceName = (issue.contracts as any)?.services?.name || "Other Services"
    if (!acc[serviceName]) acc[serviceName] = []
    acc[serviceName].push(issue)
    return acc
  }, {} as Record<string, Issue[]>)

  const openIssues = issues.filter(i => i.status === "open" || i.status === "in_progress" || i.status === "raised")

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 px-6">
        {[1, 2].map(i => (
          <Card key={i} className="h-[400px] animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 px-6 pb-12">
      {/* Header & Global Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20 p-6 rounded-2xl border border-muted-foreground/10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assigned Issues</h2>
          <p className="text-sm text-muted-foreground">
            {openIssues.length} active tasks across {allServiceNames.length} services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Filter By</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-background border-2 font-semibold">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Total Overview</SelectItem>
              <SelectItem value="raised">Raised / New</SelectItem>
              <SelectItem value="in_progress">Currently Fixing</SelectItem>
              <SelectItem value="resolved">Resolved Tasks</SelectItem>
              <SelectItem value="closed">Closed Archive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Grid: One Card per Service */}
      <div className="grid gap-8 lg:grid-cols-2">
        {allServiceNames.map(serviceName => {
          const serviceIssues = issuesByService[serviceName] || []
          
          // Only skip empty services IF we are filtering. (If 'all', we show them maybe? No, let's only show active ones to keep it clean)
          if (serviceIssues.length === 0 && filter !== "all") return null
          if (serviceIssues.length === 0 && issues.filter(i => ((i.contracts as any)?.services?.name || "Other Services") === serviceName).length === 0) return null

          return (
            <div key={serviceName} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-extrabold text-sm uppercase tracking-[0.2em] text-foreground/80">
                    {serviceName}
                  </h3>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {serviceIssues.length} Matches
                </Badge>
              </div>

              <div className="space-y-3">
                {serviceIssues.length === 0 ? (
                  <Card className="border-dashed bg-muted/5">
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground font-medium">No {filter.replace("_", " ")} issues for this service.</p>
                    </CardContent>
                  </Card>
                ) : (
                  serviceIssues.map((issue) => {
                    const StatusIcon = statusIcons[issue.status as keyof typeof statusIcons] || AlertCircle
                    const deadline = issue.sla_resolution_deadline ? new Date(issue.sla_resolution_deadline) : null
                    const isOverdue = deadline && new Date() > deadline && issue.status !== "resolved" && issue.status !== "closed"
                    
                    return (
                      <Card 
                        key={issue.id}
                        className={`group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${isOverdue ? "border-destructive/40 bg-destructive/5" : "border-muted-foreground/10 hover:border-primary/30"}`}
                      >
                        <CardHeader className="p-5 pb-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isOverdue ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-primary"}`}>
                                <StatusIcon className="h-4 w-4" />
                              </div>
                              <h4 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                                {issue.title}
                              </h4>
                            </div>
                            <Badge className={`${priorityColors[issue.priority as keyof typeof priorityColors]} text-[9px] h-5 uppercase px-2`}>
                              {issue.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-5 pt-0 space-y-4">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {issue.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className={`${statusColors[issue.status as keyof typeof statusColors]} border-none text-[9px] font-bold`}>
                                {issue.status.replace("_", " ")}
                              </Badge>
                              {deadline && (
                                <p className={`text-[10px] flex items-center gap-1.5 ${isOverdue ? "text-destructive font-black" : "text-muted-foreground/70"}`}>
                                  <Clock className="h-3 w-3" />
                                  {format(deadline, "MMM d, HH:mm")}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {issue.status === "raised" && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                                  onClick={() => updateIssueStatus(issue.id, "in_progress")}
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                              {(issue.status === "in_progress" || issue.status === "raised") && (
                                <Button 
                                  size="sm" 
                                  className="h-8 px-3 rounded-full bg-primary hover:bg-primary/90 shadow-sm"
                                  onClick={() => updateIssueStatus(issue.id, "resolved")}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                  <span className="text-[10px] font-bold">Fix</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
