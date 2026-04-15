import { createClient } from "@/lib/supabase/server"
import { processIssueCompliance } from "@/lib/penalty-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
      .from("issues")
      .select(`
        *,
        contracts(
          id,
          services(name, category),
          profiles!contracts_client_id_fkey(company_name, email),
          vendor:profiles!contracts_vendor_id_fkey(company_name, email)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch issue error:", error)
    return NextResponse.json({ error: "Failed to fetch issue" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = { ...body }

    // If status is being set to resolved, add resolved_at timestamp
    if (body.status === "resolved") {
      updateData.resolved_at = new Date().toISOString()

      // Check if SLA was breached
      const { data: issue } = await supabase
        .from("issues")
        .select("sla_deadline")
        .eq("id", id)
        .single()

      if (issue?.sla_deadline) {
        const deadline = new Date(issue.sla_deadline)
        if (new Date() > deadline) {
          updateData.sla_breached = true
        }
      }

      // Track violation for warnings/penalties
      const { data: fullIssue } = await supabase
        .from("issues")
        .select("*")
        .eq("id", id)
        .single()

      if (fullIssue) {
        const breachedResponse = (fullIssue.actual_response_time_minutes || 0) > (fullIssue.ai_response_time_minutes || 60)
        const breachedResolution = (fullIssue.actual_resolution_time_minutes || 0) > (fullIssue.ai_resolution_time_minutes || 480)

        await processIssueCompliance({
          vendorId: fullIssue.vendor_id,
          clientId: fullIssue.client_id,
          issueId: id,
          breachedResponse,
          breachedResolution
        })
      }
    }

    const { data, error } = await supabase
      .from("issues")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for reporter
    const { data: issue } = await supabase
      .from("issues")
      .select("reported_by, title")
      .eq("id", id)
      .single()

    if (issue && body.status) {
      await supabase.from("notifications").insert({
        user_id: issue.reported_by,
        type: "issue_updated",
        title: "Issue Status Updated",
        message: `Issue "${issue.title}" has been updated to ${body.status}.`,
        related_issue_id: id
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update issue error:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}
