export type Teacher = {
  id: string
  name: string
  role?: string
  // management fields
  status?: "active" | "on_leave" | "inactive"
  rating?: number // 0..5
  contact?: string
  courseId?: string
  courseName?: string
  batchId?: string
  batchName?: string

  // Profile (optional)
  email?: string
  phone?: string
  altContact?: string
  photoUrl?: string
  gender?: string
  dob?: string
  bloodGroup?: string
  addrPermanent?: string
  addrCorrespondence?: string
  emergencyContact?: string

  // Professional (optional)
  experienceYears?: number
  previousInstitutes?: string
  skills?: string
  joiningDate?: string
  contractType?: string

  // Assignments (optional)
  assignedCourseIds?: string[]
  assignedBatchIds?: string[]

  // Documents & Notes (optional)
  documents?: TeacherDocument[]
  notes?: TeacherNote[]
}

export type TeacherNote = { id: string; text: string; ts: number }
export type TeacherDocument = {
  id: string
  type: "identity" | "education" | "address" | "experience" | "photo"
  name: string
  url: string
  uploadedAt: string
}

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: "arun-sharma",
    name: "Arun Sharma",
    role: "Senior Instructor",
    status: "active",
    rating: 5,
    contact: "arun.sharma@example.com",
    courseId: "101",
    courseName: "Mathematics",
    batchId: "B1",
    batchName: "Batch 1",
  },
  {
    id: "neha-kapoor",
    name: "Neha Kapoor",
    role: "Instructor",
    status: "active",
    rating: 4,
    contact: "neha.kapoor@example.com",
    courseId: "102",
    courseName: "Science",
    batchId: "B2",
    batchName: "Batch 2",
  },
  {
    id: "vikas-nair",
    name: "Vikas Nair",
    role: "Teaching Assistant",
    status: "active",
    rating: 3,
    contact: "vikas.nair@example.com",
    courseId: "103",
    courseName: "History",
    batchId: "B3",
    batchName: "Batch 3",
  },
  {
    id: "anita-desai",
    name: "Anita Desai",
    role: "Instructor",
    status: "active",
    rating: 4,
    contact: "anita.desai@example.com",
    courseId: "104",
    courseName: "English",
    batchId: "B4",
    batchName: "Batch 4",
  },
  {
    id: "rahul-mehta",
    name: "Rahul Mehta",
    role: "Instructor",
    status: "active",
    rating: 5,
    contact: "rahul.mehta@example.com",
    courseId: "105",
    courseName: "Geography",
    batchId: "B5",
    batchName: "Batch 5",
  },
  {
    id: "meera-nair",
    name: "Meera Nair",
    role: "Instructor",
    status: "active",
    rating: 4,
    contact: "meera.nair@example.com",
    courseId: "106",
    courseName: "Art",
    batchId: "B6",
    batchName: "Batch 6",
  },
]

const STORAGE_KEY = "sdhub_teachers_v1"

export function getTeachers(): Teacher[] {
  if (typeof window === "undefined") return DEFAULT_TEACHERS
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEACHERS))
    return DEFAULT_TEACHERS
  }
  try {
    const parsed = JSON.parse(raw) as Teacher[]
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TEACHERS
  } catch {
    return DEFAULT_TEACHERS
  }
}

export function saveTeachers(next: Teacher[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  // notify subscribers
  window.dispatchEvent(new CustomEvent("teachers:changed"))
}

export function addTeacher(t: Teacher) {
  if (typeof window === "undefined") return
  const list = getTeachers()
  saveTeachers([...list, t])
}

export function updateTeacher(id: string, patch: Partial<Teacher>) {
  if (typeof window === "undefined") return
  const list = getTeachers().map((t) => (t.id === id ? { ...t, ...patch } : t))
  saveTeachers(list)
}

export function removeTeacher(id: string) {
  if (typeof window === "undefined") return
  const list = getTeachers().filter((t) => t.id !== id)
  saveTeachers(list)
}

export function getTeacherById(id: string): Teacher | null {
  const list = getTeachers()
  return list.find((t) => t.id === id) ?? null
}

export function saveTeacher(updated: Teacher): Teacher {
  if (typeof window === "undefined") return updated
  const list = getTeachers()
  const idx = list.findIndex((t) => t.id === updated.id)
  const next = idx >= 0 ? [...list.slice(0, idx), updated, ...list.slice(idx + 1)] : [...list, updated]
  saveTeachers(next)
  return updated
}

export function addTeacherNote(teacherId: string, text: string): Teacher {
  const t = getTeacherById(teacherId)
  if (!t) return { id: teacherId, name: "Unknown" }
  const note: TeacherNote = { id: crypto.randomUUID(), text, ts: Date.now() }
  const updated: Teacher = { ...t, notes: [...(t.notes || []), note] }
  return saveTeacher(updated)
}

export function addTeacherDocument(teacherId: string, doc: TeacherDocument): Teacher {
  const t = getTeacherById(teacherId)
  if (!t) return { id: teacherId, name: "Unknown" }
  const updated: Teacher = { ...t, documents: [...(t.documents || []), doc] }
  return saveTeacher(updated)
}
