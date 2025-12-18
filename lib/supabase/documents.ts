import { getSupabaseClient } from "./client"

export async function uploadFileToStorage(
  file: File,
  studentId: string,
  studentName: string,
  kind: string,
): Promise<{ path: string; url: string } | null> {
  const supabase = getSupabaseClient()

  const folderName = `student_${studentId}`
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
  const filePath = `${folderName}/${kind}/${fileName}`

  const { data, error } = await supabase.storage.from("student_documents").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("[v0] Error uploading file to storage:", error)
    return null
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("student_documents").getPublicUrl(data.path)

  return {
    path: filePath,
    url: urlData?.publicUrl || "",
  }
}

export async function getStudentDocuments(studentId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("student_documents")
    .select("*")
    .eq("student_id", studentId)
    .order("uploaded_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching student documents:", error)
    return []
  }

  return data || []
}

export async function uploadStudentDocument(
  studentId: string,
  studentName: string,
  doc: { name: string; size: number; type: string; kind: string },
  file?: File,
) {
  const supabase = getSupabaseClient()

  let publicUrl = ""

  // If file is provided, upload it
  if (file) {
    const uploadResult = await uploadFileToStorage(file, studentId, studentName, doc.kind)
    if (uploadResult) {
      publicUrl = uploadResult.url
    }
  }

  const { data, error } = await supabase
    .from("student_documents")
    .insert([
      {
        student_id: studentId,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        kind: doc.kind,
        url: publicUrl,
        uploaded_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("[v0] Error uploading document:", error)
    return null
  }

  return data?.[0] || null
}

export async function deleteStudentDocument(docId: string, folderName: string, fileName: string, kind: string) {
  const supabase = getSupabaseClient()

  const filePath = `student_${docId}/${kind}/${fileName}`

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("student_documents").remove([filePath])

  if (storageError) {
    console.warn("[v0] Warning deleting file from storage:", storageError)
    // Continue with DB deletion even if storage delete fails
  }

  // Delete from database
  const { error: dbError } = await supabase.from("student_documents").delete().eq("id", docId)

  if (dbError) {
    console.error("[v0] Error deleting document record:", dbError)
    return false
  }

  return true
}
