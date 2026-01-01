"use client"

import React from "react"

export type BatchStatus = "Active" | "Upcoming" | "Completed"

export type BatchModuleAssignment = {
  moduleId: string
  title: string
  teachers: string[] // teacher names
}

export type Batch = {
  id: string
  course: string
  name: string
  startDate: string // ISO
  endDate: string // ISO
  status: BatchStatus
  totalStudents: number
  trainer: string
  maxStudents?: number
  description?: string
  moduleAssignments?: BatchModuleAssignment[]
  completedAt?: string // ISO date when batch was auto-completed
  notificationSentAt?: string // ISO date when 7-day pre-completion notification was sent
  // Supabase compatibility fields
  course_name?: string
  start_date?: string
  end_date?: string
  max_students?: number
  total_students?: number
  trainer_name?: string
}

const batchesMock: Batch[] = [
  {
    id: "B-2025-001",
    course: "Full-Stack Web Dev",
    name: "FSWD Q1",
    startDate: "2025-01-15",
    endDate: "2025-04-30",
    status: "Active",
    totalStudents: 28,
    trainer: "Anita Desai",
    maxStudents: 30,
    description: "Morning batch, Mon-Wed-Fri",
  },
  {
    id: "B-2025-002",
    course: "Data Science",
    name: "DS Q2",
    startDate: "2025-05-05",
    endDate: "2025-08-15",
    status: "Upcoming",
    totalStudents: 0,
    trainer: "Rahul Mehta",
    maxStudents: 35,
    description: "Evening batch, Tue-Thu-Sat",
  },
  {
    id: "B-2024-010",
    course: "UI/UX Design",
    name: "UX Winter",
    startDate: "2024-10-01",
    endDate: "2024-12-20",
    status: "Completed",
    totalStudents: 22,
    trainer: "Meera Nair",
    maxStudents: 25,
    description: "Completed capstone showcase in Dec",
  },
]

export function formatDate(dateISO: string) {
  try {
    return new Date(dateISO).toLocaleDateString()
  } catch {
    return dateISO
  }
}

export function durationDays(startISO: string, endISO: string) {
  const s = new Date(startISO).getTime()
  const e = new Date(endISO).getTime()
  const days = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)))
  return `${days} days`
}

function computeStatus(startISO: string, endISO: string): BatchStatus {
  const today = new Date()
  const start = new Date(startISO)
  const end = new Date(endISO)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Upcoming"
  if (today < start) return "Upcoming"
  if (today > end) return "Completed"
  return "Active"
}

function normalizeCourseNameForPrefix(course: string) {
  const c = (course || "").trim().toLowerCase()
  // Map common variants and typos
  if (c.includes("digital marketing")) return "Digital Marketing"
  if (c.includes("web develop")) return "Web Development" // handles Web development, Web Developement, Webdevelopment
  if (c.includes("full-stack web")) return "Web Development"
  if (c.includes("data science")) return "Data Science"
  if (c.includes("data analytic")) return "Data Analytics"
  if (c.includes("tally")) return "Tally ERP"
  if (c.includes("office admin")) return "Office Administration"
  return course || "Course"
}

export function coursePrefix(course: string) {
  const normalized = normalizeCourseNameForPrefix(course)
  switch (normalized) {
    case "Digital Marketing":
    case "Digital Marketing + Graphic Designing":
      return "DM"
    case "Web Development":
      return "WD"
    case "Data Science":
    case "Data Analytics":
      return "DA"
    case "Tally ERP":
      return "TE"
    case "Office Administration":
      return "OA"
    default:
      // fallback 2-letter code from initials
      const parts = normalized.split(/\s+/).filter(Boolean)
      const code = (parts[0]?.[0] || "X") + (parts[1]?.[0] || "X")
      return code.toUpperCase()
  }
}

function yearYYFromISO(startISO?: string) {
  const d = startISO ? new Date(startISO) : new Date()
  const yy = String(d.getFullYear()).slice(-2)
  return yy
}

function fullYearFromISO(startISO?: string) {
  const d = startISO ? new Date(startISO) : new Date()
  return d.getFullYear()
}

