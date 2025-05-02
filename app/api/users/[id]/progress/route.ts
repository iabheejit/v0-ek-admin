import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("*").eq("id", id).single()

    if (userError) {
      return NextResponse.json(errorResponse(userError.message), { status: 400 })
    }

    if (!user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Get user activities
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from("user_activities")
      .select("*")
      .eq("user_id", id)
      .order("timestamp", { ascending: false })

    if (activitiesError) {
      return NextResponse.json(errorResponse(activitiesError.message), { status: 400 })
    }

    // Get question responses
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from("question_responses")
      .select("*")
      .eq("user_id", id)
      .order("timestamp", { ascending: false })

    if (responsesError) {
      return NextResponse.json(errorResponse(responsesError.message), { status: 400 })
    }

    // Calculate progress percentage
    const courseQuery = await supabaseAdmin.from("courses").select("id").eq("name", user.course).single()

    if (courseQuery.error) {
      return NextResponse.json(errorResponse(courseQuery.error.message), { status: 400 })
    }

    const { data: days, error: daysError } = await supabaseAdmin
      .from("days")
      .select("id")
      .eq("course_id", courseQuery.data.id)

    if (daysError) {
      return NextResponse.json(errorResponse(daysError.message), { status: 400 })
    }

    const totalDays = days.length
    const progressPercentage = totalDays > 0 ? Math.min(100, Math.round((user.day_completed / totalDays) * 100)) : 0

    return NextResponse.json(
      successResponse({
        user,
        activities,
        responses,
        progress: {
          currentDay: user.next_day,
          currentModule: user.next_module,
          completedDay: user.day_completed,
          completedModule: user.module_completed,
          totalDays,
          progressPercentage,
        },
      }),
    )
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json(errorResponse("Failed to fetch user progress"), { status: 500 })
  }
}
