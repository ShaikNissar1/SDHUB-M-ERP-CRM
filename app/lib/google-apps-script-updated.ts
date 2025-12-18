// Google Apps Script for Google Form → Supabase Integration
// Paste this into your Google Sheet's Apps Script editor (Extensions > Apps Script)

const SUPABASE_URL = "https://htxvrpgpvznzjhfdbcsj.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eHZycGdwdnpuempoZmRiY3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjEwMTksImV4cCI6MjA3NjY5NzAxOX0.y3GKRFbMH2rTkNdjVaMMZPUmk5SxvepR98byW_JscK4"

const COLUMN_MAPPING = {
  timestamp: 0, // Column A
  score: 1, // Column B - ADJUST THIS
  name: 2, // Column C - ADJUST THIS
  email: 3, // Column D - ADJUST THIS
  phone: 8, // Column I - ADJUST THIS (Email Address field)
  course: 4, // Column E - ADJUST THIS
  examType: 6, // Column G - ADJUST THIS
}

/**
 * Main function triggered when a form is submitted
 * IMPORTANT: Run debugFormStructure() first to identify correct column indices
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet()
    const row = e.range.getRow()
    const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]

    console.log("[v0] Raw form data:", data)

    const timestamp = data[COLUMN_MAPPING.timestamp] || new Date().toISOString()
    const name = String(data[COLUMN_MAPPING.name] || "").trim()
    const email = String(data[COLUMN_MAPPING.email] || "")
      .trim()
      .toLowerCase()
    const phone = String(data[COLUMN_MAPPING.phone] || "").trim()
    const course = String(data[COLUMN_MAPPING.course] || "").trim()
    const score = data[COLUMN_MAPPING.score] ? Number.parseFloat(data[COLUMN_MAPPING.score]) : null
    const examType = String(data[COLUMN_MAPPING.examType] || "Entrance").trim()

    console.log("[v0] Extracted data:", { name, email, phone, course, score, examType })

    // Validation
    if (!email && !phone) {
      console.log("[v0] Skipping: No email or phone provided")
      return
    }

    if (score === null || score === undefined) {
      console.log("[v0] Warning: Score is null or undefined")
    }

    const result = score >= 50 ? "Passed" : "Failed"
    const submittedAt = new Date().toISOString()

    console.log("[v0] Processing submission:", { name, email, phone, course, score, examType, result })

    // Step 1: Insert into test_results table
    insertTestResult({
      name: name || null,
      email: email || null,
      phone: phone || null,
      course: course || null,
      exam: examType,
      score: score,
      submitted_at: submittedAt,
    })

    // Step 2: Update leads table with entrance score and status
    updateLeadWithScore(email, phone, score, result, examType)

    console.log("[v0] Submission processed successfully")
  } catch (error) {
    console.error("[v0] Error in onFormSubmit:", error.toString())
  }
}

/**
 * Insert test result into Supabase test_results table
 */
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
      console.error("[v0] Response:", responseText)
      return false
    }
  } catch (error) {
    console.error("[v0] Error inserting test result:", error.toString())
    return false
  }
}

/**
 * Update lead with entrance score and status
 */
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
    final_score: result === "Passed" && examType.toLowerCase().includes("final") ? score : null,
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
    console.log(`[v0] Response: ${responseText}`)

    if (code === 200 || code === 204) {
      console.log("[v0] Lead updated successfully with score:", score, "and status:", newStatus)
      return true
    } else {
      console.error("[v0] Update failed with code:", code)
      console.error("[v0] Response:", responseText)
      return false
    }
  } catch (error) {
    console.error("[v0] Error updating lead:", error.toString())
    return false
  }
}

/**
 * IMPROVED DEBUG FUNCTION - Run this FIRST to identify your column structure
 * Steps:
 * 1. Go to Extensions > Apps Script
 * 2. Click the Run button next to debugFormStructure
 * 3. Check the Execution log (View > Logs)
 * 4. Update COLUMN_MAPPING above with the correct indices
 */
function debugFormStructure() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const lastRow = sheet.getLastRow()

  if (lastRow < 2) {
    console.log("[v0] No data rows found")
    return
  }

  // Get header row
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]

  // Get the last row of data
  const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0]

  console.log("[v0] === FORM STRUCTURE DEBUG ===")
  console.log("[v0] Total columns:", data.length)
  console.log("[v0] ")
  console.log("[v0] HEADERS AND DATA:")

  for (let i = 0; i < data.length; i++) {
    const columnLetter = String.fromCharCode(65 + i)
    const header = headers[i] || "(no header)"
    const value = data[i] || "(empty)"
    console.log(`[v0] Column ${i} (${columnLetter}): "${header}" = "${value}"`)
  }

  console.log("[v0] ")
  console.log("[v0] UPDATE COLUMN_MAPPING BASED ON THE ABOVE:")
  console.log("[v0] Find which column has: Name, Email, Phone, Score, Course")
  console.log("[v0] Then update the COLUMN_MAPPING object at the top of this script")
}

/**
 * Test function - run this to verify setup
 */
function testIntegration() {
  console.log("[v0] Starting integration test...")

  const testEmail = "test@example.com"
  const testPhone = "9999999999"

  const testRecord = {
    name: "Test User",
    email: testEmail,
    phone: testPhone,
    course: "Fullstack",
    exam: "Entrance",
    score: 75,
    submitted_at: new Date().toISOString(),
  }

  console.log("[v0] Testing with record:", testRecord)

  // Test 1: Insert test result
  const insertSuccess = insertTestResult(testRecord)
  console.log("[v0] Insert test result:", insertSuccess ? "SUCCESS" : "FAILED")

  // Test 2: Update lead with score
  const updateSuccess = updateLeadWithScore(testEmail, testPhone, 75, "Passed", "Entrance")
  console.log("[v0] Update lead with score:", updateSuccess ? "SUCCESS" : "FAILED")

  console.log("[v0] Integration test complete - check Supabase for records")
}

// Declare variables to fix lint errors
const SpreadsheetApp = SpreadsheetApp
const UrlFetchApp = UrlFetchApp
