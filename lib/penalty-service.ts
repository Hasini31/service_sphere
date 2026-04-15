import { createClient } from "@/lib/supabase/server"

export interface PenaltyCalculation {
  vendorId: string
  clientId: string
  issueId: string
  breachedResponse: boolean
  breachedResolution: boolean
}

/**
 * On-the-fly Penalty Service
 * Calculates compliance based on the 'issues' table 'sla_violated' status
 */
export async function processIssueCompliance(calc: PenaltyCalculation) {
  const supabase = await createClient()
  const { issueId, breachedResponse, breachedResolution } = calc

  // Mark the issue itself if it breached
  if (breachedResponse || breachedResolution) {
    await supabase.from("issues").update({ 
      sla_violated: true,
      vendor_notes: `SLA Breach: ${breachedResponse ? 'Response Delayed ' : ''}${breachedResolution ? 'Resolution Delayed' : ''}`
    }).eq("id", issueId)
  }

  return { success: true }
}

/**
 * Algorithmic Rating Calculator
 * Adjusts a potential rating based on historical performance tracked in 'issues'
 */
export async function calculateAlgorithmicRating(vendorId: string, baseRating: number) {
  const supabase = await createClient()

  // Count total warnings (SLA violations)
  const { count: warnings } = await supabase
    .from("issues")
    .select("*", { count: 'exact', head: true })
    .eq("vendor_id", vendorId)
    .eq("sla_violated", true)

  if (warnings === null || warnings === 0) return baseRating

  // Formal penalties derived: 1 penalty per 3 warnings
  const formalPenalties = Math.floor(warnings / 3)

  // Algorithm: Base - (Penalties * 0.5) - (Warnings * 0.1)
  // Ensure rating stays between 1 and 5
  let adjustedRating = baseRating - (formalPenalties * 0.5) - (warnings * 0.1)
  
  return Math.max(1, Math.min(5, Number(adjustedRating.toFixed(1))))
}

/**
 * Get Compliance Stats
 * returns { warnings, penalties } for display
 */
export async function getComplianceStats(vendorId: string) {
  const supabase = await createClient()
  const { count: warnings } = await supabase
    .from("issues")
    .select("*", { count: 'exact', head: true })
    .eq("vendor_id", vendorId)
    .eq("sla_violated", true)

  const warningCount = warnings || 0
  const penaltyCount = Math.floor(warningCount / 3)

  return { warnings: warningCount, penalties: penaltyCount }
}
