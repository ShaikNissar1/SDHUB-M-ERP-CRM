"use client"

import { useUserRole } from "@/lib/user-role"
import { AdminSidebar } from "@/components/sidebars/admin-sidebar"
import { TeacherSidebar } from "@/components/sidebars/teacher-sidebar"
import { StudentSidebar } from "@/components/sidebars/student-sidebar"
import { useEffect, useState } from "react"

export function AppSidebar() {
  const { user, mounted } = useUserRole()
  const [, setRoleChangeCounter] = useState(0)

  useEffect(() => {
    const handleRoleChange = () => {
      setRoleChangeCounter((prev) => prev + 1)
    }

    window.addEventListener("user-role-changed", handleRoleChange)
    return () => window.removeEventListener("user-role-changed", handleRoleChange)
  }, [])

  if (!mounted) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  switch (user.role) {
    case "teacher":
      return <TeacherSidebar />
    case "student":
      return <StudentSidebar />
    case "admin":
    default:
      return <AdminSidebar />
  }
}
