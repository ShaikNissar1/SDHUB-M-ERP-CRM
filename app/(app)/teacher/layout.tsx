"use client"

import { ReactNode } from "react"
import { TeacherProvider } from "@/lib/contexts/teacher-context"
import { TeacherSelector } from "@/components/teacher/teacher-selector"

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <TeacherProvider>
      <div className="space-y-4">
        {/* Teacher selector for testing - mirrors Student layout */}
        <TeacherSelector />

        {/* Main content */}
        {children}
      </div>
    </TeacherProvider>
  )
}
