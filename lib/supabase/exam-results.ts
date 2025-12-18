import { createBrowserClient } from "@supabase/ssr"

// Client should only be created when needed in browser context

export interface EntranceExamResult {
  id: string
  lead_id: string
  name: string
  email: string
  phone: string
  score: number
  total_marks: number
  passing_marks: number
  status: "pending" | "passed" | "failed"
  submitted_at: string
  created_at: string
}

export interface MainExamResult {
  id: string
  exam_id: string
  student_id: string
  batch_id: string
  course_id: string
  name: string
  email: string
  phone: string
  score: number
  total_marks: number
  passing_marks: number
  status: "pending" | "passed" | "failed"
  submitted_at: string
  created_at: string
}

export interface InternalExamResult {
  id: string
  exam_id: string
  student_id: string
  batch_id: string
  course_id: string
  name: string
  email: string
  phone: string
  score: number
  total_marks: number
  passing_marks: number
  status: "pending" | "passed" | "failed"
  submitted_at: string
  created_at: string
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(url, key)
}

export async function getEntranceExamResults() {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("entrance_exam_results")
    .select("*")
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return data as EntranceExamResult[]
}

export async function getEntranceExamResultsByLead(leadId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("entrance_exam_results")
    .select("*")
    .eq("lead_id", leadId)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return data as EntranceExamResult[]
}

export async function createEntranceExamResult(result: Omit<EntranceExamResult, "id" | "created_at">) {
  const supabase = getClient()
  const { data, error } = await supabase.from("entrance_exam_results").insert([result]).select().single()

  if (error) throw error
  return data as EntranceExamResult
}

// Main Exam Results
export async function getMainExamResults(examId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("main_exam_results")
    .select("*")
    .eq("exam_id", examId)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return data as MainExamResult[]
}

export async function getMainExamResultsByBatch(batchId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("main_exam_results")
    .select("*")
    .eq("batch_id", batchId)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return data as MainExamResult[]
}

export async function createMainExamResult(result: Omit<MainExamResult, "id" | "created_at">) {
  const supabase = getClient()
  const { data, error } = await supabase.from("main_exam_results").insert([result]).select().single()

  if (error) throw error
  return data as MainExamResult
}

// Internal Exam Results
export async function getInternalExamResults(examId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("internal_exam_results")
    .select("*")
    .eq("exam_id", examId)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return data as InternalExamResult[]
}

export async function getInternalExamResultsByBatch(batchId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("internal_exam_results")
    .select("*")
    .eq("batch_id", batchId)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return data as InternalExamResult[]
}

export async function createInternalExamResult(result: Omit<InternalExamResult, "id" | "created_at">) {
  const supabase = getClient()
  const { data, error } = await supabase.from("internal_exam_results").insert([result]).select().single()

  if (error) throw error
  return data as InternalExamResult
}
