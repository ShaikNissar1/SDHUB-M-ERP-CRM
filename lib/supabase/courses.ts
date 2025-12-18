import { getSupabaseClient, withRetry } from "./client"
import type { Course, CourseModule } from "./types"

export async function getCourses(): Promise<Course[]> {
  try {
    return await withRetry(async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("courses").select("*").order("name", { ascending: true })

      if (error) {
        console.error("[v0] Supabase error fetching courses:", error.message)
        throw new Error(`Supabase error: ${error.message}`)
      }

      return data || []
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("[v0] Failed to fetch courses from Supabase:", errorMessage)
    throw err
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching course:", error)
    return null
  }

  return data
}

export async function createCourse(course: Omit<Course, "id" | "created_at" | "updated_at">): Promise<Course | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("courses")
    .insert([{ ...course }])
    .select()
    .single()

  if (error) {
    console.error("Error creating course:", error)
    return null
  }

  return data
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("courses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating course:", error)
    return null
  }

  return data
}

export async function deleteCourse(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()

  try {
    const { data: examsInCourse } = await supabase.from("exams").select("id").eq("course_id", id)

    if (examsInCourse && examsInCourse.length > 0) {
      const examIds = examsInCourse.map((e) => e.id)
      const { error: resultsError } = await supabase.from("test_results").delete().in("exam_id", examIds)

      if (resultsError) {
        console.error("[v0] Error deleting test results:", resultsError.message)
        throw new Error(`Failed to delete test results: ${resultsError.message}`)
      }
    }

    const { error: examsError } = await supabase.from("exams").delete().eq("course_id", id)

    if (examsError) {
      console.error("[v0] Error deleting exams:", examsError.message)
      throw new Error(`Failed to delete exams: ${examsError.message}`)
    }

    const { error: batchesError } = await supabase.from("batches").delete().eq("course_id", id)

    if (batchesError) {
      console.error("[v0] Error deleting batches:", batchesError.message)
      throw new Error(`Failed to delete batches: ${batchesError.message}`)
    }

    const { error: modulesError } = await supabase.from("course_modules").delete().eq("course_id", id)

    if (modulesError) {
      console.error("[v0] Error deleting course modules:", modulesError.message)
      throw new Error(`Failed to delete course modules: ${modulesError.message}`)
    }

    // Now delete the course itself
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting course:", error.message)
      throw new Error(`Failed to delete course: ${error.message}`)
    }

    console.log("[v0] Course and related records deleted successfully")
    return true
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("[v0] Error in deleteCourse:", errorMessage)
    throw err
  }
}

export async function getCourseModules(courseId: string): Promise<CourseModule[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching course modules:", error)
    return []
  }

  return data || []
}

export async function createCourseModule(
  module: Omit<CourseModule, "id" | "created_at">,
): Promise<CourseModule | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("course_modules").insert([module]).select().single()

  if (error) {
    console.error("Error creating course module:", error)
    return null
  }

  return data
}

export async function toggleCourseStatus(id: string, isActive: boolean): Promise<Course | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("courses")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating course status:", error)
    return null
  }

  return data
}
