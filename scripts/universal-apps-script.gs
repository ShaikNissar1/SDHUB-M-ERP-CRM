// ============================================================================
// UNIVERSAL GOOGLE APPS SCRIPT FOR EXAM MASTER
// ============================================================================
// This script works for ALL exam types (Entrance, Main, Internal)
// Stores exam_id in Script Properties (not in sheet cells)
// 
// Setup Instructions:
// 1. Open your Google Sheet (linked to Google Form)
// 2. Go to Extensions > Apps Script
// 3. Paste this entire code
// 4. Refresh the sheet - you'll see "Exam Master" menu
// 5. Click "Exam Master" > "Set Exam ID" and paste your exam_id
// 6. Create a trigger: onFormSubmit → On form submit
// ============================================================================

const SUPABASE_URL = "https://rszmcokytcvuoaorjwmn.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzem1jb2t5dGN2dW9hb3Jqd21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzIwNzcsImV4cCI6MjA3NzQwODA3N30.bognkJQu1PBOT6xhwsQVVexPwmc8qj0zMZSPm2Xwv2A"
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzem1jb2t5dGN2dW9hb3Jqd21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgzMjA3NywiZXhwIjoyMDc3NDA4MDc3fQ.sfudbFcr_rJOu9aV89TWg0wsIsI4LN6MYrrSfyIj8lQ"

const COLUMN_MAPPING = {
  TIMESTAMP: 0,      // Column A - Timestamp
  EMAIL: 1,          // Column B - Email Address
  SCORE: 2,          // Column C - Score (e.g., "10 / 70")
  NAME: 3,           // Column D - Full Name
  GENDER: 4,         // Column E - Gender
  FATHER_NAME: 5,    // Column F - Father Name
  PHONE: 6,          // Column G - Contact Number
  EMAIL_DUP: 7,      // Column H - Email Address (duplicate - skip)
  COURSE: 8,         // Column I - Course
  ADDRESS: 9,        // Column J - Address
}

/**
 * Creates a menu when the sheet is opened
 * Allows users to set exam_id without using console
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu("Exam Master")
    .addItem("Set Exam ID", "showSetExamIdDialog")
    .addItem("View Exam ID", "showExamIdStatus")
    .addItem("Clear Exam ID", "clearExamIdProperty")
    .addSeparator()
    .addItem("Debug Form Structure", "debugFormStructure")
    .addSeparator()
    .addItem("Check Trigger Setup", "checkTrigger")
    .addSeparator()
    .addItem("Test Form Submission", "testFormSubmission")
    .addToUi()
}

/**
 * Shows a dialog to set the exam_id
 * CHANGED: Using modeless dialog with proper callback handling
 */
function showSetExamIdDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial; padding: 20px; margin: 0; }
      input { width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; font-size: 14px; }
      button { padding: 10px 20px; background: #4285F4; color: white; border: none; cursor: pointer; border-radius: 4px; font-size: 14px; }
      button:hover { background: #357ae8; }
      .info { color: #666; font-size: 12px; margin-top: 10px; }
      .success { color: #0f9d58; font-weight: bold; margin-top: 10px; }
      .error { color: #d33b27; font-weight: bold; margin-top: 10px; }
    </style>
    <h3>Set Exam ID</h3>
    <p>Paste your exam UUID from the ERP system:</p>
    <input type="text" id="examId" placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000">
    <button onclick="saveExamId()">Save Exam ID</button>
    <div id="message"></div>
    <div class="info">This will be stored in Script Properties and used for all form submissions.</div>
    <script>
      function saveExamId() {
        const examId = document.getElementById('examId').value.trim();
        const messageDiv = document.getElementById('message');
        
        if (!examId) {
          messageDiv.innerHTML = '<div class="error">Please enter an exam ID</div>';
          return;
        }
        
        messageDiv.innerHTML = '<div>Saving...</div>';
        
        // CHANGED: Using withSuccessHandler to ensure callback is called
        google.script.run
          .withSuccessHandler(function(result) {
            messageDiv.innerHTML = '<div class="success">✓ Exam ID saved successfully!</div>';
            console.log('Exam ID saved:', result);
            setTimeout(() => {
              google.script.host.close();
            }, 1500);
          })
          .withFailureHandler(function(error) {
            messageDiv.innerHTML = '<div class="error">Error: ' + error + '</div>';
          })
          .setExamIdProperty(examId);
      }
      
      // Allow Enter key to save
      document.getElementById('examId').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveExamId();
      });
    </script>
  `)
  SpreadsheetApp.getUi().showModelessDialog(html, "Set Exam ID")
}

/**
 * Shows current exam_id status
 * CHANGED: Also display in console for debugging
 */
function showExamIdStatus() {
  const examId = getExamIdProperty()
  console.log("[v0] Current Exam ID:", examId)
  if (examId) {
    SpreadsheetApp.getUi().alert(`Current Exam ID:\n${examId}`)
  } else {
    SpreadsheetApp.getUi().alert("No Exam ID set. Click 'Exam Master' > 'Set Exam ID' to configure.")
  }
}

/**
 * Set exam_id in Script Properties
 */
function setExamIdProperty(examId) {
  const properties = PropertiesService.getScriptProperties()
  properties.setProperty("EXAM_ID", String(examId).trim())
  console.log("[v0] Exam ID saved to Script Properties:", examId)
  return "Exam ID saved successfully"
}

/**
 * Get exam_id from Script Properties
 */
function getExamIdProperty() {
  const properties = PropertiesService.getScriptProperties()
  const examId = properties.getProperty("EXAM_ID")
  console.log("[v0] Retrieved Exam ID from Script Properties:", examId)
  return examId
}

/**
 * Clear exam_id from Script Properties
 */
function clearExamIdProperty() {
  const properties = PropertiesService.getScriptProperties()
  properties.deleteProperty("EXAM_ID")
  SpreadsheetApp.getUi().alert("Exam ID cleared from Script Properties")
  console.log("[v0] Exam ID cleared from Script Properties")
  return "Exam ID cleared"
}

/**
 * Fetch exam type from Supabase exams table using exam_id
 */
function getExamType(examId) {
  const url = `${SUPABASE_URL}/rest/v1/exams?id=eq.${examId}&select=type`
  
  const options = {
    method: "GET",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    muteHttpExceptions: true,
  }
  
  try {
    const response = UrlFetchApp.fetch(url, options)
    const code = response.getResponseCode()
    const responseText = response.getContentText()
    
    console.log("[v0] Exam type lookup response code:", code)
    console.log("[v0] Exam type lookup response:", responseText)
    
    if (code === 200) {
      const data = JSON.parse(responseText)
      if (data && data.length > 0) {
        const examType = data[0].type
        console.log("[v0] Found exam type:", examType)
        return examType
      }
    }
  } catch (error) {
    console.error("[v0] Error fetching exam type:", error.toString())
  }
  
  return null
}

/**
 * Main trigger function - fires on every form submission
 * Automatically reads exam_id from Script Properties (not from sheet)
 * Now fetches exam type from database and routes to correct table
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet()
    const row = e.range.getRow()
    const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]

    console.log("[v0] Form submission received at row:", row)
    console.log("[v0] Raw data:", data)

    const examId = getExamIdProperty()

    if (!examId) {
      console.error("[v0] ERROR: exam_id not found in Script Properties. Click 'Exam Master' > 'Set Exam ID'")
      return
    }

    console.log("[v0] Exam ID from Script Properties:", examId)

    // Extract form data using column mapping
    const timestamp = data[COLUMN_MAPPING.TIMESTAMP] || new Date().toISOString()
    const name = String(data[COLUMN_MAPPING.NAME] || "").trim()
    const email = String(data[COLUMN_MAPPING.EMAIL] || "").trim().toLowerCase()
    const phone = String(data[COLUMN_MAPPING.PHONE] || "").trim()
    const course = String(data[COLUMN_MAPPING.COURSE] || "").trim()
    
    const scoreRaw = String(data[COLUMN_MAPPING.SCORE] || "").trim()
    console.log("[v0] Raw score string:", scoreRaw)
    
    const scoreMatch = scoreRaw.match(/(\d+)\s*\/\s*(\d+)/)
    let score = null
    let totalMarks = null
    
    if (scoreMatch) {
      score = Number.parseFloat(scoreMatch[1])
      totalMarks = Number.parseFloat(scoreMatch[2])
      console.log("[v0] Parsed score and total marks:", { score, totalMarks })
    } else {
      // Fallback: just try to get the first number as score
      const singleScore = scoreRaw.match(/(\d+)/)
      score = singleScore ? Number.parseFloat(singleScore[1]) : null
      console.log("[v0] No total marks found, score only:", score)
    }

    console.log("[v0] Extracted data:", { name, email, phone, course, scoreRaw, score, totalMarks, examId })

    // Validation
    if (!email && !phone) {
      console.log("[v0] Skipping: No email or phone provided")
      return
    }

    if (!name) {
      console.log("[v0] Warning: Name is empty")
    }

    if (score === null || isNaN(score)) {
      console.log("[v0] Warning: Score is null or invalid")
    }

    const examType = getExamType(examId)
    
    if (!examType) {
      console.error("[v0] ERROR: Could not determine exam type for exam_id:", examId)
      return
    }

    const submittedAt = new Date().toISOString()

    if (examType.toLowerCase().includes("entrance")) {
      insertEntranceExamResult({
        name: name || null,
        email: email || null,
        phone: phone || null,
        course: course || null,
        exam: examId,
        score: score,
        total_marks: totalMarks,
        submitted_at: submittedAt,
      })
    } else if (examType.toLowerCase().includes("main")) {
      insertMainExamResult({
        name: name || null,
        email: email || null,
        phone: phone || null,
        course: course || null,
        exam: examId,
        score: score,
        total_marks: totalMarks,
        submitted_at: submittedAt,
      })
    } else if (examType.toLowerCase().includes("internal")) {
      insertInternalExamResult({
        name: name || null,
        email: email || null,
        phone: phone || null,
        course: course || null,
        exam: examId,
        score: score,
        total_marks: totalMarks,
        submitted_at: submittedAt,
      })
    }

    console.log("[v0] Submission processed successfully")
  } catch (error) {
    console.error("[v0] Error in onFormSubmit:", error.toString())
  }
}

/**
 * Insert into entrance_exam_results table
 * CHANGED: Now includes total_marks parameter
 */
function insertEntranceExamResult(record) {
  const url = `${SUPABASE_URL}/rest/v1/entrance_exam_results`

  const payload = {
    name: record.name,
    email: record.email,
    phone: record.phone,
    course: record.course,
    exam: record.exam,
    score: record.score,
    total_marks: record.total_marks,
    submitted_at: record.submitted_at,
  }

  console.log("[v0] Inserting into entrance_exam_results:", JSON.stringify(payload))

  const options = {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
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

    console.log(`[v0] Response code: ${code}`)
    console.log(`[v0] Response text: ${responseText}`)

    if (code === 201 || code === 204) {
      console.log("[v0] ✓ Entrance exam result inserted successfully")
      return true
    } else {
      console.error("[v0] ✗ Insert failed with code:", code)
      console.error("[v0] Error response:", responseText)
      return false
    }
  } catch (error) {
    console.error("[v0] ✗ Error inserting entrance exam result:", error.toString())
    return false
  }
}

/**
 * Insert into main_exam_results table
 * CHANGED: Now includes total_marks parameter
 */
function insertMainExamResult(record) {
  const url = `${SUPABASE_URL}/rest/v1/main_exam_results`

  const payload = {
    name: record.name,
    email: record.email,
    phone: record.phone,
    course: record.course,
    exam: record.exam,
    score: record.score,
    total_marks: record.total_marks,
    submitted_at: record.submitted_at,
  }

  console.log("[v0] Inserting into main_exam_results:", JSON.stringify(payload))

  const options = {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
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

    console.log(`[v0] Response code: ${code}`)
    console.log(`[v0] Response text: ${responseText}`)

    if (code === 201 || code === 204) {
      console.log("[v0] ✓ Main exam result inserted successfully")
      return true
    } else {
      console.error("[v0] ✗ Insert failed with code:", code)
      console.error("[v0] Error response:", responseText)
      return false
    }
  } catch (error) {
    console.error("[v0] ✗ Error inserting main exam result:", error.toString())
    return false
  }
}

/**
 * Insert into internal_exam_results table
 * CHANGED: Now includes total_marks parameter
 */
function insertInternalExamResult(record) {
  const url = `${SUPABASE_URL}/rest/v1/internal_exam_results`

  const payload = {
    name: record.name,
    email: record.email,
    phone: record.phone,
    course: record.course,
    exam: record.exam,
    score: record.score,
    total_marks: record.total_marks,
    submitted_at: record.submitted_at,
  }

  console.log("[v0] Inserting into internal_exam_results:", JSON.stringify(payload))

  const options = {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
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

    console.log(`[v0] Response code: ${code}`)
    console.log(`[v0] Response text: ${responseText}`)

    if (code === 201 || code === 204) {
      console.log("[v0] ✓ Internal exam result inserted successfully")
      return true
    } else {
      console.error("[v0] ✗ Insert failed with code:", code)
      console.error("[v0] Error response:", responseText)
      return false
    }
  } catch (error) {
    console.error("[v0] ✗ Error inserting internal exam result:", error.toString())
    return false
  }
}

/**
 * Debug function - shows the column structure of your form
 * Run this to verify your column mapping
 */
function debugFormStructure() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const lastRow = sheet.getLastRow()

  if (lastRow < 2) {
    console.log("[v0] No data rows found")
    return
  }

  const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0]

  console.log("[v0] === Form Structure Debug ===")
  console.log("[v0] Total columns:", data.length)
  console.log("[v0] Last row number:", lastRow)
  console.log("[v0] ")

  for (let i = 0; i < data.length; i++) {
    const columnLetter = String.fromCharCode(65 + i)
    console.log(`[v0] Column ${i} (${columnLetter}): "${data[i]}"`)
  }

  console.log("[v0] ")
  console.log("[v0] === Update COLUMN_MAPPING if needed ===")
}

/**
 * Added this function to verify trigger is set up correctly
 */
function checkTrigger() {
  console.log("[v0] === Checking Triggers ===")
  const triggers = ScriptApp.getProjectTriggers()
  console.log("[v0] Total triggers found:", triggers.length)
  
  let formSubmitTriggerExists = false
  
  for (let i = 0; i < triggers.length; i++) {
    const trigger = triggers[i]
    console.log(`[v0] Trigger ${i + 1}:`)
    console.log(`[v0]   Event type: ${trigger.getEventType()}`)
    console.log(`[v0]   Handler: ${trigger.getHandlerFunction()}`)
    
    if (trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT && 
        trigger.getHandlerFunction() === "onFormSubmit") {
      formSubmitTriggerExists = true
    }
  }
  
  if (!formSubmitTriggerExists) {
    console.error("[v0] ERROR: onFormSubmit trigger is NOT SET UP!")
    console.log("[v0] Please create the trigger:")
    console.log("[v0] 1. Click Triggers icon (clock)")
    console.log("[v0] 2. Click 'Create new trigger'")
    console.log("[v0] 3. Set to: onFormSubmit → On form submit")
    console.log("[v0] 4. Click Save")
  } else {
    console.log("[v0] ✓ onFormSubmit trigger is correctly set up")
  }
}

/**
 * Added this function to manually test form submission
 */
function testFormSubmission() {
  console.log("[v0] === Manual Test: Simulating Form Submission ===")
  
  const sheet = SpreadsheetApp.getActiveSheet()
  const lastRow = sheet.getLastRow()
  
  if (lastRow < 2) {
    console.error("[v0] ERROR: No data found in sheet. Submit the form first.")
    return
  }
  
  // Get the last row data
  const range = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
  const data = range.getValues()[0]
  
  console.log("[v0] Testing with last row data:")
  for (let i = 0; i < data.length; i++) {
    const col = String.fromCharCode(65 + i)
    console.log(`[v0] Column ${col}: "${data[i]}"`)
  }
  
  // Create a mock event object
  const mockEvent = {
    source: SpreadsheetApp.getActiveSpreadsheet(),
    range: range,
  }
  
  // Call onFormSubmit with mock event
  onFormSubmit(mockEvent)
  
  console.log("[v0] Test submission completed. Check Supabase table for the record.")
}
