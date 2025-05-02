import { type NextRequest, NextResponse } from "next/server"
import watiService from "@/lib/wati-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const searchParams = request.nextUrl.searchParams
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const pageNumber = Number.parseInt(searchParams.get("pageNumber") || "1")

    // Get messages from WATI API
    const response = await watiService.getMessages(userId, pageSize, pageNumber)

    // Transform the response to match our frontend expectations
    const messages = response.messages.items.map((item: any) => ({
      id: item.id || Date.now(),
      sender: item.fromMe ? "system" : "user",
      content: item.text || item.caption || "Media message",
      timestamp: new Date(item.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }))

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
