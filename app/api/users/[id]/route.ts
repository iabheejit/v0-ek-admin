import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    if (!data) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(errorResponse("Failed to fetch user"), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id: userId, created_at, ...updateData } = body

    const { data, error } = await supabaseAdmin.from("users").update(updateData).eq("id", id).select().single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    if (!data) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(errorResponse("Failed to update user"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabaseAdmin.from("users").delete().eq("id", id)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse({ message: "User deleted successfully" }))
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(errorResponse("Failed to delete user"), { status: 500 })
  }
}
