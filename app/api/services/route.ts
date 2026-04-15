import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const vendorId = searchParams.get("vendorId")

    let query = supabase
      .from("services")
      .select(`
        *,
        profiles!services_vendor_id_fkey(company_name, email)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (vendorId) {
      query = query.eq("vendor_id", vendorId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch services error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
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
      .select("id, role")
      .eq("user_id", user.id)
      .single()

    if (!profile || profile.role !== "vendor") {
      return NextResponse.json({ error: "Only vendors can create services" }, { status: 403 })
    }

    const { data: service, error } = await supabase
      .from("services")
      .insert({
        vendor_id: profile.id,
        name: body.name,
        description: body.description,
        category: body.category,
        base_price: body.basePrice,
        default_sla_response_hours: body.slaResponseHours || 24,
        default_sla_resolution_hours: body.slaResolutionHours || 72,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
