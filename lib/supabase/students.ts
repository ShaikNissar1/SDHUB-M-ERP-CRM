import { getSupabaseClient } from "./client"
import type { Student } from "./types"

export async function getStudents(): Promise<Student[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("students").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching students:", error)
    return []
  }

  return data || []
}

export async function getStudentById(id: string): Promise<Student | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching student:", error)
    return null
  }

  return data
}

export async function createStudent(
  student: Omit<Student, "id" | "created_at" | "updated_at">,
): Promise<Student | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("students").insert([student]).select().single()

  if (error) {
    console.error("Error creating student:", error)
    return null
  }

  return data
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("students")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating student:", error)
    return null
  }

  return data
}

export async function deleteStudent(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("students").delete().eq("id", id)

  if (error) {
    console.error("Error deleting student:", error)
    return false
  }

  return true
}

export async function getStudentsByBatch(batchId: string): Promise<Student[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("batch_id", batchId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching students by batch:", error)
    return []
  }

  return data || []
}

export async function getStudentsByCourse(courseId: string): Promise<Student[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("course_id", courseId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching students by course:", error)
    return []
  }

  return data || []
}
