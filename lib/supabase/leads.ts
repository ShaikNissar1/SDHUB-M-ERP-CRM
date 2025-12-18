import { getSupabaseClient, withRetry } from "./client"
import type { Lead } from "./types"

export async function getLeads(): Promise<Lead[]> {
  return await withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching leads:", error)
      return []
    }

    return data || []
  })
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching lead:", error)
    return null
  }

  return data
}

export async function createLead(lead: Omit<Lead, "id" | "created_at" | "updated_at">): Promise<Lead | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("leads").insert([lead]).select().single()

  if (error) {
    console.error("Error creating lead:", error)
    return null
  }

  return data
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating lead:", error)
    return null
  }

  return data
}

export async function deleteLead(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("leads").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting lead:", error)
    return false
  }

  console.log("[v0] Lead deleted successfully, broadcasting refresh")
  window.dispatchEvent(new Event("leads:updated"))

  return true
}

export async function getLeadsByStatus(status: string): Promise<Lead[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching leads by status:", error)
    return []
  }

  return data || []
}

export async function getLeadsByCourse(course: string): Promise<Lead[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("course", course)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching leads by course:", error)
    return []
  }

  return data || []
}

export async function getUpcomingFollowUps(): Promise<Lead[]> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .gte("next_follow_up_date", today)
    .order("next_follow_up_date", { ascending: true })
    .limit(10)

  if (error) {
    console.error("Error fetching upcoming follow-ups:", error)
    return []
  }

  return data || []
}
