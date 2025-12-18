"use client"

import { useState } from "react"
import { saveUserRole, loadUserRole, type UserRole } from "@/lib/user-role"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RoleSelector() {
  const user = loadUserRole()
  const [role, setRole] = useState<UserRole>(user.role)

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    saveUserRole({
      ...user,
      role: newRole,
    })
  }

  return (
    <Select value={role} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="teacher">Teacher</SelectItem>
        <SelectItem value="student">Student</SelectItem>
      </SelectContent>
    </Select>
  )
}
