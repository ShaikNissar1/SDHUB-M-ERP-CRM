// Google Apps Script to send form submissions to Supabase
// Add this script to your Google Sheet (Extensions > Apps Script)

const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE"; // Replace with your deployed webhook URL

/**
 * Main function triggered when a form is submitted
 */
function onFormSubmit(e) {
  try {
    console.log("[v0] Form submission received");
    
    // Get the response data
    // We try two ways to get data: from e.response (Form trigger) and e.values (Spreadsheet trigger)
    const formData = {};
    
    if (e.response) {
      // METHOD 1: Using Form Response object (Recommended for Google Form triggers)
      const itemResponses = e.response.getItemResponses();
      itemResponses.forEach((itemResponse) => {
        const question = itemResponse.getItem().getTitle();
        const answer = itemResponse.getResponse();
        
        // Create a key-friendly version of the question (e.g., "Full Name" -> "full_name")
        const key = question.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
        formData[key] = answer;
        formData[question] = answer;
      });
    } else if (e.values) {
      // METHOD 2: Using Spreadsheet values (Fallback for Spreadsheet triggers)
      const sheet = e.source.getActiveSheet();
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      e.values.forEach((value, index) => {
        const question = headers[index];
        if (question) {
          const key = question.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
          formData[key] = value;
          formData[question] = value;
        }
      });
    }
    
    console.log("[v0] Parsed form data:", formData);
    
    // Explicit mapping to webhook payload
    // Adjust the strings in the brackets to match your Google Form question titles EXACTLY
    const payload = {
      timestamp: new Date().toISOString(),
      full_name: 
        formData["full_name"] || 
        formData["Full Name"] || 
        formData["name"] || 
        formData["Name"] || "",
        
      email: 
        formData["email"] || 
        formData["Email"] || 
        formData["email_address"] || 
        formData["Email Address"] || "",
        
      contact: 
        formData["contact"] || 
        formData["Contact"] || 
        formData["phone"] || 
        formData["Phone"] || 
        formData["phone_number"] || 
        formData["Phone Number"] || "",
        
      residence_area: 
        formData["residence_area_locality"] || 
        formData["Residence Area (Locality)"] || 
        formData["area"] || 
        formData["Area"] || 
        formData["residence"] || 
        formData["Residence"] || "",
        
      education_qualification: 
        formData["education_qualification"] || 
        formData["Education Qualification"] || 
        formData["qualification"] || 
        formData["Qualification"] || "",
        
      course_interested: 
        formData["course_interested"] || 
        formData["Course Interested"] || 
        formData["course"] || 
        formData["Course"] || "",
        
      how_did_you_hear: 
        formData["how_did_you_hear_about_us"] || 
        formData["How did you hear about us?"] || 
        formData["source"] || 
        formData["Source"] || "",
        
      age: formData["age"] || formData["Age"] || "",
      gender: formData["gender"] || formData["Gender"] || ""
    };
    
    console.log("[v0] Mapped payload to send:", payload);
    
    // Check if we have minimum required data
    if (!payload.full_name && !payload.email) {
      console.warn("[v0] Skipping: Payload missing critical data (name/email)");
      return;
    }
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log("[v0] Webhook response code:", responseCode);
    console.log("[v0] Webhook response:", responseText);
    
    if (responseCode === 201 || responseCode === 200) {
      console.log("[v0] Successfully sent to ERP system");
    } else {
      console.error("[v0] Failed to send to ERP system:", responseText);
    }
  } catch (error) {
    console.error("[v0] Error in onFormSubmit:", error.toString());
  }
}

/**
 * Debug function - run this to see how your form data is being parsed
 */
function debugFormMapping() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    Logger.log("No data found in sheet. Submit the form once first.");
    return;
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  Logger.log("=== COLUMN MAPPING DEBUG ===");
  headers.forEach((header, i) => {
    const key = header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    Logger.log("Column " + (i+1) + " (" + String.fromCharCode(65 + i) + "): \"" + header + "\" -> Key: \"" + key + "\" | Sample Value: \"" + values[i] + "\"");
  });
}
