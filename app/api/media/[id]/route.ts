import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get media file details
    const { data, error } = await supabaseAdmin.from("media_files").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    if (!data) {
      return NextResponse.json(errorResponse("Media file not found"), { status: 404 })
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    console.error("Error fetching media file:", error)
    return NextResponse.json(errorResponse("Failed to fetch media file"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get media file details
    const { data: mediaFile, error: fetchError } = await supabaseAdmin
      .from("media_files")
      .select("file_name")
      .eq("id", id)
      .single()

    if (fetchError || !mediaFile) {
      return NextResponse.json(errorResponse("Media file not found"), { status: 404 })
    }

    // Delete file from storage
    const { error: storageError } = await supabaseAdmin.storage.from("media").remove([mediaFile.file_name])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
      // Continue with deletion from database even if storage deletion fails
    }

    // Delete media file record
    const { error } = await supabaseAdmin.from("media_files").delete().eq("id", id)

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse({ message: "Media file deleted successfully" }))
  } catch (error) {
    console.error("Error deleting media file:", error)
    return NextResponse.json(errorResponse("Failed to delete media file"), { status: 500 })
  }
}
