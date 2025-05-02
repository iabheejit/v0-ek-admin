import { supabaseAdmin } from "./supabase-service"

// Function to migrate user from Airtable to Supabase
export async function migrateUser(airtableUser: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        name: airtableUser.Name,
        phone: airtableUser.Phone,
        email: airtableUser.Email || null,
        course: airtableUser.Course,
        language: airtableUser.Language || "en",
        next_day: airtableUser["Next Day"] || 1,
        next_module: airtableUser["Next Module"] || 1,
        day_completed: airtableUser["Day Completed"] || 0,
        module_completed: airtableUser["Module Completed"] || 0,
        last_message: airtableUser["Last_Msg"] || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error migrating user:", error)
    throw error
  }
}

// Function to migrate course from Airtable to Supabase
export async function migrateCourse(airtableCourse: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert({
        name: airtableCourse.name,
        description: airtableCourse.description || "",
        language: airtableCourse.language || "en",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error migrating course:", error)
    throw error
  }
}

// Function to migrate day from Airtable to Supabase
export async function migrateDay(airtableDay: any, courseId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("days")
      .insert({
        course_id: courseId,
        day_number: airtableDay.Day,
        day_topic: airtableDay["Day Topic"] || "",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error migrating day:", error)
    throw error
  }
}

// Function to migrate module from Airtable to Supabase
export async function migrateModule(airtableModule: any, dayId: string, moduleNumber: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from("modules")
      .insert({
        day_id: dayId,
        module_number: moduleNumber,
        title: airtableModule[`Module ${moduleNumber} LTitle`] || null,
        text: airtableModule[`Module ${moduleNumber} Text`] || null,
        list: airtableModule[`Module ${moduleNumber} List`] || null,
        question: airtableModule[`Module ${moduleNumber} Question`] || null,
        correct_answer: airtableModule[`Module ${moduleNumber} Ans`] || null,
        link: airtableModule[`Module ${moduleNumber} Link`] || null,
        next_message: airtableModule[`Module ${moduleNumber} next`] || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error migrating module:", error)
    throw error
  }
}
