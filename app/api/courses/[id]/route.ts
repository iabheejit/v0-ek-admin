import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get course details
    const { data: course, error: courseError } = await supabaseAdmin.from("courses").select("*").eq("id", id).single()

    if (courseError) {
      return NextResponse.json(errorResponse(courseError.message), { status: 400 })
    }

    if (!course) {
      return NextResponse.json(errorResponse("Course not found"), { status: 404 })
    }

    // Get days for this course
    const { data: days, error: daysError } = await supabaseAdmin
      .from("days")
      .select("*")
      .eq("course_id", id)
      .order("day_number", { ascending: true })

    if (daysError) {
      return NextResponse.json(errorResponse(daysError.message), { status: 400 })
    }

    return NextResponse.json(
      successResponse({
        ...course,
        days,
      }),
    )
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(errorResponse("Failed to fetch course"), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id: courseId, created_at, ...updateData } = body

    const { data, error } = await supabaseAdmin.from("courses").update(updateData).eq("id", id).select().single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    if (!data) {
      return NextResponse.json(errorResponse("Course not found"), { status: 404 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json(errorResponse("Failed to update course"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if course exists
    const { data: course, error: courseError } = await supabaseAdmin.from("courses").select("id").eq("id", id).single()

    if (courseError || !course) {
      return NextResponse.json(errorResponse("Course not found"), { status: 404 })
    }

    // Delete course (cascade should handle related records)
    const { error } = await supabaseAdmin.from("courses").delete().eq("id", id)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse({ message: "Course deleted successfully" }))
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(errorResponse("Failed to delete course"), { status: 500 })
  }
}
