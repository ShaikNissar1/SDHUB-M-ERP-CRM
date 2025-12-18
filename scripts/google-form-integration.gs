// Google Apps Script to send form submissions to Supabase
// Add this script to your Google Sheet (Extensions > Apps Script)

const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE"; // Replace with your deployed webhook URL
const FORM_HEADERS = [
  "Timestamp",
  "Email",
  "Full Name",
  "Age",
  "Gender",
  "Contact",
  "Residence Area (Locality)",
  "Education Qualification",
  "Course Interested",
  "How did you hear about us?"
];

function onFormSubmit(e) {
  try {
    console.log("[v0] Form submitted");
    
    // Get the response
    const response = e.response;
    const itemResponses = response.getItemResponses();
    
    // Map responses to object
    const formData = {};
    itemResponses.forEach((itemResponse, index) => {
      const question = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      
      // Create a key-friendly version of the question
      const key = question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      
      formData[key] = answer;
      formData[question] = answer; // Also keep original question as key
    });
    
    console.log("[v0] Form data:", formData);
    
    // Send to webhook
    const payload = {
      timestamp: new Date().toISOString(),
      full_name: formData["full_name"] || formData["Full Name"] || "",
      email: formData["email"] || formData["Email"] || "",
      age: formData["age"] || formData["Age"] || "",
      gender: formData["gender"] || formData["Gender"] || "",
      contact: formData["contact"] || formData["Contact"] || "",
      residence_area: formData["residence_area_locality"] || formData["Residence Area (Locality)"] || "",
      education_qualification: formData["education_qualification"] || formData["Education Qualification"] || "",
      course_interested: formData["course_interested"] || formData["Course Interested"] || "",
      how_did_you_hear: formData["how_did_you_hear_about_us"] || formData["How did you hear about us?"] || ""
    };
    
    console.log("[v0] Payload to send:", payload);
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response_obj = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const responseCode = response_obj.getResponseCode();
    const responseText = response_obj.getContentText();
    
    console.log("[v0] Webhook response code:", responseCode);
    console.log("[v0] Webhook response:", responseText);
    
    if (responseCode === 201 || responseCode === 200) {
      console.log("[v0] Successfully sent to Supabase");
    } else {
      console.error("[v0] Failed to send to Supabase:", responseText);
    }
  } catch (error) {
    console.error("[v0] Error in onFormSubmit:", error);
  }
}

// Test function to verify setup
function testWebhook() {
  const testData = {
    timestamp: new Date().toISOString(),
    full_name: "Test User",
    email: "test@example.com",
    age: "25",
    gender: "Male",
    contact: "9876543210",
    residence_area: "Test Area",
    education_qualification: "Bachelor's",
    course_interested: "Web Development",
    how_did_you_hear: "Google"
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(testData),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    console.log("Test response:", response.getContentText());
  } catch (error) {
    console.error("Test failed:", error);
  }
}
