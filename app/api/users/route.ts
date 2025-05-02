import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let supabaseQuery = supabaseAdmin.from("users").select("*", { count: "exact" })

    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data, error, count } = await supabaseQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(
      successResponse({
        users: data,
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      }),
    )
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(errorResponse("Failed to fetch users"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, course, language } = body

    // Validate required fields
    if (!name || !phone || !course) {
      return NextResponse.json(errorResponse("Name, phone, and course are required"), { status: 400 })
    }

    // Check if user with this phone already exists
    const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("phone", phone).single()

    if (existingUser) {
      return NextResponse.json(errorResponse("User with this phone number already exists"), { status: 400 })
    }

    // Insert new user
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        phone,
        email,
        course,
        language: language || "en",
        next_day: 1,
        next_module: 1,
        day_completed: 0,
        module_completed: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(errorResponse("Failed to create user"), { status: 500 })
  }
}