function nextBatchSequenceForCourseYear(course: string, startISO?: string) {
  // Count existing batches for same normalized course and same full year, then +1
  const normalized = normalizeCourseNameForPrefix(course)
  const year = fullYearFromISO(startISO)
  const list = getBatches()
  const count = list.filter((b) => {
    const bYear = fullYearFromISO(b.startDate)
    return normalizeCourseNameForPrefix(b.course) === normalized && bYear === year
  }).length
  return count + 1
}

export function makeBatchId(course: string, startISO?: string, sequence?: number) {
  const prefix = coursePrefix(course)
  const seq = sequence ?? nextBatchSequenceForCourseYear(course, startISO)
  // Example: WDB1, WDB2, DMB1, DMB2 (no year component)
  return `${prefix}B${seq}`
}

export function makeDefaultBatchName(course: string, startISO?: string, sequence?: number) {
  const prefix = coursePrefix(course)
  const seq = sequence ?? nextBatchSequenceForCourseYear(course, startISO)
  // Example: WDB1, WDB2, DMB1, DMB2 (no year component)
  return `${prefix}B${seq}`
}

function nextAvailableSequenceForCourseYear(course: string, startISO?: string) {
  const list = getBatches()
  const normalized = normalizeCourseNameForPrefix(course)
  const yy = yearYYFromISO(startISO)
  const prefix = coursePrefix(course)
  let seq = nextBatchSequenceForCourseYear(course, startISO)

  const isDuplicate = (candidateSeq: number) => {
    const candId = `${prefix}${yy}${candidateSeq}`
    return list.some((b) => b.id === candId && normalizeCourseNameForPrefix(b.course) === normalized)
  }

  while (isDuplicate(seq)) {
    seq += 1
  }
  return seq
}

const STORAGE_KEY = "sdhub:batches"
const CUSTOM_EVENT = "batches:changed"
const STUDENT_RECORDS_KEY = "sdhub:student-records"
const BATCH_LIFECYCLE_KEY = "sdhub:batch-lifecycle-log"

function loadStudentRecordsCountMap(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STUDENT_RECORDS_KEY)
    const items = raw ? (JSON.parse(raw) as Array<{ batchNumber?: string; status?: string }>) : []
    const map: Record<string, number> = {}
    for (const rec of items) {
      const id = (rec.batchNumber || "").trim()
      if (!id) continue
      map[id] = (map[id] || 0) + 1
    }
    return map
  } catch {
    return {}
  }
}

/** Load all batches from localStorage, falling back to mock if empty */
export function getBatches(): Batch[] {
  if (typeof window === "undefined") {
    const base = batchesMock.map((b) => ({ ...b, status: computeStatus(b.startDate, b.endDate) }))
    return base
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const source = raw ? (JSON.parse(raw) as Batch[]) : batchesMock
    const statusApplied = source.map((b) => ({ ...b, status: computeStatus(b.startDate, b.endDate) }))
    const counts = loadStudentRecordsCountMap()
    return statusApplied.map((b) => ({
      ...b,
      totalStudents: typeof counts[b.id] === "number" ? counts[b.id] : (b.totalStudents ?? 0),
    }))
  } catch {
    return batchesMock.map((b) => ({ ...b, status: computeStatus(b.startDate, b.endDate) }))
  }
}

/** Get single batch by ID from localStorage */
export function getBatch(id: string): Batch | undefined {
  return getBatches().find((b) => b.id === id)
}

/** Save all batches to localStorage */
function saveBatches(batches: Batch[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CUSTOM_EVENT))
    }
  } catch {
    // ignore
  }
}

/** Create a new batch */
export function createBatch(
  payload: Omit<Batch, "id" | "totalStudents"> & { moduleAssignments?: BatchModuleAssignment[] },
): Batch {
  const batches = getBatches()
  const seq = nextAvailableSequenceForCourseYear(payload.course, payload.startDate)
  const computedId = makeBatchId(payload.course, payload.startDate, seq)
  const finalName = payload.name?.trim() || makeDefaultBatchName(payload.course, payload.startDate, seq)

  const newBatch: Batch = {
    ...payload,
    id: computedId,
    name: finalName,
    totalStudents: 0,
    // Ensure status reflects dates at creation
    status: computeStatus(payload.startDate, payload.endDate),
  }
  batches.push(newBatch)
  saveBatches(batches)
  return newBatch
}

