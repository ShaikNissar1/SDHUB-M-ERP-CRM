"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

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
      const supabase = createBrowserClient()

      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, email, phone, qualification, subject, status, photo_url")
        .eq("status", "Active")
        .order("name")

      if (error) {
        console.error("[v0] Error fetching teachers:", error)
        setIsLoading(false)
        return
      }

      console.log("[v0] Loaded teachers for selector:", data?.length || 0)
      console.log("[v0] Teachers data:", data)
      setTeachers(data || [])

      // Auto-select first teacher if none selected
      if (data && data.length > 0 && !selectedTeacher) {
        setSelectedTeacher(data[0])
        console.log("[v0] Auto-selected first teacher:", data[0].name)
      }

      setIsLoading(false)
    }

    fetchTeachers()
  }, [])

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
