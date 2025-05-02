import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
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
=======
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", id).single()

    if (userError || !user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Get messages
    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("user_id", id)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(errorResponse("Failed to fetch messages"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { content, type, direction } = body

    // Validate required fields
    if (!content || !type || !direction) {
      return NextResponse.json(errorResponse("Content, type, and direction are required"), { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", id).single()

    if (userError || !user) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Insert message
    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({
        user_id: id,
        content,
        type,
        direction,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(errorResponse("Failed to create message"), { status: 500 })
>>>>>>> 1970ee7 (Initial commit)
  }
}
