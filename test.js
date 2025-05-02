const { createClient } = require("@supabase/supabase-js")
const wati = require("./wati")
const { processUserResponse } = require("./server")

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get user by phone number
async function getUserByPhone(phoneNumber) {
  const { data, error } = await supabase.from("users").select("*").eq("phone_number", phoneNumber).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

// Helper function to get user progress
async function getUserProgress(userId) {
  const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user progress:", error)
    return null
  }

  return data
}

// Helper function to get course by ID
async function getCourse(courseId) {
  const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (error) {
    console.error("Error fetching course:", error)
    return null
  }

  return data
}

// Helper function to get day by ID
async function getDay(dayId) {
  const { data, error } = await supabase.from("days").select("*").eq("id", dayId).single()

  if (error) {
    console.error("Error fetching day:", error)
    return null
  }

  return data
}

// Helper function to get module by ID
async function getModule(moduleId) {
  const { data, error } = await supabase.from("modules").select("*, media(*)").eq("id", moduleId).single()

  if (error) {
    console.error("Error fetching module:", error)
    return null
  }

  return data
}

// Helper function to get modules for a day
async function getModulesForDay(dayId) {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("day_id", dayId)
    .order("sequence_number", { ascending: true })

  if (error) {
    console.error("Error fetching modules:", error)
    return []
  }

  return data
}

// Helper function to get media for a module
async function getMediaForModule(moduleId) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("module_id", moduleId)
    .order("sequence_number", { ascending: true })

  if (error) {
    console.error("Error fetching media:", error)
    return []
  }

  return data
}

// Helper function to update user progress
async function updateUserProgress(userId, updates) {
  const { data, error } = await supabase.from("user_progress").update(updates).eq("user_id", userId).select()

  if (error) {
    console.error("Error updating user progress:", error)
    return null
  }

  return data
}

// Helper function to create user response
async function createUserResponse(responseData) {
  const { data, error } = await supabase.from("user_responses").insert(responseData).select()

  if (error) {
    console.error("Error creating user response:", error)
    return null
  }

  return data
}

// Helper function to create user activity
async function createUserActivity(activityData) {
  const { data, error } = await supabase.from("user_activities").insert(activityData).select()

  if (error) {
    console.error("Error creating user activity:", error)
    return null
  }

  return data
}

// Function to send module content to user
async function sendModuleContent(phoneNumber) {
  try {
    // Get user by phone number
    const user = await getUserByPhone(phoneNumber)
    if (!user) {
      console.error("User not found for phone number:", phoneNumber)
      return
    }

    // Get user progress
    const progress = await getUserProgress(user.id)
    if (!progress) {
      console.error("User progress not found for user:", user.id)
      return
    }

    // Get current module
    const currentModule = await getModule(progress.current_module_id)
    if (!currentModule) {
      console.error("Module not found:", progress.current_module_id)
      return
    }

    // Get media for the module
    const mediaItems = await getMediaForModule(currentModule.id)

    // Send module content to user
    await wati.sendText(phoneNumber, currentModule.content)

    // Send media items if any
    for (const media of mediaItems) {
      if (media.media_type === "image") {
        await wati.sendImage(phoneNumber, media.url, media.caption || "")
      } else if (media.media_type === "video") {
        await wati.sendVideo(phoneNumber, media.url, media.caption || "")
      } else if (media.media_type === "document") {
        await wati.sendDocument(phoneNumber, media.url, media.caption || "")
      } else if (media.media_type === "audio") {
        await wati.sendAudio(phoneNumber, media.url)
      }
    }

    // Create user activity
    await createUserActivity({
      user_id: user.id,
      activity_type: "module_sent",
      module_id: currentModule.id,
      timestamp: new Date().toISOString(),
    })

    // Update user progress if needed
    if (currentModule.requires_response) {
      await updateUserProgress(user.id, {
        awaiting_response: true,
        last_module_sent_at: new Date().toISOString(),
      })
    } else {
      // Move to next module automatically if no response required
      await moveToNextModule(user.id)
    }

    return currentModule
  } catch (error) {
    console.error("Error sending module content:", error)
    throw error
  }
}

