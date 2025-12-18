// Supabase client initialization should only happen in server components or API routes

export interface ExamMasterRecord {
  id: string
  title: string
  course_id: string | null
  form_link: string
  sheet_link: string
  type: string
  status: string
  created_at: string
  batch_id: string | null
  total_marks: number
  passing_marks: number
  duration_minutes: number
}

export interface ExamResponseRecord {
  id: string
  exam_id: string
  student_name: string
  email: string
  phone: string
  course: string
  exam_type: string
  answers: Record<string, any>
  submitted_at: string
  created_at: string
}

/**
 * Extract Google Form ID from URL
 * Supports: https://forms.google.com/forms/d/{formId}/viewform
 */
export function extractFormId(url: string): string | null {
  try {
    const match = url.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Extract Google Sheet ID from URL
 * Supports: https://docs.google.com/spreadsheets/d/{sheetId}/edit
 */
export function extractSheetId(url: string): string | null {
  try {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Validate Google Form URL
 */
export function isValidFormUrl(url: string): boolean {
  return /forms\.google\.com\/forms\/d\/[a-zA-Z0-9-_]+/.test(url)
}

/**
 * Validate Google Sheet URL
 */
export function isValidSheetUrl(url: string): boolean {
  return /docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url)
}
