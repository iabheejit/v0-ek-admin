import { supabase } from "@/lib/supabase/client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type UserActivity = Database["public"]["Tables"]["user_activities"]["Row"]
export type UserActivityInsert = Database["public"]["Tables"]["user_activities"]["Insert"]

export type QuestionResponse = Database["public"]["Tables"]["question_responses"]["Row"]
export type QuestionResponseInsert = Database["public"]["Tables"]["question_responses"]["Insert"]

export const analyticsService = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) throw usersError

    // Get new users in the last month
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const { count: newUsers, error: newUsersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("joined_date", lastMonth.toISOString())

    if (newUsersError) throw newUsersError

    // Get active courses
    const { count: activeCourses, error: coursesError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })

    if (coursesError) throw coursesError

    // Get messages sent today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: messagesSent, error: messagesError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", today.toISOString())
      .eq("is_from_user", false)

    if (messagesError) throw messagesError

    // Calculate completion rate (this is a simplified version)
    const { data: users, error: completionError } = await supabase.from("users").select("status")

    if (completionError) throw completionError

    const completedUsers = users?.filter((u) => u.status === "completed").length || 0
    const completionRate = totalUsers ? Math.round((completedUsers / totalUsers) * 100) : 0

    return {
      total_users: totalUsers || 0,
      new_users_percent: totalUsers ? Math.round(((newUsers || 0) / totalUsers) * 100) : 0,
      active_courses: activeCourses || 0,
      messages_sent: messagesSent || 0,
      completion_rate: completionRate,
    }
  },

  // Get completion rates by day
  getCompletionRates: async () => {
    // This is a complex query that would be better handled by a stored procedure
    // For now, we'll return mock data similar to what the original app used
    return [
      { name: "Day 1", completed: 92, inProgress: 5, notStarted: 3 },
      { name: "Day 2", completed: 85, inProgress: 10, notStarted: 5 },
      { name: "Day 3", completed: 70, inProgress: 15, notStarted: 15 },
      { name: "Day 4", completed: 55, inProgress: 20, notStarted: 25 },
      { name: "Day 5", completed: 40, inProgress: 15, notStarted: 45 },
    ]
  },

  // Get engagement metrics
  getEngagementMetrics: async (timeframe = "7days") => {
    // Again, this would be better as a stored procedure
    // For now, we'll return mock data
    return [
      { date: "Mon", activeUsers: 120, messages: 450 },
      { date: "Tue", activeUsers: 132, messages: 489 },
      { date: "Wed", activeUsers: 145, messages: 521 },
      { date: "Thu", activeUsers: 140, messages: 510 },
      { date: "Fri", activeUsers: 135, messages: 498 },
      { date: "Sat", activeUsers: 110, messages: 380 },
      { date: "Sun", activeUsers: 105, messages: 370 },
    ]
  },

  // Get question response analytics
  getResponseAnalytics: async () => {
    // Get all question responses
    const { data: responses, error: responsesError } = await supabase.from("question_responses").select(`
        id,
        question,
        is_correct,
        modules (
          title,
          day_id,
          module_number
        ),
        modules.day_id (
          day_number
        )
      `)

    if (responsesError) throw responsesError

    // Process the data
    const questionMap = new Map()

    responses?.forEach((response) => {
      const question = response.question
      const isCorrect = response.is_correct
      const moduleTitle = response.modules?.title || ""
      const dayNumber = response.modules?.day_id?.day_number || 0
      const moduleNumber = response.modules?.module_number || 0

      if (!questionMap.has(question)) {
        questionMap.set(question, {
          question,
          day: dayNumber,
          module: moduleNumber,
          module_title: moduleTitle,
          correct: 0,
          total: 0,
        })
      }

      const questionData = questionMap.get(question)
      questionData.total += 1
      if (isCorrect) questionData.correct += 1
    })

    // Convert map to array and calculate percentages
    const questionData = Array.from(questionMap.values()).map((q) => ({
      ...q,
      correct_percent: Math.round((q.correct / q.total) * 100),
    }))

    // Calculate overall correct percentage
    const totalResponses = responses?.length || 0
    const correctResponses = responses?.filter((r) => r.is_correct).length || 0
    const correctPercentage = totalResponses ? (correctResponses / totalResponses) * 100 : 0

    // Prepare chart data
    const chartData = [
      { name: "Correct", value: Math.round(correctPercentage * 10) / 10 },
      { name: "Incorrect", value: Math.round((100 - correctPercentage) * 10) / 10 },
    ]

    return {
      questions: questionData,
      chart_data: chartData,
    }
  },

  // Record a user activity
  recordActivity: async (activity: UserActivityInsert) => {
    const { data, error } = await supabase.from("user_activities").insert(activity).select().single()

    if (error) throw error

    return data
  },

  // Record a question response
  recordQuestionResponse: async (response: QuestionResponseInsert) => {
    const { data, error } = await supabase.from("question_responses").insert(response).select().single()

    if (error) throw error

    return data
  },
}

// Server-side functions
export const serverAnalyticsService = {
  // Record a user activity from the server
  recordActivity: async (activity: UserActivityInsert) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("user_activities").insert(activity).select().single()

    if (error) throw error

    return data
  },

  // Record a question response from the server
  recordQuestionResponse: async (response: QuestionResponseInsert) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("question_responses").insert(response).select().single()

    if (error) throw error

    return data
  },
}
