import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

export type Course = Database["public"]["Tables"]["courses"]["Row"]
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"]
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"]

export type Day = Database["public"]["Tables"]["days"]["Row"]
export type DayInsert = Database["public"]["Tables"]["days"]["Insert"]
export type DayUpdate = Database["public"]["Tables"]["days"]["Update"]

export type Module = Database["public"]["Tables"]["modules"]["Row"]
export type ModuleInsert = Database["public"]["Tables"]["modules"]["Insert"]
export type ModuleUpdate = Database["public"]["Tables"]["modules"]["Update"]

export type MediaFile = Database["public"]["Tables"]["media_files"]["Row"]
export type MediaFileInsert = Database["public"]["Tables"]["media_files"]["Insert"]

export const contentService = {
  // Get all courses
  getCourses: async () => {
    const { data, error } = await supabase.from("courses").select("*").order("name")

    if (error) throw error

    return data || []
  },

  // Get a course by ID
  getCourseById: async (id: string) => {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        days (
          id,
          day_number,
          topic
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return data
  },

  // Create a new course
  createCourse: async (course: CourseInsert) => {
    const { data, error } = await supabase.from("courses").insert(course).select().single()

    if (error) throw error

    return data
  },

  // Update a course
  updateCourse: async (id: string, updates: CourseUpdate) => {
    const { data, error } = await supabase.from("courses").update(updates).eq("id", id).select().single()

    if (error) throw error

    return data
  },

  // Delete a course
  deleteCourse: async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) throw error

    return true
  },

  // Get days for a course
  getDays: async (courseId: string) => {
    const { data, error } = await supabase
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
      .eq("course_id", courseId)
      .order("day_number")

    if (error) throw error

    return data || []
  },

  // Get a day by ID
  getDayById: async (id: string) => {
    const { data, error } = await supabase
      .from("days")
      .select(`
        *,
        modules (
          id,
          module_number,
          title,
          text,
          question,
          answer_options,
          correct_answer,
          next_action
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return data
  },

  // Create a new day
  createDay: async (day: DayInsert) => {
    const { data, error } = await supabase.from("days").insert(day).select().single()

    if (error) throw error

    return data
  },

  // Update a day
  updateDay: async (id: string, updates: DayUpdate) => {
    const { data, error } = await supabase.from("days").update(updates).eq("id", id).select().single()

    if (error) throw error

    return data
  },

  // Delete a day
  deleteDay: async (id: string) => {
    const { error } = await supabase.from("days").delete().eq("id", id)

    if (error) throw error

    return true
  },

  // Get a module by ID
  getModuleById: async (id: string) => {
    const { data, error } = await supabase
      .from("modules")
      .select(`
        *,
        media_files (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return data
  },

  // Create a new module
  createModule: async (module: ModuleInsert) => {
    const { data, error } = await supabase.from("modules").insert(module).select().single()

    if (error) throw error

    return data
  },

  // Update a module
  updateModule: async (id: string, updates: ModuleUpdate) => {
    const { data, error } = await supabase.from("modules").update(updates).eq("id", id).select().single()

    if (error) throw error

    return data
  },

  // Delete a module
  deleteModule: async (id: string) => {
    const { error } = await supabase.from("modules").delete().eq("id", id)

    if (error) throw error

    return true
  },

  // Upload a media file
  uploadMediaFile: async (file: File, moduleId: string) => {
    // First upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `media/${moduleId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("course-media").upload(filePath, file)

    if (uploadError) throw uploadError

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("course-media").getPublicUrl(filePath)

    // Determine file type
    let fileType = "document"
    if (file.type.startsWith("image/")) fileType = "image"
    else if (file.type.startsWith("video/")) fileType = "video"
    else if (file.type.startsWith("audio/")) fileType = "audio"

    // Create media file record
    const mediaFile: MediaFileInsert = {
      module_id: moduleId,
      name: fileName,
      file_path: publicUrl,
      file_type: fileType,
    }

    const { data, error } = await supabase.from("media_files").insert(mediaFile).select().single()

    if (error) throw error

    return data
  },

  // Delete a media file
  deleteMediaFile: async (id: string) => {
    // First get the file path
    const { data: mediaFile, error: fetchError } = await supabase
      .from("media_files")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Extract the path from the URL
    const url = new URL(mediaFile.file_path)
    const pathMatch = url.pathname.match(/\/course-media\/(.+)/)

    if (pathMatch && pathMatch[1]) {
      // Delete from storage
      const { error: storageError } = await supabase.storage.from("course-media").remove([pathMatch[1]])

      if (storageError) throw storageError
    }

    // Delete the record
    const { error } = await supabase.from("media_files").delete().eq("id", id)

    if (error) throw error

    return true
  },
}
