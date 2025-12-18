import { getSupabaseClient } from "./client"
import type { CourseModule } from "./types"

export async function getCourseWithModules(courseId: string) {
  const supabase = getSupabaseClient()
  const { data: course, error: courseError } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (courseError) {
    console.error("Error fetching course:", courseError)
    return null
  }

  const { data: modules, error: modulesError } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true })

  if (modulesError) {
    console.error("Error fetching modules:", modulesError)
    return course
  }

  return { ...course, modules }
}

export async function createCourseModule(courseId: string, title: string, teacherId?: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("course_modules")
    .insert([{ course_id: courseId, title, teacher_id: teacherId }])
    .select()
    .single()

  if (error) {
    console.error("Error creating module:", error)
    return null
  }

  return data
}

export async function updateCourseModule(moduleId: string, updates: Partial<CourseModule>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("course_modules").update(updates).eq("id", moduleId).select().single()

  if (error) {
    console.error("Error updating module:", error)
    return null
  }

  return data
}

export async function deleteCourseModule(moduleId: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("course_modules").delete().eq("id", moduleId)

  if (error) {
    console.error("Error deleting module:", error)
    return false
  }

  return true
}
