"use client"

import { ReactNode } from "react"
import { TeacherProvider } from "@/lib/contexts/teacher-context"

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <TeacherProvider>
      {children}
    </TeacherProvider>
  )
}
