// Utility functions to mask sensitive data

export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar) return "Not provided"
  const digits = aadhaar.replace(/\D/g, "")
  if (digits.length < 4) return "****"
  return `XXXX-XXXX-${digits.slice(-4)}`
}

export function maskPAN(pan: string | null | undefined): string {
  if (!pan) return "Not provided"
  const cleaned = pan.toUpperCase().replace(/\s/g, "")
  if (cleaned.length < 5) return "XXXXX****"
  return `XXXXX${cleaned.slice(-5)}`
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return "text-green-600"
  if (percentage >= 75) return "text-yellow-600"
  return "text-red-600"
}

export function getAttendanceStatus(percentage: number): string {
  if (percentage >= 85) return "Excellent"
  if (percentage >= 75) return "Good"
  return "Needs Improvement"
}
