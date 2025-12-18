import { getSupabaseClient } from "./client"

export async function getBatchWithStudents(batchId: string) {
  const supabase = getSupabaseClient()
  const { data: batch, error: batchError } = await supabase.from("batches").select("*").eq("id", batchId).single()

  if (batchError) {
    console.error("Error fetching batch:", batchError)
    return null
  }

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .eq("batch_id", batchId)
    .order("name", { ascending: true })

  if (studentsError) {
    console.error("Error fetching students:", studentsError)
    return batch
  }

  return { ...batch, students }
}

export async function updateBatchStudentCount(batchId: string) {
  const supabase = getSupabaseClient()
  const { count, error: countError } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("batch_id", batchId)

  if (countError) {
    console.error("Error counting students:", countError)
    return
  }

  const { error: updateError } = await supabase
    .from("batches")
    .update({ total_students: count || 0 })
    .eq("id", batchId)

  if (updateError) {
    console.error("Error updating batch:", updateError)
  }
}
