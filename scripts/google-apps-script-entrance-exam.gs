/***********************
 * Google Form → Supabase entrance_exam_results sync
 * - Properly maps form data to entrance_exam_results table schema
 * - Parses "10 / 70" score strings
 * - Normalizes phone numbers
 * - Handles lead matching and updates
 ***********************/

const SUPABASE_URL = "https://scqprskwruakohdinuhs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjcXByc2t3cnVha29oZGludWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjgyMDgsImV4cCI6MjA3NzMwNDIwOH0.cx61d9hka65dykx-JySVp73cqEk5ITPDnzascUyLros";

const SUPABASE_TEST_TABLE = "entrance_exam_results";
const SUPABASE_LEADS_TABLE = "leads";

/**
 * Main trigger — fired on form submit
 * e is the event object provided by Google Forms trigger
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const row = e.range.getRow();
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const data = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

    // Build header -> index map (lowercased trimmed header keys)
    const headerMap = {};
    for (let i = 0; i < headers.length; i++) {
      const key = String(headers[i] || "").trim().toLowerCase();
      headerMap[key] = i;
    }

    // Helper to read a column by multiple possible header names
    function getByHeaders(...names) {
      for (const n of names) {
        const key = n.toLowerCase();
        if (key in headerMap) return data[headerMap[key]];
      }
      return undefined;
    }

    // Extract using header names that match the sheet you posted
    const rawTimestamp = getByHeaders("timestamp", "time", "submitted at");
    const rawScore = getByHeaders("score", "marks", "result");
    const rawEmail = getByHeaders("email address", "email", "e-mail");
    const rawName = getByHeaders("full name", "name");
    const rawPhone = getByHeaders("contact number", "phone", "mobile", "contact");
    const rawCourse = getByHeaders("course");
    const rawTotalMarks = getByHeaders("total marks", "total", "out of") || 70;
    const rawPassingMarks = getByHeaders("passing marks", "passing", "min marks") || 40;

    // Normalize and parse values
    const timestamp = parseTimestamp(rawTimestamp) || new Date().toISOString();
    const score = parseScore(rawScore); // numeric or null
    const name = trimOrNull(rawName);
    const email = (trimOrNull(rawEmail) || "").toLowerCase();
    const phone = normalizePhone(String(rawPhone || ""));
    const course = trimOrNull(rawCourse);
    const totalMarks = parseInt(String(rawTotalMarks)) || 70;
    const passingMarks = parseInt(String(rawPassingMarks)) || 40;

    Logger.log("[v0] Parsed -> " + JSON.stringify({ 
      timestamp, name, email, phone, course, score, totalMarks, passingMarks 
    }));

    if (!email && !phone) {
      Logger.log("[v0] Skipping insert: no email or phone provided");
      return;
    }

    if (!name) {
      Logger.log("[v0] Skipping insert: name is required");
      return;
    }

    const payload = {
      name: name,
      email: email || null,
      phone: phone || null,
      score: score !== null ? score : null,
      total_marks: totalMarks,
      passing_marks: passingMarks,
      status: score !== null && score >= passingMarks ? "passed" : "pending",
      submitted_at: timestamp
    };

    Logger.log("[v0] INSERT payload to " + SUPABASE_TEST_TABLE + " => " + JSON.stringify(payload));
    const insertOk = insertIntoSupabaseTable(SUPABASE_TEST_TABLE, payload);
    Logger.log("[v0] INSERT result: " + insertOk);

    // Update leads table with entrance score (if exists)
    if (email || phone) {
      const result = score !== null && score >= passingMarks ? "Passed" : "Failed";
      const updateOk = updateLeadWithScore(email, phone, score, result);
      Logger.log("[v0] PATCH leads result: " + updateOk);
    }

  } catch (err) {
    Logger.log("[v0] Error in onFormSubmit: " + err.toString());
  }
}

/* -----------------------
   Helper functions
   ----------------------- */

function parseTimestamp(value) {
  if (!value) return null;
  // If it's already a Date object from Google Sheets, convert:
  if (value instanceof Date) return value.toISOString();
  // Try parsing common formats
  const s = String(value).trim();
  // Google Sheets often stores as "10/23/2025 16:53:31"
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString();
  return null;
}

function parseScore(raw) {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  // common format: "10 / 70" or "10/70"
  const m = s.match(/(\d+)\s*\/\s*(\d+)/);
  if (m) return Number(m[1]);
  // if just a number in string
  const n = Number(s);
  if (!isNaN(n)) return n;
  return null;
}

function trimOrNull(v) {
  if (v === undefined || v === null) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

function normalizePhone(p) {
  if (!p) return null;
  // keep digits and leading +; remove other chars
  const s = String(p).trim();
  const m = s.match(/^(\+)?(.*)$/);
  const core = m ? m[2].replace(/\D/g, "") : s.replace(/\D/g, "");
  if (!core) return null;
  return (m && m[1] ? "+" : "") + core;
}

/* Insert helper — posts one record to given Supabase table with proper error handling */
function insertIntoSupabaseTable(tableName, payload) {
  try {
    const url = SUPABASE_URL + "/rest/v1/" + encodeURIComponent(tableName);
    const options = {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const resp = UrlFetchApp.fetch(url, options);
    const code = resp.getResponseCode();
    const body = resp.getContentText();
    
    Logger.log("[v0] INSERT response code: " + code);
    if (code >= 200 && code < 300) {
      Logger.log("[v0] INSERT successful");
      return true;
    } else {
      Logger.log("[v0] INSERT failed: " + body);
      return false;
    }
  } catch (e) {
    Logger.log("[v0] Error inserting into supabase: " + e.toString());
    return false;
  }
}

/* Update lead with entrance score — uses email OR phone to filter */
function updateLeadWithScore(email, phone, score, result) {
  try {
    let filter = "";
    if (email) filter = "email=eq." + encodeURIComponent(email);
    else if (phone) filter = "phone=eq." + encodeURIComponent(phone);
    else return false;

    const url = SUPABASE_URL + "/rest/v1/" + encodeURIComponent(SUPABASE_LEADS_TABLE) + "?" + filter;
    const newStatus = result === "Failed" ? "Rejected" : "Pending Final Exam";

    const payload = {
      entrance_score: score !== null ? score : null,
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    const options = {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    Logger.log("[v0] PATCH leads filter=" + filter + " payload=" + JSON.stringify(payload));
    const resp = UrlFetchApp.fetch(url, options);
    const code = resp.getResponseCode();
    const body = resp.getContentText();
    
    Logger.log("[v0] PATCH response code: " + code);
    if (code >= 200 && code < 300) {
      Logger.log("[v0] PATCH successful");
      return true;
    } else {
      Logger.log("[v0] PATCH failed: " + body);
      return false;
    }

  } catch (e) {
    Logger.log("[v0] Error updating lead: " + e.toString());
    return false;
  }
}

/* -----------------------
   Debug helper — prints headers + a sample row
   ----------------------- */
function debugFormStructure() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("[v0] No data rows found");
    return;
  }
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const row = sheet.getRange(lastRow, 1, 1, lastCol).getValues()[0];
  Logger.log("[v0] === HEADERS ===");
  for (let i = 0; i < headers.length; i++) {
    Logger.log("[v0] col " + i + ": '" + headers[i] + "' -> value: '" + row[i] + "'");
  }
}
