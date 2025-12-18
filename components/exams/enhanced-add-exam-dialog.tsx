"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { extractFormId, extractSheetId } from "@/lib/exam-master"
import { useSuperbaseCourses } from "@/hooks/use-supabase-courses"

type Props = {
  trigger: React.ReactNode
  onCreated?: () => void
}

export function EnhancedAddExamDialog({ trigger, onCreated }: Props) {
  const { courses, loading: coursesLoading } = useSuperbaseCourses()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"entrance_exam" | "main_exam" | "internal_exam">("main_exam")
  const [courseId, setCourseId] = React.useState("")
  const [formUrl, setFormUrl] = React.useState("")
  const [sheetUrl, setSheetUrl] = React.useState("")
  const [formId, setFormId] = React.useState<string | null>(null)
  const [sheetId, setSheetId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFormUrlChange = (url: string) => {
    setFormUrl(url)
    const extracted = extractFormId(url)
    setFormId(extracted)
    if (!extracted && url.length > 0) {
      setError("Invalid Google Form URL")
    } else {
      setError(null)
    }
  }

  const handleSheetUrlChange = (url: string) => {
    setSheetUrl(url)
    const extracted = extractSheetId(url)
    setSheetId(extracted)
    if (!extracted && url.length > 0) {
      setError("Invalid Google Sheet URL")
    } else {
      setError(null)
    }
  }

  async function submit() {
    if (!title.trim() || !type || !formId || !sheetId) {
      setError("Please fill all required fields with valid URLs")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/exam-master/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_title: title.trim(),
          course_id: courseId || null,
          google_form_url: formUrl,
          google_sheet_url: sheetUrl,
          exam_type: type,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create exam")
      }

      setOpen(false)
      setTitle("")
      setType("main_exam")
      setCourseId("")
      setFormUrl("")
      setSheetUrl("")
      setFormId(null)
      setSheetId(null)
      setError(null)
      onCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input placeholder="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Exam Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrance_exam">Entrance Exam</SelectItem>
              <SelectItem value="main_exam">Main Exam</SelectItem>
              <SelectItem value="internal_exam">Internal Exam</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseId} onValueChange={(v) => setCourseId(v)} disabled={coursesLoading}>
            <SelectTrigger>
              <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Course (optional)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <label className="text-sm font-medium">Google Form URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://forms.google.com/forms/d/..."
                value={formUrl}
                onChange={(e) => handleFormUrlChange(e.target.value)}
              />
              {formId && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
            </div>
            {formId && <p className="text-xs text-green-600">Form ID extracted: {formId.slice(0, 10)}...</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Google Sheet URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => handleSheetUrlChange(e.target.value)}
              />
              {sheetId && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
            </div>
            {sheetId && <p className="text-xs text-green-600">Sheet ID extracted: {sheetId.slice(0, 10)}...</p>}
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              {"After creating the exam, you'll receive an exam_id to paste in cell Z1 of your Google Sheet."}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading || !formId || !sheetId}>
              {loading ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
