"use client"

import * as React from "react"

export type CourseModule = {
  id: string
  title: string
  teacher?: string
}

export type CourseDetails = {
  id: string
  name: string
  description?: string
  duration?: string
  modules: CourseModule[]
  languages?: string[]
  createdAt: string
}

const STORAGE_KEY = "sdhub:course-details"
const CUSTOM_EVENT = "course-details:changed"

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getAllCourseDetails(): CourseDetails[] {
  if (typeof window === "undefined") return []
  const list = safeParse<CourseDetails[]>(localStorage.getItem(STORAGE_KEY))
  return Array.isArray(list) ? list : []
}

function saveAll(list: CourseDetails[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT))
}

export function addCourseDetails(payload: Omit<CourseDetails, "id" | "createdAt">) {
  const id = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`
  const next: CourseDetails = {
    id,
    createdAt: new Date().toISOString(),
    ...payload,
  }
  const list = getAllCourseDetails()
  saveAll([next, ...list])
  return next
}

export function updateCourseDetails(id: string, patch: Partial<Omit<CourseDetails, "id" | "createdAt">>) {
  const list = getAllCourseDetails()
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) return
  const updated: CourseDetails = { ...list[idx], ...patch }
  list[idx] = updated
  saveAll(list)
  return updated
}

export function getCourseDetailsByName(name: string): CourseDetails | undefined {
  return getAllCourseDetails().find((c) => c.name.toLowerCase() === name.toLowerCase())
}

export function deleteCourseDetailsByName(name: string) {
  const list = getAllCourseDetails()
  const next = list.filter((c) => c.name.toLowerCase() !== name.toLowerCase())
  localStorage.setItem("sdhub:course-details", JSON.stringify(next))
  window.dispatchEvent(new CustomEvent("course-details:changed"))
}

export function useCourseDetails() {
  const [list, setList] = React.useState<CourseDetails[]>([])
  React.useEffect(() => {
    const load = () => setList(getAllCourseDetails())
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
  return list
}
