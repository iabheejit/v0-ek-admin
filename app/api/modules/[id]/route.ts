import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get module details
    const { data: module, error: moduleError } = await supabaseAdmin.from("modules").select("*").eq("id", id).single()

    if (moduleError) {
      return NextResponse.json(errorResponse(moduleError.message), { status: 400 })
    }

    if (!module) {
      return NextResponse.json(errorResponse("Module not found"), { status: 404 })
    }

    // Get media files for this module
    const { data: media, error: mediaError } = await supabaseAdmin
      .from("media_files")
      .select("*")
      .eq("module_id", id)
      .order("created_at", { ascending: true })

    if (mediaError) {
      return NextResponse.json(errorResponse(mediaError.message), { status: 400 })
    }

    return NextResponse.json(
      successResponse({
        ...module,
        media_files: media || [],
      }),
    )
  } catch (error) {
    console.error("Error fetching module:", error)
    return NextResponse.json(errorResponse("Failed to fetch module"), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id: moduleId, day_id, created_at, ...updateData } = body

    const { data, error } = await supabaseAdmin.from("modules").update(updateData).eq("id", id).select().single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    if (!data) {
      return NextResponse.json(errorResponse("Module not found"), { status: 404 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error updating module:", error)
    return NextResponse.json(errorResponse("Failed to update module"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if module exists
    const { data: module, error: moduleError } = await supabaseAdmin.from("modules").select("id").eq("id", id).single()

    if (moduleError || !module) {
      return NextResponse.json(errorResponse("Module not found"), { status: 404 })
    }

    // Delete module (cascade should handle related records)
    const { error } = await supabaseAdmin.from("modules").delete().eq("id", id)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse({ message: "Module deleted successfully" }))
  } catch (error) {
    console.error("Error deleting module:", error)
    return NextResponse.json(errorResponse("Failed to delete module"), { status: 500 })
  }
}
