import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const body = await req.json()
    const { studentId, studentName, documents } = body

    if (!studentId || !studentName || !documents || !Array.isArray(documents)) {
      return Response.json({ error: "Missing studentId, studentName, or documents" }, { status: 400 })
    }

    // Generate folder name: StudentName_StudentID
    const folderName = `sdhub_${studentId}`

    // The documents array contains already-uploaded files from client-side upload
    const documentRecords = documents.map((doc: any) => ({
      student_id: studentId,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      kind: doc.kind,
      url: doc.url || "", // URL should be provided from client
      uploaded_at: new Date().toISOString(),
    }))

    const { error: dbError } = await supabase.from("student_documents").insert(documentRecords)

    if (dbError) {
      console.error("[v0] Database insert error:", dbError.message)
      return Response.json({ error: dbError.message }, { status: 500 })
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("email, phone")
      .eq("id", studentId)
      .single()

    if (studentError) {
      console.error("[v0] Error fetching student info:", studentError.message)
      return Response.json({ error: studentError.message }, { status: 500 })
    }

    const email = studentData?.email
    const phone = studentData?.phone

    if (email || phone) {
      const filterCondition =
        email && phone ? `or(email.eq.${email},phone.eq.${phone})` : email ? `email.eq.${email}` : `phone.eq.${phone}`

      const { error: updateError } = await supabase
        .from("leads")
        .update({
          status: "Admitted",
          updated_at: new Date().toISOString(),
        })
        .or(filterCondition)

      if (updateError) {
        console.error("[v0] Failed to update lead status:", updateError.message)
        // Don't fail the response if lead update fails
      }
    }

    return Response.json({ success: true, count: documents.length, studentId })
  } catch (error) {
    console.error("[v0] Upload documents error:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
