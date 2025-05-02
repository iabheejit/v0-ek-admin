import { supabase } from "@/lib/supabase/client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]

export const messageService = {
  // Get messages for a user
  getUserMessages: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) throw error

    // Reverse to get oldest first
    return data?.reverse() || []
  },

  // Send a message to a user
  sendMessage: async (userId: string, content: string) => {
    const message: MessageInsert = {
      user_id: userId,
      content,
      is_from_user: false,
    }

    const { data, error } = await supabase.from("messages").insert(message).select().single()

    if (error) throw error

    return data
  },
}

// Server-side functions
export const serverMessageService = {
  // Send a message from the server
  sendMessage: async (userId: string, content: string) => {
    const supabase = createServerSupabaseClient()

    const message: MessageInsert = {
      user_id: userId,
      content,
      is_from_user: false,
    }

    const { data, error } = await supabase.from("messages").insert(message).select().single()

    if (error) throw error

    return data
  },

  // Record a message from a user
  recordUserMessage: async (userId: string, content: string) => {
    const supabase = createServerSupabaseClient()

    const message: MessageInsert = {
      user_id: userId,
      content,
      is_from_user: true,
    }

    const { data, error } = await supabase.from("messages").insert(message).select().single()

    if (error) throw error

    return data
  },
}
