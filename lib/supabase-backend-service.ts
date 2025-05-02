import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import type { Database } from "../types/supabase"

dotenv.config()

// Initialize Supabase client with service role key for backend operations
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// User-related functions
export async function getUserByPhone(phone: string) {
  const { data, error } = await supabase.from("users").select("*").eq("phone", phone).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error getting user by phone:", error)
    throw error
  }

  return data
}

export async function updateField(id: string, field: string, value: any) {
  const { data, error } = await supabase
    .from("users")
    .update({ [field]: value })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating field ${field}:`, error)
    throw error
  }

  return data
}

export async function findUserTable(phone: string) {
  const { data, error } = await supabase.from("users").select("course").eq("phone", phone).single()

  if (error) {
    console.error("Error finding user table:", error)
    throw error
  }

  return data?.course
}

export async function getTotalDays(phone: string) {
  const course = await findUserTable(phone)

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("name", course)
    .single()

  if (courseError) {
    console.error("Error finding course:", courseError)
    throw courseError
  }

  const { count, error } = await supabase
    .from("days")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseData.id)

  if (error) {
    console.error("Error counting days:", error)
    throw error
  }

  return count || 0
}

export async function findField(field: string, phone: string) {
  const { data, error } = await supabase.from("users").select(field).eq("phone", phone).single()

  if (error) {
    console.error(`Error finding field ${field}:`, error)
    return 0
  }

  return data?.[field] || 0
}

export async function findLastMsg(phone: string) {
  const { data, error } = await supabase.from("users").select("last_message").eq("phone", phone).single()

  if (error) {
    console.error("Error finding last message:", error)
    return undefined
  }

  return data?.last_message
}

export async function findTitle(currentDay: number, moduleNo: number, phone: string) {
  try {
    const course = await findUserTable(phone)

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("name", course)
      .single()

    if (courseError) throw courseError

    // Get day ID
    const { data: dayData, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("day_number", currentDay)
      .single()

    if (dayError) throw dayError

    // Get module data
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("title, list")
      .eq("day_id", dayData.id)
      .eq("module_number", moduleNo)
      .single()

    if (moduleError) throw moduleError

    if (moduleData?.title && moduleData?.list) {
      return [moduleData.title, moduleData.list.split("\n")]
    }

    return [0, 0]
  } catch (error) {
    console.error("Error in findTitle:", error)
    return [0, 0]
  }
}

export async function findInteractive(currentDay: number, moduleNo: number, phone: string) {
  try {
    const course = await findUserTable(phone)

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("name", course)
      .single()

    if (courseError) throw courseError

    // Get day ID
    const { data: dayData, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("day_number", currentDay)
      .single()

    if (dayError) throw dayError

    // Get module data
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("interactive_body, interactive_buttons")
      .eq("day_id", dayData.id)
      .eq("module_number", moduleNo)
      .single()

    if (moduleError) throw moduleError

    if (moduleData?.interactive_body && moduleData?.interactive_buttons) {
      return [moduleData.interactive_body, moduleData.interactive_buttons.split("\n")]
    }

    return undefined
  } catch (error) {
    console.error("Error in findInteractive:", error)
    return undefined
  }
}

export async function findQuestion(currentDay: number, moduleNo: number, phone: string) {
  try {
    const course = await findUserTable(phone)

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("name", course)
      .single()

    if (courseError) throw courseError

    // Get day ID
    const { data: dayData, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("day_number", currentDay)
      .single()

    if (dayError) throw dayError

    // Get module data
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("question")
      .eq("day_id", dayData.id)
      .eq("module_number", moduleNo)
      .single()

    if (moduleError) throw moduleError

    return moduleData?.question
  } catch (error) {
    console.error("Error in findQuestion:", error)
    return undefined
  }
}

export async function findAns(currentDay: number, moduleNo: number, phone: string) {
  try {
    const course = await findUserTable(phone)

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("name", course)
      .single()

    if (courseError) throw courseError

    // Get day ID
    const { data: dayData, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("day_number", currentDay)
      .single()

    if (dayError) throw dayError

    // Get module data
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("correct_answer")
      .eq("day_id", dayData.id)
      .eq("module_number", moduleNo)
      .single()

    if (moduleError) throw moduleError

    return moduleData?.correct_answer
  } catch (error) {
    console.error("Error in findAns:", error)
    return null
  }
}

export async function findQuesRecord(userId: string) {
  const { data, error } = await supabase.from("users").select("responses").eq("id", userId).single()

  if (error) {
    console.error("Error finding question record:", error)
    return undefined
  }

  return data?.responses
}

export async function find_ContentField(field: string, currentDay: number, moduleNo: number, phone: string) {
  try {
    const course = await findUserTable(phone)

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("name", course)
      .single()

    if (courseError) throw courseError

    // Get day ID
    const { data: dayData, error: dayError } = await supabase
      .from("days")
      .select("id")
      .eq("course_id", courseData.id)
      .eq("day_number", currentDay)
      .single()

    if (dayError) throw dayError

    // Get module data
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select(`${field}`)
      .eq("day_id", dayData.id)
      .eq("module_number", moduleNo)
      .single()

    if (moduleError) throw moduleError

    const fieldValue = moduleData?.[field]
    return fieldValue ? fieldValue.split("\n") : 0
  } catch (error) {
    console.error(`Error in find_ContentField for ${field}:`, error)
    return 0
  }
}

// Message-related functions
export async function storeMessage(userId: string, content: string, isFromUser = true) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      user_id: userId,
      content,
      is_from_user: isFromUser,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error storing message:", error)
    throw error
  }

  return data
}

// Question response functions
export async function storeQuestionResponse(
  userId: string,
  moduleId: string,
  question: string,
  userAnswer: string,
  isCorrect: boolean,
) {
  const { data, error } = await supabase
    .from("question_responses")
    .insert({
      user_id: userId,
      module_id: moduleId,
      question,
      user_answer: userAnswer,
      is_correct: isCorrect,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error storing question response:", error)
    throw error
  }

  return data
}

// User activity functions
export async function recordUserActivity(userId: string, activityType: string, details: any = {}) {
  const { data, error } = await supabase
    .from("user_activities")
    .insert({
      user_id: userId,
      activity_type: activityType,
      details,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error recording user activity:", error)
    throw error
  }

  return data
}
