import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { motion } from "framer-motion"
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Star,
  ArrowLeft,
  Activity,
  CheckCircle2,
  FileText,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default async function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Contract & Relational Data (Vendor, Service)
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select(`
      *,
      vendor:profiles!contracts_vendor_id_fkey(*),
      service:services(*)
    `)
    .eq("id", id)
    .single()

  if (contractError || !contract) {
    notFound()
  }

  // 2. Fetch Issues for this Contract
  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .eq("contract_id", contract.id)
    .order("created_at", { ascending: false })

  const allIssues = issues || []
  const activeIssues = allIssues.filter(i => ["raised", "in_progress", "reopened"].includes(i.status))
  const pastIssues = allIssues.filter(i => ["resolved", "completed"].includes(i.status))
  
  // Calculate SLA Breaches
  const breachedIssues = allIssues.filter(i => i.sla_breached)

  // 3. Fetch Ratings related to this Contract
  const { data: ratingsData } = await supabase
    .from("ratings")
    .select("*")
    .eq("vendor_id", contract.vendor_id)

  const ratings = ratingsData || []
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : "N/A"

  // 4. Determine Status Colors
  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-200",
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    completed: "bg-blue-500/10 text-blue-600 border-blue-200",
  }

  const issueStatusColors: Record<string, string> = {
    raised: "bg-yellow-500/10 text-yellow-600",
    in_progress: "bg-orange-500/10 text-orange-600",
    resolved: "bg-green-500/10 text-green-600",
    completed: "bg-emerald-500/10 text-emerald-600",
  }

  const complianceRate = allIssues.length > 0 
    ? Math.round(((allIssues.length - breachedIssues.length) / allIssues.length) * 100)
    : 100

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/client/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Details</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        {/* Row 1, Col 1: Vendor & Contract Info */}
        <Card className="shadow-md h-full flex flex-col">
          <CardHeader className="pb-3 px-6 pt-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="text-lg font-bold">{contract.service?.name || "Premium Service"}</CardTitle>
                <CardDescription className="text-xs">{contract.vendor?.company_name}</CardDescription>
              </div>
              <Badge variant="outline" className={statusColors[contract.status] || "bg-muted font-bold text-[9px] px-1.5"}>
                {contract.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 pt-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Start Date
              </span>
              <span className="font-semibold">{new Date(contract.start_date || contract.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" /> End Date
              </span>
              <span className="font-semibold">{contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "Ongoing"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <DollarSign className="h-3.5 w-3.5 text-primary" /> Value
              </span>
              <span className="font-semibold">${contract.contract_value?.toLocaleString() || "N/A"}</span>
            </div>
            
            <div className="pt-3 border-t mt-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Service Level Agreement (SLA)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Response Target:</span>
                  <span className="font-bold">{contract.sla_response_hours}h</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Resolution Target:</span>
                  <span className="font-bold">{contract.sla_resolution_hours}h</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-destructive font-bold uppercase tracking-tighter">Penalty:</span>
                  <span className="font-bold text-destructive">{contract.penalty_percentage}% breach</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 1, Col 2: Active Issues */}
        <Card className="border-primary/20 shadow-sm h-full flex flex-col">
          <CardHeader className="bg-primary/5 rounded-t-lg border-b border-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Present Active Issues
              </CardTitle>
              <Badge variant="secondary">{activeIssues.length} Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {activeIssues.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[290px]">
                <CheckCircle2 className="h-10 w-10 text-green-500/50 mb-3" />
                <p>All clear! No active issues right now.</p>
              </div>
            ) : (
              <div className="divide-y">
                {activeIssues.slice(0, 5).map(issue => (
                  <div key={issue.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <Badge variant="outline" className={issueStatusColors[issue.status] || "bg-muted font-bold text-[10px] uppercase"}>
                            {issue.status.replace("_", " ")}
                          </Badge>
                          {issue.sla_breached && <Badge variant="destructive" className="h-5 text-[10px]">BREACHED</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Opened: {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/client/issues">Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {activeIssues.length > 5 && (
                  <div className="p-4 text-center border-t mt-auto">
                    <Button variant="link" asChild>
                      <Link href="/client/issues">View All Active Issues ({activeIssues.length})</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Row 2, Col 1: Vendor Performance Overview */}
        <Card className="h-full flex flex-col">
          <CardHeader className="p-6 pb-2 text-center sm:text-left">
            <CardTitle className="text-base font-bold text-muted-foreground uppercase tracking-wider">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6 flex-1">
            <div>
              <div className="flex justify-between text-[10px] mb-1.5 uppercase font-bold tracking-widest text-muted-foreground/80">
                <span>Compliance ({complianceRate}%)</span>
                {complianceRate >= 90 ? (
                  <span className="text-green-600">Excellent</span>
                ) : (
                  <span className="text-orange-600">Alert</span>
                )}
              </div>
              <Progress value={complianceRate} className={`h-2 ${complianceRate < 90 ? "bg-orange-100" : "bg-green-100"}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 text-center">
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 shadow-sm flex flex-col justify-center">
                <Star className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                <p className="text-lg font-black leading-none">{avgRating}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1 tracking-tight">Rating</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 shadow-sm flex flex-col justify-center">
                <ShieldAlert className="h-4 w-4 mx-auto text-destructive mb-1" />
                <p className="text-lg font-black text-destructive leading-none">{breachedIssues.length}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1 tracking-tight">Breaches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 2, Col 2: Issue History */}
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                Issue History
              </CardTitle>
              <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">Total: {pastIssues.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {pastIssues.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[200px]">
                <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p>No past issues recorded for this contract.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pastIssues.slice(0, 5).map(issue => (
                  <div key={issue.id} className="p-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">{issue.title}</h4>
                      <Badge variant="outline" className="text-[10px] h-5 font-bold uppercase">{issue.status}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Resolved on: {new Date(issue.resolved_at || issue.created_at).toLocaleDateString()}</span>
                      {issue.sla_breached ? (
                        <span className="text-destructive font-bold flex items-center gap-1 text-[10px] uppercase">
                          <ShieldAlert className="h-3 w-3" /> SLA Missed
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold flex items-center gap-1 text-[10px] uppercase">
                          <CheckCircle2 className="h-3 w-3" /> SLA Met
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {pastIssues.length > 5 && (
                  <div className="p-4 text-center border-t mt-auto">
                    <Button variant="link" asChild>
                      <Link href="/client/issues">View Full History ({pastIssues.length})</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
