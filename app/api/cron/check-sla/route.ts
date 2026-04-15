import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// This endpoint should be called by a cron job to check for SLA breaches
export async function GET() {
  try {
    const supabase = await createClient()

    // Find issues that have breached their SLA deadline
    const { data: breachedIssues } = await supabase
      .from("issues")
      .select(`
        id,
        title,
        sla_deadline,
        reported_by,
        contracts(vendor_id)
      `)
      .in("status", ["open", "in_progress"])
      .lt("sla_deadline", new Date().toISOString())
      .eq("sla_breached", false)

    if (!breachedIssues || breachedIssues.length === 0) {
      return NextResponse.json({ message: "No SLA breaches found", count: 0 })
    }

    // Mark issues as breached and create notifications
    for (const issue of breachedIssues) {
      // Update issue to mark as breached
      await supabase
        .from("issues")
        .update({ 
          sla_breached: true,
          status: "breached"
        })
        .eq("id", issue.id)

      // Create penalty record
      const { data: contract } = await supabase
        .from("contracts")
        .select("id, vendor_id, price")
        .eq("id", issue.contracts?.vendor_id)
        .single()

      if (contract) {
        const penaltyAmount = (contract.price || 0) * 0.1 // 10% penalty

        await supabase.from("penalties").insert({
          contract_id: contract.id,
          issue_id: issue.id,
          amount: penaltyAmount,
          reason: "SLA breach - resolution deadline exceeded",
          status: "pending"
        })
      }

      // Notify client (reporter)
      await supabase.from("notifications").insert({
        user_id: issue.reported_by,
        type: "sla_breach",
        title: "SLA Breach Alert",
        message: `Issue "${issue.title}" has breached its SLA deadline. Penalty may apply.`,
        related_issue_id: issue.id
      })

      // Notify vendor
      if (issue.contracts?.vendor_id) {
        await supabase.from("notifications").insert({
          user_id: issue.contracts.vendor_id,
          type: "sla_breach",
          title: "SLA Breach Warning",
          message: `You have breached the SLA for issue "${issue.title}". A penalty may be applied.`,
          related_issue_id: issue.id
        })
      }
    }

    return NextResponse.json({ 
      message: "SLA breach check completed",
      count: breachedIssues.length,
      breachedIssueIds: breachedIssues.map(i => i.id)
    })
  } catch (error) {
    console.error("SLA check error:", error)
    return NextResponse.json({ error: "Failed to check SLA breaches" }, { status: 500 })
  }
}
