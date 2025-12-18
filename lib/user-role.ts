"use client"

import React from "react"

const ROLE_STORAGE_KEY = "sdhub:user-role"

export type UserRole = "admin" | "teacher" | "student"

export interface UserContext {
  role: UserRole
  name: string
  id: string
}

const DEFAULT_USER: UserContext = {
  role: "admin",
  name: "Admin User",
  id: "admin-001",
}

export function loadUserRole(): UserContext {
  if (typeof window === "undefined") return DEFAULT_USER
  const raw = localStorage.getItem(ROLE_STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      return DEFAULT_USER
    }
  }
  return DEFAULT_USER
}

export function saveUserRole(user: UserContext): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent("user-role-changed", { detail: user }))
}

export function useUserRole() {
  const [user, setUser] = React.useState<UserContext>(DEFAULT_USER)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setUser(loadUserRole())
    setMounted(true)

    const handleRoleChange = (e: Event) => {
      const event = e as CustomEvent<UserContext>
      setUser(event.detail)
    }

    window.addEventListener("user-role-changed", handleRoleChange)
    return () => window.removeEventListener("user-role-changed", handleRoleChange)
  }, [])

  return { user, mounted }
}
