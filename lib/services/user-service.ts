import { supabase } from "@/lib/supabase/client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export const userService = {
  // Get all users with pagination and search
  getUsers: async (page = 1, limit = 10, search = "") => {
    const start = (page - 1) * limit
    const end = start + limit - 1

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .range(start, end)
      .order("last_active", { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return {
      users: data || [],
      count: count || 0,
    }
  },

  // Get a user by ID
  getUserById: async (id: string) => {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) throw error

    return data
  },

  // Get a user by phone number
  getUserByPhone: async (phone: string) => {
    const { data, error } = await supabase.from("users").select("*").eq("phone", phone).single()

    if (error && error.code !== "PGRST116") throw error // PGRST116 is "no rows returned"

    return data || null
  },

  // Create a new user
  createUser: async (user: UserInsert) => {
    const { data, error } = await supabase.from("users").insert(user).select().single()

    if (error) throw error

    return data
  },

  // Update a user
  updateUser: async (id: string, updates: UserUpdate) => {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error

    return data
  },

  // Delete a user
  deleteUser: async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) throw error

    return true
  },

  // Get user progress
  getUserProgress: async (userId: string) => {
    // First get the user to determine current day and module
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    // Get the course for this user
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("name", user.course)
      .single()

    if (courseError) throw courseError

    // Get all days and modules for this course
    const { data: days, error: daysError } = await supabase
      .from("days")
      .select(`
        id,
        day_number,
        topic,
        modules (
          id,
          module_number,
          title
        )
      `)
      .eq("course_id", courseData.id)
      .order("day_number", { ascending: true })

    if (daysError) throw daysError

    // Format the modules with status based on user's progress
    const modules = days.flatMap((day) => {
      return day.modules.map((module: any) => {
        let status = "pending"

        if (day.day_number < user.current_day) {
          status = "completed"
        } else if (day.day_number === user.current_day) {
          if (module.module_number < user.current_module) {
            status = "completed"
          } else if (module.module_number === user.current_module) {
            status = "in-progress"
          }
        }

        return {
          day: day.day_number,
          module: module.module_number,
          title: module.title,
          status,
        }
      })
    })

    // Calculate completion percentage
    const totalModules = modules.length
    const completedModules = modules.filter((m) => m.status === "completed").length
    const completionPercentage = Math.round((completedModules / totalModules) * 100)

    return {
      currentDay: user.current_day,
      currentModule: user.current_module,
      totalDays: days.length,
      completionPercentage,
      modules,
    }
  },
}

// Server-side functions that use the service role key
export const serverUserService = {
  // These functions are similar to the client ones but use the server client
  getUserByPhone: async (phone: string) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").select("*").eq("phone", phone).single()

    if (error && error.code !== "PGRST116") throw error

    return data || null
  },

  createUser: async (user: UserInsert) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").insert(user).select().single()

    if (error) throw error

    return data
  },

  updateUser: async (id: string, updates: UserUpdate) => {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error

    return data
  },
}
