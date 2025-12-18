import { getSupabaseClient } from "./client"
import type { Teacher } from "./types"

export async function getTeachers(): Promise<Teacher[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teachers").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching teachers:", error)
    return []
  }

  return data || []
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teachers").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching teacher:", error)
    return null
  }

  return data
}

export async function createTeacher(
  teacher: Omit<Teacher, "id" | "created_at" | "updated_at">,
): Promise<Teacher | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teachers").insert([teacher]).select().single()

  if (error) {
    console.error("Error creating teacher:", error)
    return null
  }

  return data
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teachers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating teacher:", error)
    return null
  }

  return data
}

export async function deleteTeacher(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("teachers").delete().eq("id", id)

  if (error) {
    console.error("Error deleting teacher:", error)
    return false
  }

  return true
}
