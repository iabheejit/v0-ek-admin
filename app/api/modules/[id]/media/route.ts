import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-service"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verify module exists
    const { data: module, error: moduleError } = await supabaseAdmin.from("modules").select("id").eq("id", id).single()

    if (moduleError || !module) {
      return NextResponse.json(errorResponse("Module not found"), { status: 404 })
    }

    // Get media files for this module
    const { data, error } = await supabaseAdmin
      .from("media_files")
      .select("*")
      .eq("module_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data || []))
  } catch (error) {
    console.error("Error fetching media files:", error)
    return NextResponse.json(errorResponse("Failed to fetch media files"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json(errorResponse("File is required"), { status: 400 })
    }

    // Verify module exists
    const { data: module, error: moduleError } = await supabaseAdmin.from("modules").select("id").eq("id", id).single()

    if (moduleError || !module) {
      return NextResponse.json(errorResponse("Module not found"), { status: 404 })
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from("media").upload(fileName, file)

    if (uploadError) {
      return NextResponse.json(errorResponse(uploadError.message), { status: 400 })
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage.from("media").getPublicUrl(fileName)

    // Insert media file record
    const { data, error } = await supabaseAdmin
      .from("media_files")
      .insert({
        module_id: id,
        file_name: fileName,
        file_url: publicUrlData.publicUrl,
        file_type: type || file.type,
        description: description || "",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 400 })
    }

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    console.error("Error uploading media file:", error)
    return NextResponse.json(errorResponse("Failed to upload media file"), { status: 500 })
  }
}
