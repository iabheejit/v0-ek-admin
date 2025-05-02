<<<<<<< HEAD
// external packages
const express = require("express")
require("dotenv").config("./env")
const test = require("./test")
const WA = require("./wati")
const airtable = require("./update")
// const outro = require('./outroflow');

const webApp = express()

webApp.use(express.json())

// Route for WhatsApp
webApp.post("/web", async (req, res) => {
  const senderID = req.body.waId

  const keyword = req.body.text || ""

  console.log(req.body)

  const id = await airtable
    .getID(senderID)
    .then()
    .catch((e) => console.log(e))
  const last_msg = await airtable
    .findLastMsg(senderID)
    .then()
    .catch((e) => console.log("last msg error " + e))
  const currentDay = await airtable
    .findField("Next Day", senderID)
    .then()
    .catch((e) => console.log("current day error" + e))
  const current_module = await airtable
    .findField("Next Module", senderID)
    .then()
    .catch((e) => console.log("current day error" + e))
  console.log(currentDay, current_module)

  if (req.body.listReply != null) {
    reply = JSON.parse(JSON.stringify(req.body.listReply))
    console.log("List msg")

    await test
      .store_responses(senderID, reply.title)

      .then()
      .catch((e) => console.log("Finish List error " + e))
  } else if (keyword == `Let's Begin`) {
    // console.log("Finish start template error " + keyword)
    test
      .findModule(currentDay, current_module, senderID)
      .then()
      .catch((e) => console.log("Let's begin keyword error " + e))
  } else if (keyword == "Start Day") {
    console.log("Finish start template error " + keyword)
    test
      .sendModuleContent(senderID)
      .then()
      .catch((e) => console.log("Finish start template error " + e))
  }

  // else if (keyword.includes("Finish Day ") || keyword.includes("समाप्त करें")) {

  //     console.log("A. Updating finish day")

  //     airtable.updateField(id, "Last_Msg", keyword)
  //     test.markDayComplete(senderID).then().catch(e => console.info("Finish day template error " + e))

  // }
  else if (keyword == "Next." || keyword == "नेक्स्ट") {
    test
      .markModuleComplete(senderID)
      .then()
      .catch((e) => console.info("Finish module template error " + e))
  } else {
    console.log("Storing for almost 24 h limit ")
    // if (last_msg == "Yes" || last_msg == "हाँ") {
    //     console.log("1. Yes - No")
    //     WA.sendText("Once you complete watching the video, answer the question", senderID)
    //     // await test.store_intResponse(senderID, keyword)
    //     await airtable.updateField(id, "Last_Msg", keyword)
    // }
    // else if (last_msg == "Next." || last_msg == "नेक्स्ट") {
    //     console.log("2. Yes - No")
    //     if (last_msg == "नेक्स्ट") {
    //         console.log("last_msg == नेक्स्ट")
    //         WA.sendText("आपकी प्रतिक्रिया पहले ही दर्ज की जा चुकी है | ", senderID)
    //     }
    //     else {
    //         WA.sendText("Your feedback has already been recorded. ", senderID)
    //     }
    // }
    // else {
    console.log("3. Yes - No")
    await test.store_quesResponse(senderID, keyword)
    // await airtable.updateField(id, "Last_Msg", keyword)
    // }
  }

  res.end()
})

webApp.get("/ping", (req, res) => {
  res.status(200).send("Pong")
})

webApp.listen(process.env.PORT, () => {
  console.log(`Server is up and running at ${process.env.PORT}`)
})
=======
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")
const test = require("./test")
const wati = require("./wati")

