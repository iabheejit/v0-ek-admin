import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verify course exists
    const { data: course, error: courseError } = await supabaseAdmin.from("courses").select("id").eq("id", id).single()

    if (courseError || !course) {
      return NextResponse.json(errorResponse("Course not found"), { status: 404 })
    }

    // Get days for this course
    const { data, error } = await supabaseAdmin
      .from("days")
      .select("*")
      .eq("course_id", id)
      .order("day_number", { ascending: true })

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error fetching days:", error)
    return NextResponse.json(errorResponse("Failed to fetch days"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { day_number, day_topic } = body

    // Validate required fields
    if (!day_number) {
      return NextResponse.json(errorResponse("Day number is required"), { status: 400 })
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabaseAdmin.from("courses").select("id").eq("id", id).single()

    if (courseError || !course) {
      return NextResponse.json(errorResponse("Course not found"), { status: 404 })
    }

    // Check if day with this number already exists for this course
    const { data: existingDay } = await supabaseAdmin
      .from("days")
      .select("id")
      .eq("course_id", id)
      .eq("day_number", day_number)
      .single()

    if (existingDay) {
      return NextResponse.json(errorResponse("Day with this number already exists for this course"), { status: 400 })
    }

    // Insert new day
    const { data, error } = await supabaseAdmin
      .from("days")
      .insert({
        course_id: id,
        day_number,
        day_topic: day_topic || "",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error creating day:", error)
    return NextResponse.json(errorResponse("Failed to create day"), { status: 500 })
  }
}
