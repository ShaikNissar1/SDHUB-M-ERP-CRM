"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Copy, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  examId: string
  examTitle: string
  formLink?: string
  sheetLink?: string
}

export function ExamMasterSetup({ examId, examTitle, formLink, sheetLink }: Props) {
  const [copied, setCopied] = useState(false)

  const appsScriptSetup = `
// Step 1: Open your Google Sheet
// Step 2: Go to Extensions > Apps Script
// Step 3: Paste the universal Apps Script code
// Step 4: In cell Z1, paste this exam_id:

${examId}

// Step 5: Create a trigger:
// - Click Triggers (clock icon)
// - Create new trigger
// - Function: onFormSubmit
// - Event type: On form submit
// - Save

// That's it! All form submissions will now sync to Supabase automatically.
`

  function copyExamId() {
    navigator.clipboard.writeText(examId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Follow these steps to set up automatic syncing from Google Sheets to Supabase
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Copy Exam ID</CardTitle>
          <CardDescription>This ID links your Google Sheet to the ERP system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted p-3 rounded-md font-mono text-sm break-all border">{examId}</div>
          <Button onClick={copyExamId} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Exam ID"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 2: Open Google Sheet</CardTitle>
          <CardDescription>Open the sheet linked to your Google Form</CardDescription>
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
          <CardTitle className="text-base">Step 3: Add Exam ID to Cell Z1</CardTitle>
          <CardDescription>Paste the exam ID in the hidden column Z1</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. In your Google Sheet, click on cell <Badge variant="outline">Z1</Badge>
          </p>
          <p>2. Paste the exam ID you copied above</p>
          <p>3. Press Enter to save</p>
          <p className="text-xs text-muted-foreground mt-2">
            Column Z is hidden by default, but you can scroll right to find it
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 4: Deploy Apps Script</CardTitle>
          <CardDescription>Add the universal Apps Script to your sheet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. In your Google Sheet, go to <Badge variant="outline">Extensions</Badge> →{" "}
            <Badge variant="outline">Apps Script</Badge>
          </p>
          <p>2. Delete any existing code</p>
          <p>3. Copy the universal Apps Script from the documentation</p>
          <p>
            4. Click <Badge variant="outline">Save</Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 5: Create Trigger</CardTitle>
          <CardDescription>Set up automatic form submission handling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
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
          <p>6. Grant permissions when prompted</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 6: Test Submission</CardTitle>
          <CardDescription>Submit a test response to verify everything works</CardDescription>
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

      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Important:</strong> After submission, check the Supabase exam_responses table to verify data is
          syncing correctly.
        </AlertDescription>
      </Alert>
    </div>
  )
}
