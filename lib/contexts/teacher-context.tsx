"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { getTeachers as getLocalTeachers } from "@/lib/teachers"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  subject: string
  status: string
  photo_url?: string
  batch_ids?: string[]
  batch_numbers?: string[]
}

interface TeacherContextType {
  selectedTeacher: Teacher | null
  setSelectedTeacher: (teacher: Teacher | null) => void
  teachers: Teacher[]
  isLoading: boolean
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined)

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const supabase = createBrowserClient()

        const { data, error } = await supabase
          .from("teachers")
          .select("id, name, email, phone, qualification, subject, status, photo_url")
          .eq("status", "Active")
          .order("name")

        const supa = !error && data ? data : []
        if (error) {
          console.warn("[v0] Could not fetch teachers from Supabase, using local admin teachers:", error)
        } else {
          console.log("[v0] Loaded teachers from Supabase:", supa.length)
        }

        const local = typeof window !== "undefined" ? getLocalTeachers() : []
        console.log("[v0] Loaded local admin teachers:", local.length)

        // If we have Supabase data, use only Supabase teachers (don't merge with local fallback)
        // This prevents deleted teachers from reappearing on page reload
        let merged: any[] = []
        if (supa && supa.length > 0) {
          // Use Supabase teachers as primary source
          merged = supa
          console.log("[v0] Using Supabase teachers (ignoring local fallback)")
        } else {
          // Only use local teachers if Supabase fetch failed or returned no data
          merged = local
          console.log("[v0] Using local fallback teachers")
        }

        setTeachers(merged)

        // If there's an impersonation payload in localStorage, prefer that
        try {
          const raw = typeof window !== "undefined" ? localStorage.getItem("sdhub:impersonate_teacher") : null
          const payload = raw ? JSON.parse(raw) : null
          if (payload && payload.id) {
            const found = merged.find((m: any) => m.id === payload.id)
            if (found) {
              setSelectedTeacher(found)
              console.log("[v0] Selected impersonated teacher from localStorage:", found.name)
            }
          }
        } catch (e) {
          // ignore malformed payloads
        }

        // Auto-select first teacher if none selected yet
        if (merged.length > 0 && !selectedTeacher) {
          setSelectedTeacher((prev) => prev ?? merged[0])
          if (!selectedTeacher) console.log("[v0] Auto-selected first teacher:", merged[0].name)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Exception in fetchTeachers:", err)
        // Fallback to local teachers on any error
        const local = typeof window !== "undefined" ? getLocalTeachers() : []
        setTeachers(local)
        if (local.length > 0 && !selectedTeacher) {
          setSelectedTeacher(local[0])
        }
        setIsLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  // Listen for impersonation changes triggered elsewhere (e.g. admin 'Test as' button)
  useEffect(() => {
    const onImpersonationChanged = () => {
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("sdhub:impersonate_teacher") : null
        const payload = raw ? JSON.parse(raw) : null
        if (payload && payload.id) {
          const found = teachers.find((t) => t.id === payload.id)
          if (found) {
            setSelectedTeacher(found)
            console.log("[v0] Impersonation changed, switched to:", found.name)
          }
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener("impersonation:changed", onImpersonationChanged)
    return () => window.removeEventListener("impersonation:changed", onImpersonationChanged)
  }, [teachers])

  return (
    <TeacherContext.Provider value={{ selectedTeacher, setSelectedTeacher, teachers, isLoading }}>
      {children}
    </TeacherContext.Provider>
  )
}

export function useTeacher() {
  const context = useContext(TeacherContext)
  if (context === undefined) {
    throw new Error("useTeacher must be used within a TeacherProvider")
  }
  return context
}
