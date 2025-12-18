import { getSupabaseClient } from "./client"
import type { Attendance } from "./types"

export async function getAttendance(date: string): Promise<Attendance[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("attendance").select("*").eq("date", date)

  if (error) {
    console.error("Error fetching attendance:", error)
    return []
  }

  return data || []
}

export async function getAttendanceByPerson(personId: string, type: "student" | "teacher"): Promise<Attendance[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("person_id", personId)
    .eq("type", type)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching attendance by person:", error)
    return []
  }

  return data || []
}

export async function getFilteredAttendance(
  dateFrom?: string,
  dateTo?: string,
  batchId?: string,
  courseId?: string,
  type: "student" | "teacher" = "student",
): Promise<Attendance[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from("attendance").select("*").eq("type", type)

  if (dateFrom) query = query.gte("date", dateFrom)
  if (dateTo) query = query.lte("date", dateTo)
  if (batchId) query = query.eq("batch_id", batchId)

  // When courseId is provided, filter by courseId first, then fetch batch records without courseId
  if (courseId) {
    // Get records with matching course_id OR with matching batch_id (for old records)
    query = query.or(`course_id.eq.${courseId},and(batch_id.eq.${batchId},course_id.is.null)`)
  }

  const { data, error } = await query.order("date", { ascending: false })

  if (error) {
    console.error("Error fetching filtered attendance:", error)
    console.log("[v0] Query parameters were:", { dateFrom, dateTo, batchId, courseId, type })
    return []
  }

  console.log("[v0] getFilteredAttendance results:", {
    parametersUsed: { dateFrom, dateTo, batchId, courseId, type },
    recordsReturned: data?.length || 0,
    uniquePersons: new Set(data?.map((d) => d.person_id) || []).size,
  })

  return data || []
}

export async function upsertAttendance(
  personId: string,
  date: string,
  type: "student" | "teacher",
  updates: Partial<Attendance>,
): Promise<Attendance | null> {
  const supabase = getSupabaseClient()

  // Check if record exists
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("person_id", personId)
    .eq("date", date)
    .eq("type", type)
    .single()

  if (existing) {
    // Update existing
    return updateAttendance(existing.id, updates)
  } else {
    // Create new
    return createAttendance({
      type,
      person_id: personId,
      date,
      ...updates,
    } as any)
  }
}

export async function createAttendance(
  attendance: Omit<Attendance, "id" | "created_at" | "updated_at">,
): Promise<Attendance | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("attendance").insert([attendance]).select().single()

  if (error) {
    console.error("Error creating attendance:", error)
    return null
  }

  return data
}

export async function updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("attendance")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating attendance:", error)
    return null
  }

  return data
}

export async function getAttendanceByBatch(batchId: string, date: string): Promise<Attendance[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("attendance").select("*").eq("batch_id", batchId).eq("date", date)

  if (error) {
    console.error("Error fetching attendance by batch:", error)
    return []
  }

  return data || []
}

export async function getAttendanceReport(
  dateFrom: string,
  dateTo: string,
  batchId?: string,
  courseId?: string,
): Promise<Attendance[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from("attendance").select("*").gte("date", dateFrom).lte("date", dateTo)

  if (batchId) query = query.eq("batch_id", batchId)
  if (courseId) query = query.eq("course_id", courseId)

  const { data, error } = await query.order("date", { ascending: false })

  if (error) {
    console.error("Error fetching attendance report:", error)
    return []
  }

  return data || []
}
