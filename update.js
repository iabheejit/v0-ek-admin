<<<<<<< HEAD
const { response } = require("express")

require("dotenv").config()

// let base = new Airtable({ apiKey: process.env.apiKey }).base(process.env.base);

const tableId = process.env.tableId
const baseId = process.env.baseId
const apiKey = process.env.personal_access_token

async function updateField(id, field_name, updatedValue) {
  try {
    const tableName = "Test" // Replace with your table name
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`
    // console.log("Update URL ",url)

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          [field_name]: updatedValue,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Record updated successfully:")
  } catch (error) {
    console.error("Error updating record:", error)
  }
}
// updateField("rec3UHUHucZVYTBoY", "Last_Msg", "hdhhdhdhdh")

async function getID(number) {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`

  const params = new URLSearchParams({
    filterByFormula: `({Phone} = "${number}")`,
    view: "Grid view",
  })

  try {
    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      const id = data.records[0].id
      console.log("id", id)
      return id
    } else {
      throw new Error("No matching record found")
    }
  } catch (error) {
    console.error("Error in getID:", error)
    //throw error;
  }
}

// Test function

const totalDays = async (number) => {
  try {
    // Assuming findTable is a function you've defined elsewhere
    const course_tn = await findTable(number)
    // console.log("course_tn", course_tn);

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}?fields%5B%5D=Day`
    console.log(url)

    const response = await fetch(`${url}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    const count = data.records.length
    console.log(count)
    return count
  } catch (error) {
    console.error("Error in totalDays:", error)
    // //throw error;
  }
}

const findTable = async (number) => {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`

  const params = new URLSearchParams({
    filterByFormula: `({Phone} = "${number}")`,
    view: "Grid view",
  })

  try {
    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      const course_tn = data.records[0].fields.Course
      // console.log("Table Name = " + course_tn);
      return course_tn
    } else {
      // throw new Error('No matching record found');
    }
  } catch (error) {
    console.error("Error in findTable:", error)
    //throw error;
  }
}

const findRecord = async (id) => {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    const field_name = "Question Responses"
    return data.fields[field_name]
  } catch (error) {
    console.error("Error in findRecord:", error)
    // //throw error;
  }
}

const findQuesRecord = async (id) => {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()
    // console.log("Data ", data)

    return data.fields.Responses
  } catch (error) {
    console.error("Error in findQuesRecord:", error)
    // //throw error;
  }
}

const findTitle = async (currentDay, module_no, number) => {
  try {
    // First, get the course table name
    const course_tn = await findTable(number)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      for (const record of data.records) {
        const titleField = `Module ${module_no} LTitle`
        const optionsField = `Module ${module_no} List`

        const title = record.fields[titleField]
        const options = record.fields[optionsField]

        if (title !== undefined) {
          console.log(title, options.split("\n"))
          return [title, options.split("\n")]
        }
      }
      // If we've gone through all records and haven't returned, no matching title was found
      return [0, 0]
    } else {
      return [0, 0]
    }
  } catch (error) {
    console.error("Error in findTitle:", error)
    // //throw error;
  }
}

const findInteractive = async (currentDay, module_no, number) => {
  try {
    // First, get the course table name
    const course_tn = await findTable(number)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      for (const record of data.records) {
        const bodyField = `Module ${module_no} iBody`
        const buttonsField = `Module ${module_no} iButtons`

        const body = record.fields[bodyField]
        const buttons = record.fields[buttonsField]

        if (body !== undefined) {
          return [body, buttons.split("\n")]
        }
      }
      // If we've gone through all records and haven't returned, no matching body was found
      return "No matching interactive content found"
    } else {
      return "No records found for the given day"
    }
  } catch (error) {
    console.error("Error in findInteractive:", error)
    // //throw error;
  }
}

const findQuestion = async (currentDay, module_no, number) => {
  try {
    // First, get the course table name
    const course_tn = await findTable(number)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      for (const record of data.records) {
        const questionField = `Module ${module_no} Question`
        const body = record.fields[questionField]

        if (body !== undefined) {
          return body
        }
      }
      // If we've gone through all records and haven't returned, no matching question was found
      return "No matching question found"
    } else {
      return "No records found for the given day"
    }
  } catch (error) {
    console.error("Error in findQuestion:", error)
    // //throw error;
  }
}

const findLastMsg = async (number) => {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`

    const params = new URLSearchParams({
      filterByFormula: `({Phone} = "${number}")`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return undefined
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      const lastMsg = data.records[0].fields.Last_Msg
      // console.log("Last msg of " + number, lastMsg);
      return lastMsg !== undefined ? lastMsg : undefined
    }

    return undefined
  } catch (error) {
    console.error("Error in findLastMsg:", error)
    return undefined
  }
}

const find_ContentField = async (field, currentDay, current_module, number) => {
  try {
    // First, get the course table name
    const course_tn = await findTable(number)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return 0
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      for (const record of data.records) {
        const fieldName = `Module ${current_module} ${field}`
        const body = record.fields[fieldName]

        if (body !== undefined) {
          // console.log("Feedback  " + number, body);
          return body.split("\n")
        }
      }
    }

    console.log("Feedback  0")
    return 0
  } catch (error) {
    console.error("Error in find_ContentField:", error)
    return 0
  }
}

const findField = async (field, number) => {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`

    const params = new URLSearchParams({
      filterByFormula: `({Phone} = "${number}")`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return 0
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      const body = data.records[0].fields[field]
      return body !== undefined ? body : 0
    }

    return 0
  } catch (error) {
    console.error("Error in findField:", error)
    return 0
  }
}

const findAns = async (currentDay, module_no, number) => {
  try {
    // First, get the course table name
    const course_tn = await findTable(number)

    const url = `https://api.airtable.com/v0/${baseId}/${course_tn}`

    const params = new URLSearchParams({
      filterByFormula: `({Day} = ${currentDay})`,
      view: "Grid view",
    })

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      const ansField = `Module ${module_no} Ans`
      const body = data.records[0].fields[ansField]
      return body !== undefined ? body : null
    }

    return null
  } catch (error) {
    console.error("Error in findAns:", error)
    return null
  }
}

// async function test() {
//   try {
//     // const id = await getID("918779171731")
//     let rec = await findField("Course", "918779171731")
//     console.log("Rec ", rec)

//     // console.log('Found ID:', id);
//   } catch (error) {
//     console.error('Error in test function:', error);
//   }
// }

// // Run the test
// test();

module.exports = {
  findTable,
  totalDays,
  updateField,
  findRecord,
  findTitle,
  findInteractive,
  findQuestion,
  findQuesRecord,
  getID,
  findLastMsg,
  findField,
  findAns,
  find_ContentField,
=======
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
>>>>>>> 1970ee7 (Initial commit)
}
