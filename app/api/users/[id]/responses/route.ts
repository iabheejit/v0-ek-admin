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

    // Get question responses
    const { data, error } = await supabaseAdmin
      .from("question_responses")
      .select("*")
      .eq("user_id", id)
      .order("timestamp", { ascending: false })

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data || []))
  } catch (error) {
    console.error("Error fetching question responses:", error)
    return NextResponse.json(errorResponse("Failed to fetch question responses"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { module_id, question, user_answer } = body

    // Validate required fields
    if (!module_id || !question || !user_answer) {
      return NextResponse.json(errorResponse("Module ID, question, and user answer are required"), { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", id).single()

    if (userError || !user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Get module to check correct answer
    const { data: module, error: moduleError } = await supabaseAdmin
      .from("modules")
      .select("correct_answer")
      .eq("id", module_id)
      .single()

    if (moduleError) {
      return NextResponse.json(errorResponse(moduleError.message), { status: 400 })
    }

    if (!module) {
      return NextResponse.json(errorResponse("Module not found"), { status: 404 })
    }

    const is_correct = module.correct_answer === user_answer

    // Insert response
    const { data, error } = await supabaseAdmin
      .from("question_responses")
      .insert({
        user_id: id,
        module_id,
        question,
        user_answer,
        is_correct,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error recording question response:", error)
    return NextResponse.json(errorResponse("Failed to record question response"), { status: 500 })
  }
}