// Function to move user to next module
async function moveToNextModule(userId) {
  try {
    // Get user progress
    const progress = await getUserProgress(userId)
    if (!progress) {
      console.error("User progress not found for user:", userId)
      return
    }

    // Get current module
    const currentModule = await getModule(progress.current_module_id)
    if (!currentModule) {
      console.error("Module not found:", progress.current_module_id)
      return
    }

    // Get current day
    const currentDay = await getDay(currentModule.day_id)
    if (!currentDay) {
      console.error("Day not found:", currentModule.day_id)
      return
    }

    // Get all modules for the current day
    const dayModules = await getModulesForDay(currentDay.id)

    // Find the index of the current module
    const currentIndex = dayModules.findIndex((m) => m.id === currentModule.id)

    // Check if there are more modules in the current day
    if (currentIndex < dayModules.length - 1) {
      // Move to the next module in the same day
      const nextModule = dayModules[currentIndex + 1]
      await updateUserProgress(userId, {
        current_module_id: nextModule.id,
        awaiting_response: false,
        last_module_sent_at: new Date().toISOString(),
      })
      return nextModule
    } else {
      // Get the course
      const course = await getCourse(currentDay.course_id)
      if (!course) {
        console.error("Course not found:", currentDay.course_id)
        return
      }

      // Get all days for the course
      const { data: courseDays, error } = await supabase
        .from("days")
        .select("*")
        .eq("course_id", course.id)
        .order("sequence_number", { ascending: true })

      if (error) {
        console.error("Error fetching course days:", error)
        return
      }

      // Find the index of the current day
      const currentDayIndex = courseDays.findIndex((d) => d.id === currentDay.id)

      // Check if there are more days in the course
      if (currentDayIndex < courseDays.length - 1) {
        // Move to the first module of the next day
        const nextDay = courseDays[currentDayIndex + 1]
        const nextDayModules = await getModulesForDay(nextDay.id)

        if (nextDayModules.length > 0) {
          const firstModule = nextDayModules[0]
          await updateUserProgress(userId, {
            current_module_id: firstModule.id,
            current_day_id: nextDay.id,
            awaiting_response: false,
            last_module_sent_at: new Date().toISOString(),
          })
          return firstModule
        }
      } else {
        // Course completed
        await updateUserProgress(userId, {
          course_completed: true,
          completion_date: new Date().toISOString(),
          awaiting_response: false,
        })
        return null
      }
    }
  } catch (error) {
    console.error("Error moving to next module:", error)
    throw error
  }
}

// Function to handle user response
async function handleUserResponse(phoneNumber, message) {
  try {
    // Get user by phone number
    const user = await getUserByPhone(phoneNumber)
    if (!user) {
      console.error("User not found for phone number:", phoneNumber)
      return
    }

    // Get user progress
    const progress = await getUserProgress(user.id)
    if (!progress) {
      console.error("User progress not found for user:", user.id)
      return
    }

    // Check if awaiting response
    if (!progress.awaiting_response) {
      console.log("Not awaiting response from user:", user.id)
      return
    }

    // Get current module
    const currentModule = await getModule(progress.current_module_id)
    if (!currentModule) {
      console.error("Module not found:", progress.current_module_id)
      return
    }

    // Create user response
    await createUserResponse({
      user_id: user.id,
      module_id: currentModule.id,
      response_text: message,
      timestamp: new Date().toISOString(),
    })

    // Create user activity
    await createUserActivity({
      user_id: user.id,
      activity_type: "response_received",
      module_id: currentModule.id,
      timestamp: new Date().toISOString(),
    })

    // Process the response based on module type
    if (currentModule.module_type === "quiz") {
      // Handle quiz response
      const isCorrect = processQuizResponse(currentModule, message)

      if (isCorrect) {
        await wati.sendText(phoneNumber, "That's correct! 🎉")
      } else {
        await wati.sendText(
          phoneNumber,
          "That's not quite right. The correct answer is: " + currentModule.correct_answer,
        )
      }

      // Move to next module
      await moveToNextModule(user.id)

      // Send next module content
      setTimeout(() => {
        sendModuleContent(phoneNumber)
      }, 2000)
    } else {
      // For other module types, just acknowledge the response
      await wati.sendText(phoneNumber, "Thank you for your response!")

      // Move to next module
      await moveToNextModule(user.id)

      // Send next module content
      setTimeout(() => {
        sendModuleContent(phoneNumber)
      }, 2000)
    }
  } catch (error) {
    console.error("Error handling user response:", error)
    throw error
  }
}

