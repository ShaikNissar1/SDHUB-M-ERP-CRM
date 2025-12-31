import { getSupabaseClient } from "./client"

export interface Holiday {
  id: string
  date: string
  name: string
  type: "Institute" | "Batch" | "Public"
  batch_id?: string
}

export async function getHolidays(batchId?: string): Promise<string[]> {
  const supabase = getSupabaseClient()

  const query = supabase
    .from("holidays")
    .select("date")
    .or(`type.eq.Public,type.eq.Institute${batchId ? `,and(type.eq.Batch,batch_id.eq.${batchId})` : ""}`)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching holidays:", error)
    return []
  }

  return data.map((h) => h.date)
}
