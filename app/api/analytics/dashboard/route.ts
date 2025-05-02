import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      return NextResponse.json(errorResponse(usersError.message), { status: 400 })
    }

    // Get active users (users who have activity in the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: activeUsersData, error: activeUsersError } = await supabaseAdmin
      .from("user_activities")
      .select("user_id")
      .gte("timestamp", sevenDaysAgo.toISOString())
      .order("user_id", { ascending: true })

    if (activeUsersError) {
      return NextResponse.json(errorResponse(activeUsersError.message), { status: 400 })
    }

    // Count unique user IDs
    const activeUsers = new Set(activeUsersData?.map((activity) => activity.user_id)).size

    // Get course completion stats
    const { data: completionData, error: completionError } = await supabaseAdmin
      .from("user_activities")
      .select("user_id")
      .eq("activity_type", "course_complete")

    if (completionError) {
      return NextResponse.json(errorResponse(completionError.message), { status: 400 })
    }

    const completedCourses = completionData?.length || 0

    // Get question response stats
    const { data: correctResponses, error: responsesError } = await supabaseAdmin
      .from("question_responses")
      .select("id")
      .eq("is_correct", true)

    if (responsesError) {
      return NextResponse.json(errorResponse(responsesError.message), { status: 400 })
    }

    const { count: totalResponses, error: totalResponsesError } = await supabaseAdmin
      .from("question_responses")
      .select("*", { count: "exact", head: true })

    if (totalResponsesError) {
      return NextResponse.json(errorResponse(totalResponsesError.message), { status: 400 })
    }

    const correctResponseRate = totalResponses
      ? Math.round(((correctResponses?.length || 0) / totalResponses) * 100)
      : 0

    // Get recent activities
    const { data: recentActivities, error: activitiesError } = await supabaseAdmin
      .from("user_activities")
      .select(`
        id,
        activity_type,
        timestamp,
        day_number,
        users (
          id,
          name,
          phone
        )
      `)
      .order("timestamp", { ascending: false })
      .limit(10)

    if (activitiesError) {
      return NextResponse.json(errorResponse(activitiesError.message), { status: 400 })
    }

    return NextResponse.json(
      successResponse({
        totalUsers: totalUsers || 0,
        activeUsers,
        completedCourses,
        correctResponseRate,
        recentActivities: recentActivities || [],
      }),
    )
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(errorResponse("Failed to fetch analytics data"), { status: 500 })
  }
}
