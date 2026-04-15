import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get("contractId")
    const status = searchParams.get("status")

    let query = supabase
      .from("issues")
      .select(`
        *,
        contracts(
          id,
          services(name, category),
          profiles!contracts_client_id_fkey(company_name),
          vendor:profiles!contracts_vendor_id_fkey(company_name)
        )
      `)
      .order("created_at", { ascending: false })

    if (contractId) {
      query = query.eq("contract_id", contractId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch issues error:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      contractId,
      title,
      description,
      priority,
      slaDeadline
    } = body

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Create the issue
    const { data: issue, error } = await supabase
      .from("issues")
      .insert({
        contract_id: contractId,
        title,
        description,
        priority,
        status: "open",
        sla_deadline: slaDeadline,
        reported_by: profile.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for vendor
    const { data: contract } = await supabase
      .from("contracts")
      .select("vendor_id")
      .eq("id", contractId)
      .single()

    if (contract) {
      await supabase.from("notifications").insert({
        user_id: contract.vendor_id,
        type: "issue_created",
        title: "New Issue Reported",
        message: `A new ${priority} priority issue "${title}" has been reported.`,
        related_issue_id: issue.id
      })
    }

    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    console.error("Create issue error:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
