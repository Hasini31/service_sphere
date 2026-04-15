import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// AI-powered SLA calculation based on issue priority and contract terms
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { contractId, priority, description } = await request.json()

    // Get contract details with service SLA info
    const { data: contract } = await supabase
      .from("contracts")
      .select(`
        *,
        services(
          default_sla_response_hours,
          default_sla_resolution_hours
        )
      `)
      .eq("id", contractId)
      .single()

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Calculate SLA based on priority and contract terms
    const baseResponseHours = contract.sla_response_hours || contract.services?.default_sla_response_hours || 24
    const baseResolutionHours = contract.sla_resolution_hours || contract.services?.default_sla_resolution_hours || 72

    // Priority multipliers
    const priorityMultipliers: Record<string, number> = {
      critical: 0.25,  // 4x faster
      high: 0.5,       // 2x faster
      medium: 1,       // Standard
      low: 1.5         // 1.5x slower (lower priority)
    }

    const multiplier = priorityMultipliers[priority] || 1

    const responseHours = Math.ceil(baseResponseHours * multiplier)
    const resolutionHours = Math.ceil(baseResolutionHours * multiplier)

    // Calculate deadline
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + resolutionHours)

    // AI-enhanced priority suggestion based on keywords in description
    const criticalKeywords = ["down", "outage", "crash", "emergency", "urgent", "critical", "not working"]
    const highKeywords = ["slow", "error", "bug", "issue", "problem", "failing"]
    
    let suggestedPriority = priority
    const lowerDesc = description?.toLowerCase() || ""
    
    if (criticalKeywords.some(kw => lowerDesc.includes(kw))) {
      suggestedPriority = "critical"
    } else if (highKeywords.some(kw => lowerDesc.includes(kw))) {
      suggestedPriority = "high"
    }

    return NextResponse.json({
      slaResponseHours: responseHours,
      slaResolutionHours: resolutionHours,
      slaDeadline: deadline.toISOString(),
      suggestedPriority,
      priorityChanged: suggestedPriority !== priority
    })
  } catch (error) {
    console.error("SLA calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate SLA" }, { status: 500 })
  }
}
