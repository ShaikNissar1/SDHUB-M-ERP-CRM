"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export function useSupabaseDocuments(studentId?: string) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setDocuments([])
      setLoading(false)
      return
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data, error: err } = await supabase
          .from("student_documents")
          .select("*")
          .eq("student_id", studentId)
          .order("uploaded_at", { ascending: false })

        if (err) throw err
        setDocuments(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch documents")
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`documents-${studentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_documents" }, () => {
        fetchDocuments()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [studentId])

  return { documents, loading, error }
}
