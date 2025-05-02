import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { number, message } = await request.json()

    if (!number || !message) {
      return NextResponse.json({ error: "Number and message are required" }, { status: 400 })
    }

    const watiUrl = process.env.URL
    const watiApiToken = process.env.API

    if (!watiUrl || !watiApiToken) {
      return NextResponse.json({ error: "WATI API configuration missing" }, { status: 500 })
    }

    const response = await fetch(`${watiUrl}/api/v1/sendSessionMessage/${number}`, {
      method: "POST",
      headers: {
        Authorization: watiApiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageText: message,
      }),
    })

    if (!response.ok) {
      throw new Error(`WATI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending text message:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
