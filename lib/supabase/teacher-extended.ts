import { getSupabaseClient } from "./client"

export async function getTeacherWithDocuments(teacherId: string) {
  const supabase = getSupabaseClient()
  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", teacherId)
    .single()

  if (teacherError) {
    console.error("Error fetching teacher:", teacherError)
    return null
  }

  const { data: documents, error: docsError } = await supabase
    .from("teacher_documents")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("uploaded_at", { ascending: false })

  const { data: notes, error: notesError } = await supabase
    .from("teacher_notes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })

  return {
    ...teacher,
    documents: docsError ? [] : documents,
    notes: notesError ? [] : notes,
  }
}

export async function addTeacherDocument(teacherId: string, doc: { type: string; name: string; url: string }) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teacher_documents")
    .insert([{ teacher_id: teacherId, ...doc, uploaded_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) {
    console.error("Error adding document:", error)
    return null
  }

  return data
}

export async function addTeacherNote(teacherId: string, text: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teacher_notes")
    .insert([{ teacher_id: teacherId, text, created_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) {
    console.error("Error adding note:", error)
    return null
  }

  return data
}
