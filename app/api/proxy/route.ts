import { type NextRequest, NextResponse } from "next/server"

/**
 * This route handler proxies requests to the WATI API
 * It keeps the API token secure on the server side
 */
export async function POST(request: NextRequest) {
  try {
    const { endpoint, method = "GET", body } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    const WATI_URL = process.env.URL
    const WATI_API_TOKEN = process.env.API

    if (!WATI_URL || !WATI_API_TOKEN) {
      console.error("WATI API configuration missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const url = `${WATI_URL}${endpoint}`

    const options: RequestInit = {
      method,
      headers: {
        Authorization: WATI_API_TOKEN,
        "Content-Type": "application/json",
      },
    }

    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("WATI API proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy request to WATI API" }, { status: 500 })
  }
}