// Helper function to process quiz response
function processQuizResponse(module, response) {
  if (!module.correct_answer) return true

  const normalizedResponse = response.trim().toLowerCase()
  const normalizedAnswer = module.correct_answer.trim().toLowerCase()

  return normalizedResponse === normalizedAnswer
}

// Function to start a course for a user
async function startCourse(phoneNumber, courseId) {
  try {
    // Get user by phone number
    const user = await getUserByPhone(phoneNumber)
    if (!user) {
      console.error("User not found for phone number:", phoneNumber)
      return
    }

    // Get the course
    const course = await getCourse(courseId)
    if (!course) {
      console.error("Course not found:", courseId)
      return
    }

    // Get the first day of the course
    const { data: days, error } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", courseId)
      .order("sequence_number", { ascending: true })
      .limit(1)

    if (error || !days || days.length === 0) {
      console.error("No days found for course:", courseId)
      return
    }

    const firstDay = days[0]

    // Get the first module of the first day
    const firstDayModules = await getModulesForDay(firstDay.id)
    if (firstDayModules.length === 0) {
      console.error("No modules found for day:", firstDay.id)
      return
    }

    const firstModule = firstDayModules[0]

    // Update user progress
    await updateUserProgress(user.id, {
      course_id: courseId,
      current_day_id: firstDay.id,
      current_module_id: firstModule.id,
      start_date: new Date().toISOString(),
      course_completed: false,
      awaiting_response: false,
    })

    // Create user activity
    await createUserActivity({
      user_id: user.id,
      activity_type: "course_started",
      course_id: courseId,
      timestamp: new Date().toISOString(),
    })

    // Send welcome message
    await wati.sendText(phoneNumber, `Welcome to ${course.title}! Let's get started.`)

    // Send first module content
    setTimeout(() => {
      sendModuleContent(phoneNumber)
    }, 2000)

    return { user, course, firstModule }
  } catch (error) {
    console.error("Error starting course:", error)
    throw error
  }
}

// Function to register a new user
async function registerUser(phoneNumber, name) {
  try {
    // Check if user already exists
    const existingUser = await getUserByPhone(phoneNumber)
    if (existingUser) {
      console.log("User already exists:", existingUser)
      return existingUser
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        phone_number: phoneNumber,
        name: name,
        registration_date: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    // Create user progress record
    const { error: progressError } = await supabase.from("user_progress").insert({
      user_id: newUser[0].id,
      awaiting_response: false,
    })

    if (progressError) {
      console.error("Error creating user progress:", progressError)
    }

    // Create user activity
    await createUserActivity({
      user_id: newUser[0].id,
      activity_type: "user_registered",
      timestamp: new Date().toISOString(),
    })

    return newUser[0]
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

module.exports = {
  sendModuleContent,
  handleUserResponse,
  startCourse,
  registerUser,
  getUserByPhone,
  getUserProgress,
  updateUserProgress,
  createUserResponse,
  createUserActivity,
  getModule,
  getDay,
  getCourse,
}
