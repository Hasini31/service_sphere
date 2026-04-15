import { createClient } from "@/lib/supabase/server"
import { calculateAlgorithmicRating } from "@/lib/penalty-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get issue to find contract and vendor
    const { data: issue } = await supabase
      .from("issues")
      .select(`
        id,
        contracts(vendor_id)
      `)
      .eq("id", body.issueId)
      .single()

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    const vendorId = issue.contracts?.vendor_id
    if (!vendorId) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    // Algorithmic Rating Adjustment
    const adjustedRating = await calculateAlgorithmicRating(vendorId, body.rating)

    const { data: rating, error } = await supabase
      .from("ratings")
      .insert({
        issue_id: body.issueId,
        vendor_id: vendorId,
        client_id: profile.id,
        contract_id: issue.contracts?.id,
        rating: adjustedRating,
        feedback: body.feedback
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify vendor
    if (issue.contracts?.vendor_id) {
      await supabase.from("notifications").insert({
        user_id: issue.contracts.vendor_id,
        type: "new_rating",
        title: "New Rating Received",
        message: `You received a ${body.rating}-star rating. ${body.feedback ? `Feedback: "${body.feedback}"` : ""}`,
        related_issue_id: body.issueId
      })
    }

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error("Create rating error:", error)
    return NextResponse.json({ error: "Failed to create rating" }, { status: 500 })
  }
}
