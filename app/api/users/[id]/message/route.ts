import { type NextRequest, NextResponse } from "next/server"
import watiService from "@/lib/wati-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Send the message via WATI API
    await watiService.sendText(userId, message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
