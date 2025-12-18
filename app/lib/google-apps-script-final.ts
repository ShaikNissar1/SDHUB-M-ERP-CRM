// Google Apps Script for Google Form → Supabase Integration
// Paste this into your Google Sheet's Apps Script editor (Extensions > Apps Script)

const SUPABASE_URL = "https://htxvrpgpvznzjhfdbcsj.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHZycGdwdnpuempoZmRiY3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjEwMTksImV4cCI6MjA3NjY5NzAxOX0.y3GKRFbMH2rTkNdjVaMMZPUmk5SxvepR98byW_JscK4"

const COLUMN_MAPPING = {
  timestamp: 0, // Column A: Timestamp (auto)
  score: 1, // Column B: Score
  name: 2, // Column C: Name
  email: 3, // Column D: Email
  course: 4, // Column E: Your first question? (assuming this is course)
  exam: 5, // Column F: Your second question? (assuming this is exam type)
  phone: 9, // Column J: Email Address (you may need to adjust this)
}

function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet()
    const row = e.range.getRow()
    const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]

    console.log("[v0] Raw form data:", data)

    const timestamp = data[COLUMN_MAPPING.timestamp] || new Date().toISOString()
    const score = data[COLUMN_MAPPING.score] ? Number.parseFloat(String(data[COLUMN_MAPPING.score])) : null
    const name = String(data[COLUMN_MAPPING.name] || "").trim()
    const email = String(data[COLUMN_MAPPING.email] || "")
      .trim()
      .toLowerCase()
    const course = String(data[COLUMN_MAPPING.course] || "").trim()
    const examType = String(data[COLUMN_MAPPING.exam] || "Entrance").trim()
    const phone = String(data[COLUMN_MAPPING.phone] || "").trim()

    console.log("[v0] Extracted data:", { name, email, phone, course, score, examType })

    if (!email && !phone) {
      console.log("[v0] Skipping: No email or phone provided")
      return
    }

    const result = score !== null && score >= 50 ? "Passed" : "Failed"
    const submittedAt = new Date().toISOString()

    console.log("[v0] Processing submission:", { name, email, phone, course, score, examType, result })

    // Insert into test_results table
    insertTestResult({
      name: name || null,
      email: email || null,
      phone: phone || null,
      course: course || null,
      exam: examType,
      score: score,
      submitted_at: submittedAt,
    })

    // Update leads table with entrance score and status
    updateLeadWithScore(email, phone, score, result, examType)

    console.log("[v0] Submission processed successfully")
  } catch (error) {
    console.error("[v0] Error in onFormSubmit:", error.toString())
  }
}

function insertTestResult(record) {
  const url = `${SUPABASE_URL}/rest/v1/test_results`

  const payload = {
    name: record.name,
    email: record.email,
    phone: record.phone,
    course: record.course,
    exam: record.exam,
    score: record.score !== null ? record.score : null,
    submitted_at: record.submitted_at,
  }

  console.log("[v0] Inserting test result:", payload)

  const options = {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  }

  try {
    const response = UrlFetchApp.fetch(url, options)
    const code = response.getResponseCode()
    const responseText = response.getContentText()

    console.log(`[v0] Test result insert response code: ${code}`)
    console.log(`[v0] Response: ${responseText}`)

    if (code === 201 || code === 204) {
      console.log("[v0] Test result inserted successfully")
      return true
    } else {
      console.error("[v0] Insert failed with code:", code)
      return false
    }
  } catch (error) {
    console.error("[v0] Error inserting test result:", error.toString())
    return false
  }
}

function updateLeadWithScore(email, phone, score, result, examType) {
  let filter = ""
  if (email) {
    filter = `email=eq.${encodeURIComponent(email)}`
  } else if (phone) {
    filter = `phone=eq.${encodeURIComponent(phone)}`
  }

  if (!filter) {
    console.log("[v0] No email or phone to filter leads")
    return false
  }

  const url = `${SUPABASE_URL}/rest/v1/leads?${filter}`

  let newStatus = "Pending Final Exam"
  if (result === "Failed") {
    newStatus = "Rejected"
  } else if (examType.toLowerCase().includes("final")) {
    newStatus = "Completed"
  }

  const payload = {
    entrance_score: score !== null ? score : null,
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  console.log("[v0] Updating lead with:", payload)

  const options = {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  }

  try {
    const response = UrlFetchApp.fetch(url, options)
    const code = response.getResponseCode()
    const responseText = response.getContentText()

    console.log(`[v0] Lead update response code: ${code}`)

    if (code === 200 || code === 204) {
      console.log("[v0] Lead updated successfully with score:", score, "and status:", newStatus)
      return true
    } else {
      console.error("[v0] Update failed with code:", code)
      return false
    }
  } catch (error) {
    console.error("[v0] Error updating lead:", error.toString())
    return false
  }
}

// Run this FIRST to verify your column structure
function debugFormStructure() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const lastRow = sheet.getLastRow()

  if (lastRow < 2) {
    console.log("[v0] No data rows found")
    return
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0]

  console.log("[v0] === FORM STRUCTURE DEBUG ===")
  console.log("[v0] Total columns:", data.length)

  for (let i = 0; i < data.length; i++) {
    const columnLetter = String.fromCharCode(65 + i)
    const header = headers[i] || "(no header)"
    const value = data[i] || "(empty)"
    console.log(`[v0] Column ${i} (${columnLetter}): "${header}" = "${value}"`)
  }

  console.log("[v0] UPDATE COLUMN_MAPPING based on the above output")
}
