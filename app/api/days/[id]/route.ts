import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get day details
    const { data: day, error: dayError } = await supabaseAdmin.from("days").select("*").eq("id", id).single()

    if (dayError) {
      return NextResponse.json(errorResponse(dayError.message), { status: 400 })
    }

    if (!day) {
      return NextResponse.json(errorResponse("Day not found"), { status: 404 })
    }

    // Get modules for this day
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from("modules")
      .select("*")
      .eq("day_id", id)
      .order("module_number", { ascending: true })

    if (modulesError) {
      return NextResponse.json(errorResponse(modulesError.message), { status: 400 })
    }

    return NextResponse.json(
      successResponse({
        ...day,
        modules,
      }),
    )
  } catch (error) {
    console.error("Error fetching day:", error)
    return NextResponse.json(errorResponse("Failed to fetch day"), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id: dayId, course_id, created_at, ...updateData } = body

    const { data, error } = await supabaseAdmin.from("days").update(updateData).eq("id", id).select().single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    if (!data) {
      return NextResponse.json(errorResponse("Day not found"), { status: 404 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error updating day:", error)
    return NextResponse.json(errorResponse("Failed to update day"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if day exists
    const { data: day, error: dayError } = await supabaseAdmin.from("days").select("id").eq("id", id).single()

    if (dayError || !day) {
      return NextResponse.json(errorResponse("Day not found"), { status: 404 })
    }

    // Delete day (cascade should handle related records)
    const { error } = await supabaseAdmin.from("days").delete().eq("id", id)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse({ message: "Day deleted successfully" }))
  } catch (error) {
    console.error("Error deleting day:", error)
    return NextResponse.json(errorResponse("Failed to delete day"), { status: 500 })
  }
}
