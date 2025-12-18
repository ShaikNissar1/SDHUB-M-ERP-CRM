// Google Apps Script for Google Form → Supabase Integration
// Paste this into your Google Sheet's Apps Script editor (Extensions > Apps Script)

const SUPABASE_URL = "https://blywpwmmbuxgtqonrnqt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseXdwd21tYnV4Z3Rxb25ybnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDIyNTksImV4cCI6MjA3NjUxODI1OX0.Tomz_x0-luG5g7voLDZoW_oYCzLWFMtmgzAfF4HAwTo";

/**
 * Main function triggered when a form is submitted
 * Column mapping (adjust based on your Google Form):
 * A (0) = Timestamp
 * B (1) = Name
 * C (2) = Email
 * D (3) = Phone
 * E (4) = Course
 * F (5) = Score
 * G (6) = Exam Type (optional)
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const row = e.range.getRow();
    const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    console.log("[v0] Raw form data:", data);

    const timestamp = data[0] || new Date().toISOString();
    const name = String(data[1] || "").trim();
    const email = String(data[2] || "").trim().toLowerCase();
    const phone = String(data[3] || "").trim();
    const course = String(data[4] || "").trim();
    const score = data[5] ? parseFloat(data[5]) : null;
    const examType = String(data[6] || "Entrance").trim();

    console.log("[v0] Extracted data:", { name, email, phone, course, score, examType });

    // Validation
    if (!email && !phone) {
      console.log("[v0] Skipping: No email or phone provided");
      return;
    }

    if (score === null || score === undefined) {
      console.log("[v0] Warning: Score is null or undefined");
    }

    const result = score >= 50 ? "Passed" : "Failed";
    const submittedAt = new Date().toISOString();

    console.log("[v0] Processing submission:", { name, email, phone, course, score, examType, result });

    // Step 1: Insert into test_results table
    insertTestResult({
      name: name || null,
      email: email || null,
      phone: phone || null,
      course: course || null,
      exam: examType,
      score: score,
      submitted_at: submittedAt,
    });

    // Step 2: Update leads table with entrance score and status
    updateLeadWithScore(email, phone, score, result, examType);

    console.log("[v0] Submission processed successfully");
  } catch (error) {
    console.error("[v0] Error in onFormSubmit:", error.toString());
  }
}

/**
 * Insert test result into Supabase test_results table
 */
function insertTestResult(record) {
  const url = `${SUPABASE_URL}/rest/v1/test_results`;
  
  const payload = {
    name: record.name,
    email: record.email,
    phone: record.phone,
    course: record.course,
    exam: record.exam,
    score: record.score !== null ? record.score : null,
    submitted_at: record.submitted_at,
  };

  console.log("[v0] Inserting test result:", payload);

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
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`[v0] Test result insert response code: ${code}`);
    console.log(`[v0] Response: ${responseText}`);
    
    if (code === 201 || code === 204) {
      console.log("[v0] Test result inserted successfully");
      return true;
    } else {
      console.error("[v0] Insert failed with code:", code);
      console.error("[v0] Response:", responseText);
      return false;
    }
  } catch (error) {
    console.error("[v0] Error inserting test result:", error.toString());
    return false;
  }
}

/**
 * Update lead with entrance score and status
 */
function updateLeadWithScore(email, phone, score, result, examType) {
  let filter = "";
  if (email) {
    filter = `email=eq.${encodeURIComponent(email)}`;
  } else if (phone) {
    filter = `phone=eq.${encodeURIComponent(phone)}`;
  }

  if (!filter) {
    console.log("[v0] No email or phone to filter leads");
    return false;
  }

  const url = `${SUPABASE_URL}/rest/v1/leads?${filter}`;
  
  let newStatus = "Pending Final Exam";
  if (result === "Failed") {
    newStatus = "Rejected";
  } else if (examType.toLowerCase().includes("final")) {
    newStatus = "Completed";
  }

  const payload = {
    entrance_score: score !== null ? score : null,
    final_score: result === "Passed" && examType.toLowerCase().includes("final") ? score : null,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  console.log("[v0] Updating lead with:", payload);

  const options = {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`[v0] Lead update response code: ${code}`);
    console.log(`[v0] Response: ${responseText}`);
    
    if (code === 200 || code === 204) {
      console.log("[v0] Lead updated successfully with score:", score, "and status:", newStatus);
      return true;
    } else {
      console.error("[v0] Update failed with code:", code);
      console.error("[v0] Response:", responseText);
      return false;
    }
  } catch (error) {
    console.error("[v0] Error updating lead:", error.toString());
    return false;
  }
}

/**
 * Test function - run this to verify setup
 * Go to Extensions > Apps Script > Run > testIntegration
 */
function testIntegration() {
  console.log("[v0] Starting integration test...");
  
  const testEmail = "test@example.com";
  const testPhone = "9999999999";
  
  const testRecord = {
    name: "Test User",
    email: testEmail,
    phone: testPhone,
    course: "Fullstack",
    exam: "Entrance",
    score: 75,
    submitted_at: new Date().toISOString(),
  };

  console.log("[v0] Testing with record:", testRecord);
  
  // Test 1: Insert test result
  const insertSuccess = insertTestResult(testRecord);
  console.log("[v0] Insert test result:", insertSuccess ? "SUCCESS" : "FAILED");
  
  // Test 2: Update lead with score
  const updateSuccess = updateLeadWithScore(testEmail, testPhone, 75, "Passed", "Entrance");
  console.log("[v0] Update lead with score:", updateSuccess ? "SUCCESS" : "FAILED");
  
  console.log("[v0] Integration test complete - check Supabase for records");
}

/**
 * Debug function - shows the column structure of your form
 * Run this to see what data is in each column
 */
function debugFormStructure() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    console.log("[v0] No data rows found");
    return;
  }
  
  // Get the last row of data
  const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  console.log("[v0] === Form Structure Debug ===");
  console.log("[v0] Total columns:", data.length);
  
  for (let i = 0; i < data.length; i++) {
    console.log(`[v0] Column ${i} (${String.fromCharCode(65 + i)}): ${data[i]}`);
  }
}
