import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { waId, text, listReply } = body

    // Log the incoming webhook
    console.log("Received webhook:", JSON.stringify(body))

    // Get user by phone number
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("*").eq("phone", waId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json(errorResponse("Failed to process webhook"), { status: 500 })
    }

    if (!user) {
      console.log("User not found for phone:", waId)
      // Handle new user registration if needed
      return NextResponse.json(successResponse({ message: "User not found" }))
    }

    // Record the incoming message
    await supabaseAdmin.from("messages").insert({
      user_id: user.id,
      content: text || (listReply ? JSON.stringify(listReply) : "Unknown content"),
      type: listReply ? "list_reply" : "text",
      direction: "incoming",
      timestamp: new Date().toISOString(),
    })

    // Process the message based on content
    // This is a simplified version - you'll need to implement the full logic from server.js
    if (listReply) {
      // Handle list reply
      const reply = listReply.title

      // Store response
      // Implementation needed based on test.js store_responses function
    } else if (text === "Let's Begin") {
      // Find and send module content
      // Implementation needed based on test.js findModule function
    } else if (text === "Start Day") {
      // Send module content
      // Implementation needed based on test.js sendModuleContent function
    } else if (text === "Next." || text === "नेक्स्ट") {
      // Mark module as complete
      // Implementation needed based on test.js markModuleComplete function
    } else {
      // Store question response
      // Implementation needed based on test.js store_quesResponse function
    }

    return NextResponse.json(successResponse({ message: "Webhook processed" }))
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(errorResponse("Failed to process webhook"), { status: 500 })
  }
}
