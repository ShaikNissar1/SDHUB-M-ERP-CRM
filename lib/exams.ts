"use client"

import * as React from "react"

export type ExamRecord = {
  id: string
  title: string
  type: "Entrance" | "Main" | "Internal Assessment"
  course: string
  batch?: string
  formLink: string
  sheetLink?: string
  totalMarks?: number
  passingMarks?: number
  durationMinutes?: number
  createdBy: string
  status: "Active" | "Inactive"
  createdAt: string // ISO
}

const STORAGE_KEY = "sdhub:exams"
const CUSTOM_EVENT = "exams:changed"

export function getExams(): ExamRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as ExamRecord[]) : []
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export function saveExams(next: ExamRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT))
  } catch {
    // ignore
  }
}

export function addExam(rec: Omit<ExamRecord, "id" | "createdAt">) {
  const item: ExamRecord = {
    ...rec,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const current = getExams()
  saveExams([item, ...current])
}

export function updateExam(id: string, patch: Partial<ExamRecord>) {
  const current = getExams()
  const idx = current.findIndex((x) => x.id === id)
  if (idx === -1) return
  const next = [...current]
  next[idx] = { ...next[idx], ...patch }
  saveExams(next)
}

export function removeExam(id: string) {
  const current = getExams()
  saveExams(current.filter((x) => x.id !== id))
}

export function useExams() {
  const [exams, setExams] = React.useState<ExamRecord[]>([])
  React.useEffect(() => {
    const load = () => setExams(getExams())
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
  return exams
}
