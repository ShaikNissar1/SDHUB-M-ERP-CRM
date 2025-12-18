import { getSupabaseClient } from "./client"
import type { Attendance } from "./types"

export async function getAttendanceByBatchAndDate(batchId: string, date: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("batch_id", batchId)
    .eq("date", date)
    .order("person_name", { ascending: true })

  if (error) {
    console.error("Error fetching attendance:", error)
    return []
  }

  return data || []
}

export async function bulkUpdateAttendance(records: Partial<Attendance>[]) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("attendance").upsert(records)

  if (error) {
    console.error("Error updating attendance:", error)
    return false
  }

  return true
}

export async function getAttendanceStats(batchId: string, personId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("attendance")
    .select("status")
    .eq("batch_id", batchId)
    .eq("person_id", personId)

  if (error) {
    console.error("Error fetching attendance stats:", error)
    return { present: 0, absent: 0, leave: 0 }
  }

  const stats = { present: 0, absent: 0, leave: 0 }
  for (const record of data || []) {
    if (record.status === "Present") stats.present++
    else if (record.status === "Absent") stats.absent++
    else if (record.status === "On Leave") stats.leave++
  }

  return stats
}
