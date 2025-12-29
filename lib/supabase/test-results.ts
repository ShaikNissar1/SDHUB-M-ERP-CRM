import { getSupabaseClient } from "./client"
import type { TestResult } from "./types"

export async function getTestResults(): Promise<TestResult[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("test_results").select("*").order("submitted_at", { ascending: false })

  if (error) {
    console.error("Error fetching test results:", error)
    return []
  }

  return data || []
}

export async function createTestResult(result: Omit<TestResult, "id" | "created_at">): Promise<TestResult | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("test_results").insert([result]).select().single()

  if (error) {
    console.error("Error creating test result:", error)
    return null
  }

  return data
}

export async function getTestResultsByCourse(course: string): Promise<TestResult[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("course", course)
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("Error fetching test results by course:", error)
    return []
  }

  return data || []
}
export async function getTestResultsByEmails(emails: string[]): Promise<TestResult[]> {
  if (!emails.length) return []
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .in("email", emails)
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("Error fetching test results by emails:", error)
    return []
  }
  return data || []
}
