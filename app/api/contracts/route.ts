import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") // "client" or "vendor"

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

    let query = supabase
      .from("contracts")
      .select(`
        *,
        services(name, category, base_price),
        client:profiles!contracts_client_id_fkey(company_name, email),
        vendor:profiles!contracts_vendor_id_fkey(company_name, email)
      `)
      .order("created_at", { ascending: false })

    if (role === "client") {
      query = query.eq("client_id", profile.id)
    } else if (role === "vendor") {
      query = query.eq("vendor_id", profile.id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch contracts error:", error)
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 })
  }
}

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

    // Get service to find vendor
    const { data: service } = await supabase
      .from("services")
      .select("vendor_id, default_sla_response_hours, default_sla_resolution_hours")
      .eq("id", body.serviceId)
      .single()

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        service_id: body.serviceId,
        client_id: profile.id,
        vendor_id: service.vendor_id,
        start_date: body.startDate,
        end_date: body.endDate,
        price: body.price,
        sla_response_hours: body.slaResponseHours || service.default_sla_response_hours,
        sla_resolution_hours: body.slaResolutionHours || service.default_sla_resolution_hours,
        status: "pending"
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify vendor
    await supabase.from("notifications").insert({
      user_id: service.vendor_id,
      type: "contract_request",
      title: "New Contract Request",
      message: "You have received a new contract request. Please review and respond.",
      related_contract_id: contract.id
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error("Create contract error:", error)
    return NextResponse.json({ error: "Failed to create contract" }, { status: 500 })
  }
}
