import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin.from("courses").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(errorResponse("Failed to fetch courses"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, language } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(errorResponse("Course name is required"), { status: 400 })
    }

    // Check if course with this name already exists
    const { data: existingCourse } = await supabaseAdmin.from("courses").select("id").eq("name", name).single()

    if (existingCourse) {
      return NextResponse.json(errorResponse("Course with this name already exists"), { status: 400 })
    }

    // Insert new course
    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert({
        name,
        description: description || "",
        language: language || "en",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json(errorResponse("Failed to create course"), { status: 500 })
  }
}
