"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  batch_id: string
  batch_number: string
  course_name: string
  course_id: string
  status: string
  photo_url?: string
}

interface StudentContextType {
  selectedStudent: Student | null
  setSelectedStudent: (student: Student | null) => void
  students: Student[]
  isLoading: boolean
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      const supabase = createBrowserClient()

      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, phone, batch_id, batch_number, course_name, course_id, status, photo_url")
        .eq("status", "Active")
        .order("name")

      if (error) {
        console.error("[v0] Error fetching students:", error)
        setIsLoading(false)
        return
      }

      console.log("[v0] Loaded students for selector:", data?.length || 0)
      console.log("[v0] Students data:", data)
      setStudents(data || [])

      // Auto-select first student if none selected
      if (data && data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0])
        console.log("[v0] Auto-selected first student:", data[0].name)
      }

      setIsLoading(false)
    }

    fetchStudents()
  }, [])

  return (
    <StudentContext.Provider value={{ selectedStudent, setSelectedStudent, students, isLoading }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
