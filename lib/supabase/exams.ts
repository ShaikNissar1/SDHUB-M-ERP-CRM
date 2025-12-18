import { getSupabaseClient } from "./client"
import type { Exam } from "./types"

export async function getExams(): Promise<Exam[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("exams").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching exams:", error)
    return []
  }

  return data || []
}

export async function getExamById(id: string): Promise<Exam | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("exams").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching exam:", error)
    return null
  }

  return data
}

export async function createExam(exam: Omit<Exam, "id" | "created_at" | "updated_at">): Promise<Exam | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("exams").insert([exam]).select().single()

  if (error) {
    console.error("Error creating exam:", error)
    return null
  }

  return data
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("exams")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating exam:", error)
    return null
  }

  return data
}

export async function deleteExam(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("exams").delete().eq("id", id)

  if (error) {
    console.error("Error deleting exam:", error)
    return false
  }

  return true
}