/** Update an existing batch */
export function updateBatch(id: string, payload: Partial<Batch>) {
  const batches = getBatches()
  const index = batches.findIndex((b) => b.id === id)
  if (index >= 0) {
    batches[index] = { ...batches[index], ...payload }
    saveBatches(batches)
  }
}

/** Delete a batch */
export function deleteBatch(id: string) {
  let batches = getBatches()
  batches = batches.filter((b) => b.id !== id)
  saveBatches(batches)
}

/** Get all completed batches (archived) */
export function getCompletedBatches(): Batch[] {
  return getBatches().filter((b) => b.status === "Completed")
}

/** Get all active batches */
export function getActiveBatches(): Batch[] {
  return getBatches().filter((b) => b.status === "Active")
}

/** Reactivate a completed batch and its students */
export function reactivateBatch(batchId: string) {
  const batch = getBatch(batchId)
  if (!batch) return

  // Update batch status back to Active
  updateBatch(batchId, { status: "Active", completedAt: undefined })

  // Update all students in this batch back to Active
  try {
    const raw = localStorage.getItem(STUDENT_RECORDS_KEY)
    const records = raw ? (JSON.parse(raw) as Array<any>) : []
    const updated = records.map((r) => {
      if ((r.batchNumber || "").trim() === batchId && r.status === "Completed") {
        return { ...r, status: "Active" }
      }
      return r
    })
    localStorage.setItem(STUDENT_RECORDS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("student-records:changed"))
  } catch {
    // ignore
  }
}

/** Run batch lifecycle automation (call daily via scheduled task) */
export function runBatchLifecycleAutomation() {
  if (typeof window === "undefined") return

  const batches = getBatches()
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  let updated = false

  for (const batch of batches) {
    const endDate = batch.endDate.split("T")[0]
    // If batch end date has passed and status is not already Completed
    if (today > endDate && batch.status !== "Completed") {
      // Mark batch as completed
      updateBatch(batch.id, { status: "Completed", completedAt: new Date().toISOString() })

      // Update all students in this batch to Completed status
      try {
        const raw = localStorage.getItem(STUDENT_RECORDS_KEY)
        const records = raw ? (JSON.parse(raw) as Array<any>) : []
        const updatedRecords = records.map((r) => {
          if ((r.batchNumber || "").trim() === batch.id) {
            return { ...r, status: "Completed" }
          }
          return r
        })
        localStorage.setItem(STUDENT_RECORDS_KEY, JSON.stringify(updatedRecords))
      } catch {
        // ignore
      }

      updated = true
    }

    // Check if 7-day pre-completion notification should be sent
    const endDateObj = new Date(batch.endDate)
    const sevenDaysBeforeEnd = new Date(endDateObj.getTime() - 7 * 24 * 60 * 60 * 1000)
    const todayObj = new Date(today)

    if (
      todayObj >= sevenDaysBeforeEnd &&
      todayObj < endDateObj &&
      batch.status === "Active" &&
      !batch.notificationSentAt
    ) {
      // Send notification (in real app, this would trigger email/SMS)
      console.log(`[Batch Lifecycle] 7-day pre-completion notification for batch ${batch.id}`)
      updateBatch(batch.id, { notificationSentAt: new Date().toISOString() })
      updated = true
    }
  }

  if (updated) {
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT))
  }
}

export function useBatches() {
  const [list, setList] = React.useState<Batch[]>([])
  React.useEffect(() => {
    const load = () => setList(getBatches())
    load()
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === STUDENT_RECORDS_KEY) load()
    }
    const onCustom = () => load()
    const onRecordsChanged = () => load()
    window.addEventListener("storage", onStorage)
    window.addEventListener("student-records:changed" as any, onRecordsChanged as any)
    window.addEventListener(CUSTOM_EVENT as any, onCustom as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("student-records:changed" as any, onRecordsChanged as any)
      window.removeEventListener(CUSTOM_EVENT as any, onCustom as any)
    }
  }, [])
  return list
}
