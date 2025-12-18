export const LEADS_STORAGE_KEY = "sdhub:leads"
export const LEADS_CHANGED_EVENT = "leads:changed"

export type AnyLead = {
  name: string
  email: string
  phone: string
  course: string
  qualification?: string
  source?: string
  status?: string
  createdAt?: string
  // new fields
  nextFollowUpDate?: string
  assignedHR?: string
  remarks?: string
  history?: Array<{ at: string; action: string }>
  entranceScore?: string
  finalScore?: string
}

export function loadLeads(): AnyLead[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AnyLead[]) : []
  } catch {
    return []
  }
}

export function saveLeads(leads: AnyLead[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads))
    window.dispatchEvent(new CustomEvent(LEADS_CHANGED_EVENT))
  } catch {}
}

export function todayYMDLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
