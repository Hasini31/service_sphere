import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from("contracts")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get contract details for notification
    const { data: contract } = await supabase
      .from("contracts")
      .select("client_id, vendor_id")
      .eq("id", id)
      .single()

    if (contract && body.status) {
      // Notify the other party
      const notifyUserId = body.status === "active" || body.status === "rejected"
        ? contract.client_id  // Vendor responded, notify client
        : contract.vendor_id  // Client updated, notify vendor

      await supabase.from("notifications").insert({
        user_id: notifyUserId,
        type: "contract_updated",
        title: "Contract Status Updated",
        message: `Contract status has been updated to ${body.status}.`,
        related_contract_id: id
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update contract error:", error)
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 })
  }
}
