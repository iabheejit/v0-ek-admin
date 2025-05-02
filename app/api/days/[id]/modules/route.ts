import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verify day exists
    const { data: day, error: dayError } = await supabaseAdmin.from("days").select("id").eq("id", id).single()

    if (dayError || !day) {
      return NextResponse.json(errorResponse("Day not found"), { status: 404 })
    }

    // Get modules for this day
    const { data, error } = await supabaseAdmin
      .from("modules")
      .select("*")
      .eq("day_id", id)
      .order("module_number", { ascending: true })

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json(errorResponse("Failed to fetch modules"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { module_number, title, text, list, question, correct_answer, link, next_message } = body

    // Validate required fields
    if (!module_number) {
      return NextResponse.json(errorResponse("Module number is required"), { status: 400 })
    }

    // Verify day exists
    const { data: day, error: dayError } = await supabaseAdmin.from("days").select("id").eq("id", id).single()

    if (dayError || !day) {
      return NextResponse.json(errorResponse("Day not found"), { status: 404 })
    }

    // Check if module with this number already exists for this day
    const { data: existingModule } = await supabaseAdmin
      .from("modules")
      .select("id")
      .eq("day_id", id)
      .eq("module_number", module_number)
      .single()

    if (existingModule) {
      return NextResponse.json(errorResponse("Module with this number already exists for this day"), { status: 400 })
    }

    // Insert new module
    const { data, error } = await supabaseAdmin
      .from("modules")
      .insert({
        day_id: id,
        module_number,
        title: title || null,
        text: text || null,
        list: list || null,
        question: question || null,
        correct_answer: correct_answer || null,
        link: link || null,
        next_message: next_message || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error creating module:", error)
    return NextResponse.json(errorResponse("Failed to create module"), { status: 500 })
  }
}
