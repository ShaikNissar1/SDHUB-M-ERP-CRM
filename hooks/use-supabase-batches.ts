"use client"

import { useEffect, useState } from "react"
import { getBatches } from "@/lib/supabase/batches"
import type { Batch } from "@/lib/supabase/types"
import { getSupabaseClient } from "@/lib/supabase/client"

export function useSupabaseBatches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true)
      const data = await getBatches()
      console.log("[v0] Fetched batches from Supabase:", data.length)
      setBatches(data)
      setLoading(false)
    }

    fetchBatches()

    // Subscribe to realtime changes
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel("batches-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "batches" }, () => {
        console.log("[v0] Batches changed, refreshing...")
        fetchBatches()
      })
      .subscribe((status) => {
        console.log("[v0] Batches subscription status:", status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { batches, loading }
}
