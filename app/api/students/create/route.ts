import { getSupabaseClient } from "@/lib/supabase/client"
import { generateUUID } from "@/lib/uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, qualification, course, batchNumber, batchId, aadhaarNumber, panNumber } = body

    console.log("[v0] Create student API called with:", {
      name,
      email,
      phone,
      course,
      batchNumber,
      batchId,
    })

    let supabase
    try {
      supabase = getSupabaseClient()
    } catch (err) {
      console.error("[v0] Supabase initialization failed:", err)
      return Response.json(
        {
          error: "Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL to environment variables.",
          details: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Checking for existing student with email or phone")

    const { data: existingEmail, error: emailSearchError } = await supabase
      .from("students")
      .select("id, name, email, phone")
      .eq("email", email)
      .maybeSingle()

    if (emailSearchError) {
      console.error("[v0] Error searching by email:", emailSearchError)
      return Response.json({ error: emailSearchError.message }, { status: 400 })
    }

    if (existingEmail) {
      console.log("[v0] Student already exists with email:", existingEmail.email)
      return Response.json(
        {
          error: `A student with email "${email}" already exists (Name: ${existingEmail.name}, Phone: ${existingEmail.phone}). Please use a different email or update the existing student record.`,
          isDuplicate: true,
          existingStudent: existingEmail,
        },
        { status: 409 },
      )
    }

    const { data: existingPhone, error: phoneSearchError } = await supabase
      .from("students")
      .select("id, name, email, phone")
      .eq("phone", phone)
      .maybeSingle()

    if (phoneSearchError) {
      console.error("[v0] Error searching by phone:", phoneSearchError)
      return Response.json({ error: phoneSearchError.message }, { status: 400 })
    }

    if (existingPhone) {
      console.log("[v0] Student already exists with phone:", existingPhone.phone)
      return Response.json(
        {
          error: `A student with phone "${phone}" already exists (Name: ${existingPhone.name}, Email: ${existingPhone.email}). Please use a different phone number or update the existing student record.`,
          isDuplicate: true,
          existingStudent: existingPhone,
        },
        { status: 409 },
      )
    }

    if (batchId) {
      console.log("[v0] Validating batch exists:", batchId)

      const { data: batchExists, error: batchError } = await supabase
        .from("batches")
        .select("id")
        .eq("id", batchId)
        .maybeSingle()

      if (batchError) {
        console.error("[v0] Error checking batch:", batchError)
        return Response.json({ error: "Failed to verify batch" }, { status: 400 })
      }

      if (!batchExists) {
        console.error("[v0] Batch not found:", batchId)
        return Response.json(
          { error: `Batch '${batchId}' does not exist. Please select a valid batch.` },
          { status: 400 },
        )
      }

      console.log("[v0] Batch validation passed")
    }

    // Create new student with UUID
    const studentId = generateUUID()

    console.log("[v0] Creating new student with UUID:", studentId)

    const { error } = await supabase.from("students").insert([
      {
        id: studentId,
        name,
        email,
        phone,
        qualification,
        course_name: course,
        batch_number: batchNumber,
        batch_id: batchId || null,
        aadhaar_number: aadhaarNumber,
        pan_number: panNumber,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("[v0] Error creating student:", error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Student created successfully:", studentId)
    return Response.json({ id: studentId })
  } catch (error) {
    console.error("[v0] Error in student creation:", error)
    return Response.json({ error: "Failed to create student" }, { status: 500 })
  }
}
