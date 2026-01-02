import type React from "react"
import { StudentProvider } from "@/lib/contexts/student-context"
import { StudentSelector } from "@/components/student/student-selector"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentProvider>
      <div className="space-y-4">
        {/* Student selector for testing - remove when auth is implemented */}
        <StudentSelector />

        {/* Main content */}
        {children}
      </div>
    </StudentProvider>
  )
}
