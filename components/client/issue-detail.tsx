"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Star, Building2 } from "lucide-react"
import type { Issue } from "@/lib/types"

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

interface IssueDetailProps {
  issueId: string
}

export function IssueDetail({ issueId }: IssueDetailProps) {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchIssue()
    checkExistingRating()
  }, [issueId])

  async function fetchIssue() {
    const { data } = await supabase
      .from("issues")
      .select(`
        *,
        contracts(
          id,
          services(name, category),
          vendor:profiles!contracts_vendor_id_fkey(company_name)
        )
      `)
      .eq("id", issueId)
      .single()

    if (data) setIssue(data)
    setLoading(false)
  }

  async function checkExistingRating() {
    const { data } = await supabase
      .from("ratings")
      .select("id")
      .eq("issue_id", issueId)
      .single()

    if (data) setHasRated(true)
  }

  async function submitRating() {
    if (rating === 0) return
    setSubmittingRating(true)

    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issueId,
        rating,
        feedback
      })
    })

    if (response.ok) {
      setHasRated(true)
    }
    setSubmittingRating(false)
  }

  async function closeIssue() {
    const { error } = await supabase
      .from("issues")
      .update({ status: "closed" })
      .eq("id", issueId)

    if (!error) {
      fetchIssue()
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!issue) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p>Issue not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const deadline = issue.sla_deadline ? new Date(issue.sla_deadline) : null
  const isOverdue = deadline && new Date() > deadline && issue.status !== "resolved" && issue.status !== "closed"
  const canRate = (issue.status === "resolved" || issue.status === "closed") && !hasRated
  const canClose = issue.status === "resolved"

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Issues
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{issue.title}</CardTitle>
              <CardDescription className="mt-2">
                Reported on {new Date(issue.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[issue.priority as keyof typeof priorityColors]}>
                {issue.priority}
              </Badge>
              <Badge className={statusColors[issue.status as keyof typeof statusColors]}>
                {issue.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Service Provider</p>
                <p className="font-medium">{(issue as Record<string, unknown>).contracts?.vendor?.company_name || "N/A"}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 border rounded-lg ${isOverdue ? "border-destructive bg-destructive/5" : ""}`}>
              <Clock className={`h-5 w-5 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm text-muted-foreground">SLA Deadline</p>
                <p className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                  {deadline ? deadline.toLocaleString() : "Not set"}
                  {isOverdue && " (OVERDUE)"}
                </p>
              </div>
            </div>
          </div>

          {issue.sla_breached && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">SLA Breached</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This issue exceeded its SLA deadline. A penalty may apply to the service provider.
              </p>
            </div>
          )}

          {issue.resolved_at && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Resolved</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This issue was resolved on {new Date(issue.resolved_at).toLocaleString()}
              </p>
            </div>
          )}

          {canClose && (
            <div className="flex justify-end">
              <Button onClick={closeIssue}>
                Close Issue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Section */}
      {canRate && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Service</CardTitle>
            <CardDescription>
              How was your experience with the resolution of this issue?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this service..."
                rows={4}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={submitRating} 
              disabled={rating === 0 || submittingRating}
            >
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasRated && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="font-medium">Thank you for your feedback!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your rating helps improve service quality.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
