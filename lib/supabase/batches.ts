import { getSupabaseClient } from "./client"
import type { Batch } from "./types"
export type { Batch }

function calculateBatchStatus(startDate: string, endDate: string): "Active" | "Upcoming" | "Completed" {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of today

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999) // End of today for end date

  if (today < start) return "Upcoming"
  if (today > end) return "Completed"
  return "Active"
}

async function getNextBatchSequenceForPrefix(prefix: string): Promise<number> {
  const supabase = getSupabaseClient()

  console.log("[v0] Fetching existing batches for prefix:", prefix)

  const { data, error } = await supabase
    .from("batches")
    .select("id")
    .ilike("id", `${prefix}B%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching latest batch for prefix:", error)
    return 1
  }

  console.log("[v0] Existing batches for prefix:", data)

  if (!data || data.length === 0) {
    console.log("[v0] No existing batches found, starting at 1")
    return 1
  }

  const sequences = data
    .map((batch) => {
      // Extract numeric part from batch ID (e.g., "WDB7" -> 7, "DMB12" -> 12)
      const match = batch.id.match(/B(\d+)$/)
      return match ? Number.parseInt(match[1], 10) : 0
    })
    .filter((num) => !isNaN(num))

  console.log("[v0] Extracted sequences:", sequences)

  const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0
  const nextSequence = maxSequence + 1

  console.log("[v0] Max sequence:", maxSequence, "Next sequence:", nextSequence)

  return nextSequence
}

export async function getBatches(): Promise<Batch[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("batches").select("*").order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching batches:", error)
    return []
  }

  return (data || []).map((batch) => ({
    ...batch,
    status: calculateBatchStatus(batch.start_date, batch.end_date),
  }))
}

export async function getBatchById(id: string): Promise<Batch | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("batches").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching batch:", error)
    return null
  }

  if (data) {
    data.status = calculateBatchStatus(data.start_date, data.end_date)
  }

  return data
}

export async function createBatch(batch: Omit<Batch, "created_at" | "updated_at">): Promise<Batch | null> {
  const supabase = getSupabaseClient()

  let finalBatch = batch
  if (!batch.id || batch.id.startsWith("temp-")) {
    const { coursePrefix } = await import("@/lib/batches")
    const prefix = coursePrefix(batch.course_name || "")
    const nextSeq = await getNextBatchSequenceForPrefix(prefix)
    const newBatchId = `${prefix}B${nextSeq}`
    const newBatchName = `${prefix}B${nextSeq}`

    console.log("[v0] Generated new batch ID:", newBatchId)

    finalBatch = {
      ...batch,
      id: newBatchId,
      name: batch.name || newBatchName,
    }
  }

  console.log("[v0] Inserting batch:", finalBatch)

  const { data, error } = await supabase.from("batches").insert([finalBatch]).select().single()

  if (error) {
    console.error("[v0] Error creating batch:", error)
    return null
  }

  console.log("[v0] Batch created successfully:", data)
  return data
}

export async function updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("batches")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating batch:", error)
    return null
  }

  return data
}

export async function deleteBatch(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("batches").delete().eq("id", id)

  if (error) {
    console.error("Error deleting batch:", error)
    return false
  }

  return true
}

export async function getBatchesByCourse(courseId: string): Promise<Batch[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .eq("course_id", courseId)
    .order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching batches by course:", error)
    return []
  }

  return (data || []).map((batch) => ({
    ...batch,
    status: calculateBatchStatus(batch.start_date, batch.end_date),
  }))
}

export async function getActiveBatches(): Promise<Batch[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("batches").select("*").order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching active batches:", error)
    return []
  }

  const allBatches = (data || []).map((batch) => ({
    ...batch,
    status: calculateBatchStatus(batch.start_date, batch.end_date),
  }))

  return allBatches.filter((batch) => batch.status === "Active")
}

export type BatchSchedule = {
  id: string
  batch_id: string
  day_of_week: string
  start_time: string
  end_time: string
  mode: "Online" | "Offline"
  classroom_link?: string
}

export type BatchTeacher = {
  id: string
  batch_id: string
  teacher_id: string
  assigned_at: string
  teacher?: {
    name: string
    email: string
    photo_url: string
  }
}

export async function getBatchSchedule(batchId: string): Promise<BatchSchedule[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("batch_schedule")
    .select("*")
    .eq("batch_id", batchId)

  if (error) {
    console.error("Error fetching batch schedule:", error)
    return []
  }
  return data
}

export async function addBatchScheduleItem(item: Omit<BatchSchedule, "id">): Promise<BatchSchedule | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("batch_schedule")
    .insert([item])
    .select()
    .single()

  if (error) {
    console.error("Error adding batch schedule item:", error)
    return null
  }
  return data
}

export async function deleteBatchScheduleItem(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("batch_schedule").delete().eq("id", id)
  if (error) {
    console.error("Error deleting batch schedule item:", error)
    return false
  }
  return true
}

export async function getBatchTeachers(batchId: string): Promise<BatchTeacher[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("batch_teachers")
    .select(`
      *,
      teacher:teachers(name, email, photo_url)
    `)
    .eq("batch_id", batchId)

  if (error) {
    console.error("Error fetching batch teachers:", error)
    return []
  }
  return data
}

export async function assignTeacherToBatch(batchId: string, teacherId: string): Promise<BatchTeacher | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("batch_teachers")
    .insert([{ batch_id: batchId, teacher_id: teacherId }])
    .select()
    .single()

  if (error) {
    console.error("Error assigning teacher to batch:", error)
    return null
  }
  return data
}

export async function removeTeacherFromBatch(batchId: string, teacherId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("batch_teachers")
    .delete()
    .match({ batch_id: batchId, teacher_id: teacherId })

  if (error) {
    console.error("Error removing teacher from batch:", error)
    return false
  }
  return true
}
