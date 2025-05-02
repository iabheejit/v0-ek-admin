import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", id).single()

    if (userError || !user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Get user activities
    const { data, error } = await supabaseAdmin
      .from("user_activities")
      .select("*")
      .eq("user_id", id)
      .order("timestamp", { ascending: false })

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data || []))
  } catch (error) {
    console.error("Error fetching user activities:", error)
    return NextResponse.json(errorResponse("Failed to fetch user activities"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { activity_type, module_id, day_number } = body

    // Validate required fields
    if (!activity_type) {
      return NextResponse.json(errorResponse("Activity type is required"), { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", id).single()

    if (userError || !user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Insert activity
    const { data, error } = await supabaseAdmin
      .from("user_activities")
      .insert({
        user_id: id,
        activity_type,
        module_id,
        day_number,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    // Update user progress based on activity type
    if (activity_type === "module_complete") {
      // Get current user data
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("next_module, module_completed")
        .eq("id", id)
        .single()

      if (!fetchError && userData) {
        await supabaseAdmin
          .from("users")
          .update({
            module_completed: userData.next_module,
            next_module: userData.next_module + 1,
          })
          .eq("id", id)
      }
    } else if (activity_type === "day_complete") {
      // Get current user data
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("next_day, day_completed")
        .eq("id", id)
        .single()

      if (!fetchError && userData) {
        await supabaseAdmin
          .from("users")
          .update({
            day_completed: userData.next_day,
            next_day: userData.next_day + 1,
            next_module: 1,
            module_completed: 0,
          })
          .eq("id", id)
      }
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error recording user activity:", error)
    return NextResponse.json(errorResponse("Failed to record user activity"), { status: 500 })
  }
}