// Initialize Express app
const app = express()
app.use(bodyParser.json())
app.use(cors())

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Process user response from WhatsApp
async function processUserResponse(phoneNumber, message) {
  try {
    console.log(`Processing response from ${phoneNumber}: ${message}`)

    // Get user by phone number
    const { data: user, error } = await supabase.from("users").select("*").eq("phone_number", phoneNumber).single()

    if (error || !user) {
      console.log("User not found, attempting registration")
      // If user doesn't exist, try to register them
      if (message.toLowerCase().startsWith("register")) {
        const name = message.substring(9).trim()
        if (name) {
          const newUser = await test.registerUser(phoneNumber, name)
          if (newUser) {
            await wati.sendText(phoneNumber, `Welcome, ${name}! You have been registered successfully.`)
            return
          }
        } else {
          await wati.sendText(phoneNumber, "Please provide your name after 'register'. For example: register John Doe")
          return
        }
      } else {
        await wati.sendText(phoneNumber, "You're not registered yet. Please register by sending 'register YOUR_NAME'")
        return
      }
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (progressError || !progress) {
      console.error("User progress not found:", progressError)
      await wati.sendText(phoneNumber, "There was an issue with your account. Please contact support.")
      return
    }

    // Check for commands
    if (message.toLowerCase() === "start") {
      // Get available courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("title", { ascending: true })

      if (coursesError || !courses || courses.length === 0) {
        await wati.sendText(phoneNumber, "No courses are available at the moment.")
        return
      }

      // If user is already in a course, ask for confirmation
      if (progress.course_id) {
        await wati.sendText(phoneNumber, "You're already enrolled in a course. To start a new one, send 'restart'.")
        return
      }

      // If only one course is available, start it automatically
      if (courses.length === 1) {
        await test.startCourse(phoneNumber, courses[0].id)
        return
      }

      // Otherwise, show available courses
      let courseList = "Available courses:\n\n"
      courses.forEach((course, index) => {
        courseList += `${index + 1}. ${course.title}\n`
      })
      courseList += "\nTo start a course, send 'course NUMBER'"

      await wati.sendText(phoneNumber, courseList)
      return
    } else if (message.toLowerCase().startsWith("course ")) {
      // Extract course number
      const courseNumber = Number.parseInt(message.substring(7).trim())
      if (isNaN(courseNumber)) {
        await wati.sendText(phoneNumber, "Please provide a valid course number. For example: course 1")
        return
      }

      // Get available courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("title", { ascending: true })

      if (coursesError || !courses || courses.length === 0) {
        await wati.sendText(phoneNumber, "No courses are available at the moment.")
        return
      }

      // Check if course number is valid
      if (courseNumber < 1 || courseNumber > courses.length) {
        await wati.sendText(phoneNumber, `Please provide a valid course number between 1 and ${courses.length}.`)
        return
      }

      // Start the selected course
      await test.startCourse(phoneNumber, courses[courseNumber - 1].id)
      return
    } else if (message.toLowerCase() === "restart") {
      // Reset user progress
      await supabase
        .from("user_progress")
        .update({
          course_id: null,
          current_day_id: null,
          current_module_id: null,
          completed_days: [],
          completed_modules: [],
        })
        .eq("user_id", user.id)

      await wati.sendText(phoneNumber, "Your progress has been reset. Send 'start' to begin a new course.")
      return
    } else if (message.toLowerCase() === "let's begin") {
      // Start the current day's content
      await test.sendModuleContent(phoneNumber)
      return
    } else if (message.toLowerCase() === "next") {
      // Mark current module as complete and move to next
      await test.markModuleComplete(phoneNumber)
      return
    } else {
      // Store user response
      await test.storeUserResponse(phoneNumber, message)
      return
    }
  } catch (error) {
    console.error("Error processing user response:", error)
    try {
      await wati.sendText(phoneNumber, "Sorry, there was an error processing your request. Please try again later.")
    } catch (sendError) {
      console.error("Error sending error message:", sendError)
    }
  }
}

// Route for WhatsApp webhook
app.post("/web", async (req, res) => {
  try {
    const { waId, text, listReply } = req.body
    console.log("Received webhook:", req.body)

    let userMessage = text

    // Handle list replies
    if (listReply) {
      userMessage = listReply.title
      console.log("List reply received:", userMessage)
    }

    // Process the message asynchronously
    processUserResponse(waId, userMessage).catch((error) => {
      console.error("Error in async processing:", error)
    })

    // Respond immediately to the webhook
    res.status(200).end()
  } catch (error) {
    console.error("Error in webhook handler:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check endpoint
app.get("/ping", (req, res) => {
  res.status(200).send("Pong")
})

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`)
})

// Export for testing
module.exports = app
>>>>>>> 1970ee7 (Initial commit)
