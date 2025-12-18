"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseClient, withRetry } from "@/lib/supabase/client"
import type { Lead } from "@/lib/supabase/types"

export function useSupabaseLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const data = await withRetry(async () => {
        const supabase = getSupabaseClient()
        const { data, error: err } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

        if (err) throw err
        return data || []
      })

      setLeads(data)
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching leads:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch leads")
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads, refreshTrigger])

  useEffect(() => {
    const supabase = getSupabaseClient()

    const channel = supabase
      .channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        console.log("[v0] Real-time update received:", payload)
        // Refetch leads when any change is detected
        fetchLeads()
      })
      .subscribe((status) => {
        console.log("[v0] Subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("[v0] Successfully subscribed to leads changes")
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [fetchLeads])

  useEffect(() => {
    const handleLeadsUpdate = () => {
      console.log("[v0] Custom leads:updated event triggered, refreshing")
      fetchLeads()
    }

    window.addEventListener("leads:updated", handleLeadsUpdate)
    return () => window.removeEventListener("leads:updated", handleLeadsUpdate)
  }, [fetchLeads])

  const refreshLeads = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return { leads, loading, error, refreshLeads }
}
