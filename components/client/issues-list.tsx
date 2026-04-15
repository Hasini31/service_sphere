"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  AlertCircle, 
  Clock, 
  Building2, 
  Plus, 
  CheckCircle2, 
  XCircle,
  Timer,
  Brain
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Issue } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface IssuesListProps {
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

export function IssuesList({ issues }: IssuesListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [actionType, setActionType] = useState<"complete" | "reopen" | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredIssues = issues.filter(issue => {
    if (activeTab === "all") return true
    if (activeTab === "active") return ["raised", "accepted", "in_progress", "reopened"].includes(issue.status)
    if (activeTab === "resolved") return issue.status === "resolved"
    if (activeTab === "completed") return issue.status === "completed"
    return true
  })

  const handleAction = async () => {
    if (!selectedIssue || !actionType) return
    setIsLoading(true)

    try {
      const supabase = createClient()
      const updates: Partial<Issue> = {
        client_feedback: feedback || null,
      }

      if (actionType === "complete") {
        updates.status = "completed"
        updates.completed_at = new Date().toISOString()
      } else if (actionType === "reopen") {
        updates.status = "reopened"
        updates.reopened_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("issues")
        .update(updates)
        .eq("id", selectedIssue.id)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(actionType === "complete" ? "Issue marked as completed!" : "Issue reopened")
      setSelectedIssue(null)
      setActionType(null)
      setFeedback("")
      router.refresh()
    } catch {
      toast.error("Failed to update issue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({issues.filter(i => ["raised", "accepted", "in_progress", "reopened"].includes(i.status)).length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({issues.filter(i => i.status === "resolved").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({issues.filter(i => i.status === "completed").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button asChild>
          <Link href="/client/issues/new">
            <Plus className="mr-2 h-4 w-4" />
            New Issue
          </Link>
        </Button>
      </div>

      {filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">No issues found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{issue.title}</h3>
                        <Badge variant="outline" className={statusColors[issue.status]}>
                          {issue.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[issue.priority]}>
                          {issue.priority}
                        </Badge>
                      </div>
                      
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {issue.vendor?.company_name || "Unknown Vendor"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(issue.created_at || new Date()), { addSuffix: true })}
                        </span>
                      </div>

                      {/* SLA Info */}
                      {(issue.ai_response_time_minutes || issue.ai_resolution_time_minutes) && (
                        <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                          <Brain className="h-5 w-5 text-primary" />
                          <div className="flex gap-6 text-sm">
                            {issue.ai_response_time_minutes && (
                              <div>
                                <span className="text-muted-foreground">Response SLA: </span>
                                <span className="font-medium text-foreground">
                                  {issue.ai_response_time_minutes} min
                                </span>
                              </div>
                            )}
                            {issue.ai_resolution_time_minutes && (
                              <div>
                                <span className="text-muted-foreground">Resolution SLA: </span>
                                <span className="font-medium text-foreground">
                                  {Math.floor(issue.ai_resolution_time_minutes / 60)}h {issue.ai_resolution_time_minutes % 60}m
                                </span>
                              </div>
                            )}
                          </div>
                          {issue.sla_violated && (
                            <Badge variant="destructive" className="ml-auto">
                              SLA Violated
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions for resolved issues */}
                    {issue.status === "resolved" && (
                      <div className="ml-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedIssue(issue)
                            setActionType("complete")
                          }}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedIssue(issue)
                            setActionType("reopen")
                          }}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reopen
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedIssue && !!actionType} onOpenChange={() => {
        setSelectedIssue(null)
        setActionType(null)
        setFeedback("")
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "complete" ? "Accept Resolution" : "Reopen Issue"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "complete" 
                ? "Confirm that the issue has been resolved to your satisfaction."
                : "Reopen this issue if it hasn't been properly resolved."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {actionType === "complete" ? "Feedback (optional)" : "Reason for reopening"}
              </label>
              <Textarea
                placeholder={actionType === "complete" 
                  ? "Any feedback about the resolution..."
                  : "Please explain why you're reopening this issue..."}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedIssue(null)
              setActionType(null)
              setFeedback("")
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={isLoading}
              variant={actionType === "reopen" ? "destructive" : "default"}
            >
              {isLoading ? "Processing..." : actionType === "complete" ? "Confirm" : "Reopen Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
