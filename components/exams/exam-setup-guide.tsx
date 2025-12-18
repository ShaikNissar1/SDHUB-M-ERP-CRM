"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  examTitle: string
  formLink?: string
  sheetLink?: string
}

export function ExamSetupGuide({ examTitle, formLink, sheetLink }: Props) {
  const [copied, setCopied] = useState(false)

  const appScriptCode = `function onFormSubmit(e) {
  const sheet = e.source.getActiveSheet();
  const row = e.range.getRow();
  const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Column mapping (0-indexed):
  // Column A (0): Timestamp (auto)
  // Column B (1): Name
  // Column C (2): Email
  // Column D (3): Phone
  // Column E (4): Course
  // Column F (5): Score
  
  const timestamp = data[0] || "";
  const name = String(data[1] || "").trim();
  const email = String(data[2] || "").trim();
  const phone = String(data[3] || "").trim();
  const course = String(data[4] || "").trim();
  const score = data[5] || "";
  
  Logger.log("Form submission - Name: " + name + ", Email: " + email + ", Phone: " + phone + ", Course: " + course + ", Score: " + score);
  
  if (!email && !phone) {
    Logger.log("Skipping: No email or phone provided");
    return;
  }
  
  const scoreNum = parseFloat(score);
  const result = !isNaN(scoreNum) && scoreNum >= 50 ? "Passed" : "Failed";
  
  // Send to webhook with proper field mapping
  const payload = { 
    name: name,
    email: email,
    phone: phone,
    course: course,
    exam: "${examTitle}", 
    score: isNaN(scoreNum) ? null : scoreNum
  };
  
  Logger.log("Sending payload: " + JSON.stringify(payload));
  
  try {
    const response = UrlFetchApp.fetch("${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/exam-submission", {
      method: "POST",
      payload: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      muteHttpExceptions: true
    });
    
    Logger.log("Webhook response: " + response.getResponseCode() + " - " + response.getContentText());
  } catch (err) {
    Logger.log("Error sending webhook: " + err.toString());
  }
}`

  function copyToClipboard() {
    navigator.clipboard.writeText(appScriptCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Follow these steps to set up automatic syncing from Google Sheets to your ERP
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Open Google Sheet</CardTitle>
          <CardDescription>Open the Google Sheet linked to your form</CardDescription>
        </CardHeader>
        <CardContent>
          {sheetLink ? (
            <a href={sheetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Open Sheet →
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No sheet link provided</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 2: Add Apps Script</CardTitle>
          <CardDescription>Go to Extensions → Apps Script and paste the code below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto border">
            <pre className="whitespace-pre-wrap break-words">{appScriptCode}</pre>
          </div>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 3: Set Trigger</CardTitle>
          <CardDescription>Create a trigger for form submissions</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            1. Click the <Badge variant="outline">Triggers</Badge> icon (clock) in Apps Script
          </p>
          <p>
            2. Click <Badge variant="outline">Create new trigger</Badge>
          </p>
          <p>
            3. Select Function: <Badge variant="outline">onFormSubmit</Badge>
          </p>
          <p>
            4. Select Event type: <Badge variant="outline">On form submit</Badge>
          </p>
          <p>
            5. Click <Badge variant="outline">Save</Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 4: Test Submission</CardTitle>
          <CardDescription>Submit a test response through your form</CardDescription>
        </CardHeader>
        <CardContent>
          {formLink ? (
            <a href={formLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Open Form and Submit Test Response →
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No form link provided</p>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>After submission:</strong> Check your <strong>Enquiries</strong> table for the entrance score and{" "}
          <strong>Test Results</strong> page for the full record.
        </AlertDescription>
      </Alert>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">Column Mapping</CardTitle>
          <CardDescription>Make sure your Google Form columns match these indices</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>• Column A (0): Timestamp (auto)</p>
          <p>• Column B (1): Name</p>
          <p>• Column C (2): Email</p>
          <p>• Column D (3): Phone</p>
          <p>• Column E (4): Course</p>
          <p>• Column F (5): Score</p>
          <p className="text-xs text-muted-foreground mt-2">
            If your columns are different, adjust the indices in the Apps Script code above.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
