"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Course } from "@/lib/supabase/types"

export function useSuperbaseCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data, error: err } = await supabase.from("courses").select("*").order("name", { ascending: true })

        if (err) throw err
        setCourses(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel("courses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => {
        fetchCourses()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { courses, loading, error }
}
