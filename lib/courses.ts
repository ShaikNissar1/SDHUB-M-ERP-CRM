"use client"

import * as React from "react"

const STORAGE_KEY = "sdhub:courses"
const CUSTOM_EVENT = "courses:changed"

const DEFAULT_COURSES = [
  "Digital Marketing + Graphic Designing",
  "Data Analytics",
  "Tally ERP",
  "Office Administration",
  "Web Development",
] as const

const MIGRATION_KEY = "sdhub:courses:migrated-keep-defaults-2025-10-14"

export function getCourses(): string[] {
  if (typeof window === "undefined") return Array.from(DEFAULT_COURSES)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : null
    if (Array.isArray(parsed)) {
      const migrated = localStorage.getItem(MIGRATION_KEY) === "1"
      if (!migrated) {
        const allowed = new Set(DEFAULT_COURSES)
        const cleaned = parsed.filter((c) => allowed.has(c))
        const next = cleaned.length ? cleaned : Array.from(DEFAULT_COURSES)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        localStorage.setItem(MIGRATION_KEY, "1")
        return next
      }
      if (parsed.length) return parsed
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(DEFAULT_COURSES)))
    return Array.from(DEFAULT_COURSES)
  } catch {
    return Array.from(DEFAULT_COURSES)
  }
}

export function saveCourses(next: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(next.map((c) => c.trim()).filter(Boolean)))))
    // notify same-tab listeners
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT))
  } catch {
    // ignore
  }
}

export function addCourse(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  const current = getCourses()
  if (!current.includes(trimmed)) {
    saveCourses([...current, trimmed])
  } else {
    // still notify to close dialogs and refresh lists
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT))
  }
}

export function deleteCourse(name: string) {
  const current = getCourses()
  const next = current.filter((c) => c.toLowerCase() !== name.toLowerCase())
  saveCourses(next)
}

export function useCourses() {
  const [courses, setCourses] = React.useState<string[]>([])
  React.useEffect(() => {
    const load = () => setCourses(getCourses())
    load()
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load()
    }
    const onCustom = () => load()
    window.addEventListener("storage", onStorage)
    window.addEventListener(CUSTOM_EVENT as any, onCustom as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(CUSTOM_EVENT as any, onCustom as any)
    }
  }, [])
  return courses
}

export function useSupabaseCourses() {
  const [courses, setCourses] = React.useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadCourses() {
      try {
        setError(null)
        const { getCourses: getSupabaseCourses } = await import("@/lib/supabase/courses")
        const data = await getSupabaseCourses()
        setCourses(data.map((c) => ({ id: c.id, name: c.name })))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error("[v0] Supabase error fetching courses:", errorMessage)
        setError(errorMessage)

        // Fallback to localStorage courses
        const localCourses = getCourses()
        setCourses(localCourses.map((name, idx) => ({ id: `local-${idx}`, name })))
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  return { courses, loading, error }
}
