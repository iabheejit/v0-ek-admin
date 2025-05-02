import { createServerSupabaseClient } from "@/lib/supabase/server"

// Types for Airtable data
interface AirtableUser {
  id: string
  fields: {
    Name: string
    Phone: string
    Email?: string
    Next_Day: number
    Next_Module: number
    Last_Msg?: string
    Course: string
    Status?: string
    // Add other fields as needed
  }
}

interface AirtableCourse {
  id: string
  fields: {
    Name: string
    Description?: string
    // Add other fields as needed
  }
}

interface AirtableDay {
  id: string
  fields: {
    Course: string[] // Reference to Course
    Day: number
    Topic?: string
    // Add other fields as needed
  }
}

interface AirtableModule {
  id: string
  fields: {
    Day: string[] // Reference to Day
    Module_Number: number
    Title: string
    Text?: string
    Question?: string
    Answer_Options?: string[]
    Correct_Answer?: string
    Next_Action?: string
    // Add other fields as needed
  }
}

export async function migrateUsers(airtableUsers: AirtableUser[]) {
  const supabase = createServerSupabaseClient()
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const airtableUser of airtableUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone", airtableUser.fields.Phone)
        .maybeSingle()

      if (existingUser) {
        console.log(`User with phone ${airtableUser.fields.Phone} already exists, skipping`)
        continue
      }

      // Insert the user
      const { error } = await supabase.from("users").insert({
        name: airtableUser.fields.Name,
        phone: airtableUser.fields.Phone,
        email: airtableUser.fields.Email,
        current_day: airtableUser.fields.Next_Day,
        current_module: airtableUser.fields.Next_Module,
        status: airtableUser.fields.Status?.toLowerCase() || "active",
        course: airtableUser.fields.Course,
      })

      if (error) throw error

      results.success++
    } catch (error) {
      console.error(`Failed to migrate user ${airtableUser.fields.Name}:`, error)
      results.failed++
      results.errors.push(
        `User ${airtableUser.fields.Name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  return results
}

export async function migrateCourses(airtableCourses: AirtableCourse[]) {
  const supabase = createServerSupabaseClient()
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    idMap: new Map<string, string>(), // Maps Airtable IDs to Supabase IDs
  }

  for (const airtableCourse of airtableCourses) {
    try {
      // Check if course already exists
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("name", airtableCourse.fields.Name)
        .maybeSingle()

      if (existingCourse) {
        console.log(`Course ${airtableCourse.fields.Name} already exists, mapping ID`)
        results.idMap.set(airtableCourse.id, existingCourse.id)
        continue
      }

      // Insert the course
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: airtableCourse.fields.Name,
          description: airtableCourse.fields.Description,
        })
        .select()
        .single()

      if (error) throw error

      // Store the ID mapping
      results.idMap.set(airtableCourse.id, data.id)
      results.success++
    } catch (error) {
      console.error(`Failed to migrate course ${airtableCourse.fields.Name}:`, error)
      results.failed++
      results.errors.push(
        `Course ${airtableCourse.fields.Name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  return results
}

export async function migrateDays(airtableDays: AirtableDay[], courseIdMap: Map<string, string>) {
  const supabase = createServerSupabaseClient()
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    idMap: new Map<string, string>(), // Maps Airtable IDs to Supabase IDs
  }

  for (const airtableDay of airtableDays) {
    try {
      // Get the course ID from the map
      const courseId = courseIdMap.get(airtableDay.fields.Course[0])

      if (!courseId) {
        throw new Error(`Course ID not found for day ${airtableDay.id}`)
      }

      // Check if day already exists
      const { data: existingDay } = await supabase
        .from("days")
        .select("id")
        .eq("course_id", courseId)
        .eq("day_number", airtableDay.fields.Day)
        .maybeSingle()

      if (existingDay) {
        console.log(`Day ${airtableDay.fields.Day} for course ${courseId} already exists, mapping ID`)
        results.idMap.set(airtableDay.id, existingDay.id)
        continue
      }

      // Insert the day
      const { data, error } = await supabase
        .from("days")
        .insert({
          course_id: courseId,
          day_number: airtableDay.fields.Day,
          topic: airtableDay.fields.Topic,
        })
        .select()
        .single()

      if (error) throw error

      // Store the ID mapping
      results.idMap.set(airtableDay.id, data.id)
      results.success++
    } catch (error) {
      console.error(`Failed to migrate day ${airtableDay.id}:`, error)
      results.failed++
      results.errors.push(`Day ${airtableDay.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}

export async function migrateModules(airtableModules: AirtableModule[], dayIdMap: Map<string, string>) {
  const supabase = createServerSupabaseClient()
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const airtableModule of airtableModules) {
    try {
      // Get the day ID from the map
      const dayId = dayIdMap.get(airtableModule.fields.Day[0])

      if (!dayId) {
        throw new Error(`Day ID not found for module ${airtableModule.id}`)
      }

      // Check if module already exists
      const { data: existingModule } = await supabase
        .from("modules")
        .select("id")
        .eq("day_id", dayId)
        .eq("module_number", airtableModule.fields.Module_Number)
        .maybeSingle()

      if (existingModule) {
        console.log(`Module ${airtableModule.fields.Module_Number} for day ${dayId} already exists, skipping`)
        continue
      }

      // Insert the module
      const { error } = await supabase.from("modules").insert({
        day_id: dayId,
        module_number: airtableModule.fields.Module_Number,
        title: airtableModule.fields.Title,
        text: airtableModule.fields.Text,
        question: airtableModule.fields.Question,
        answer_options: airtableModule.fields.Answer_Options || [],
        correct_answer: airtableModule.fields.Correct_Answer,
        next_action: airtableModule.fields.Next_Action || "next-module",
      })

      if (error) throw error

      results.success++
    } catch (error) {
      console.error(`Failed to migrate module ${airtableModule.id}:`, error)
      results.failed++
      results.errors.push(`Module ${airtableModule.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}
