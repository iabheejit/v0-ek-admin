const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to update user record
async function updateUser(userId, updates) {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateUser:", error)
    throw error
  }
}

// Function to update user progress
async function updateUserProgress(userId, updates) {
  try {
    const { data, error } = await supabase.from("user_progress").update(updates).eq("user_id", userId).select()

    if (error) {
      console.error("Error updating user progress:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateUserProgress:", error)
    throw error
  }
}

// Function to update course
async function updateCourse(courseId, updates) {
  try {
    const { data, error } = await supabase.from("courses").update(updates).eq("id", courseId).select()

    if (error) {
      console.error("Error updating course:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateCourse:", error)
    throw error
  }
}

// Function to update day
async function updateDay(dayId, updates) {
  try {
    const { data, error } = await supabase.from("days").update(updates).eq("id", dayId).select()

    if (error) {
      console.error("Error updating day:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateDay:", error)
    throw error
  }
}

// Function to update module
async function updateModule(moduleId, updates) {
  try {
    const { data, error } = await supabase.from("modules").update(updates).eq("id", moduleId).select()

    if (error) {
      console.error("Error updating module:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateModule:", error)
    throw error
  }
}

// Function to update media
async function updateMedia(mediaId, updates) {
  try {
    const { data, error } = await supabase.from("media").update(updates).eq("id", mediaId).select()

    if (error) {
      console.error("Error updating media:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateMedia:", error)
    throw error
  }
}

// Function to create a new user
async function createUser(userData) {
  try {
    const { data, error } = await supabase.from("users").insert(userData).select()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    // Create user progress record
    const { error: progressError } = await supabase.from("user_progress").insert({
      user_id: data[0].id,
      awaiting_response: false,
    })

    if (progressError) {
      console.error("Error creating user progress:", progressError)
    }

    return data[0]
  } catch (error) {
    console.error("Error in createUser:", error)
    throw error
  }
}

// Function to create a new course
async function createCourse(courseData) {
  try {
    const { data, error } = await supabase.from("courses").insert(courseData).select()

    if (error) {
      console.error("Error creating course:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in createCourse:", error)
    throw error
  }
}

// Function to create a new day
async function createDay(dayData) {
  try {
    const { data, error } = await supabase.from("days").insert(dayData).select()

    if (error) {
      console.error("Error creating day:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in createDay:", error)
    throw error
  }
}

// Function to create a new module
async function createModule(moduleData) {
  try {
    const { data, error } = await supabase.from("modules").insert(moduleData).select()

    if (error) {
      console.error("Error creating module:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in createModule:", error)
    throw error
  }
}

// Function to create new media
async function createMedia(mediaData) {
  try {
    const { data, error } = await supabase.from("media").insert(mediaData).select()

    if (error) {
      console.error("Error creating media:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error in createMedia:", error)
    throw error
  }
}

// Function to delete a user
async function deleteUser(userId) {
  try {
    // First delete related records
    await supabase.from("user_responses").delete().eq("user_id", userId)
    await supabase.from("user_activities").delete().eq("user_id", userId)
    await supabase.from("user_progress").delete().eq("user_id", userId)

    // Then delete the user
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteUser:", error)
    throw error
  }
}

// Function to delete a course
async function deleteCourse(courseId) {
  try {
    // Get all days for this course
    const { data: days, error: daysError } = await supabase.from("days").select("id").eq("course_id", courseId)

    if (daysError) {
      console.error("Error fetching days for course:", daysError)
      return false
    }

    // Delete all modules and media for each day
    for (const day of days) {
      // Get all modules for this day
      const { data: modules, error: modulesError } = await supabase.from("modules").select("id").eq("day_id", day.id)

      if (modulesError) {
        console.error("Error fetching modules for day:", modulesError)
        continue
      }

      // Delete all media for each module
      for (const module of modules) {
        await supabase.from("media").delete().eq("module_id", module.id)
      }

      // Delete all modules for this day
      await supabase.from("modules").delete().eq("day_id", day.id)
    }

    // Delete all days for this course
    await supabase.from("days").delete().eq("course_id", courseId)

    // Finally delete the course
    const { error } = await supabase.from("courses").delete().eq("id", courseId)

    if (error) {
      console.error("Error deleting course:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteCourse:", error)
    throw error
  }
}

module.exports = {
  updateUser,
  updateUserProgress,
  updateCourse,
  updateDay,
  updateModule,
  updateMedia,
  createUser,
  createCourse,
  createDay,
  createModule,
  createMedia,
  deleteUser,
  deleteCourse,
}
