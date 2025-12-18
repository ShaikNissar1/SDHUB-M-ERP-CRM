"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { addExam } from "@/lib/exams"
import { useCourses } from "@/lib/courses"

type Props = {
  trigger: React.ReactNode
  onCreated?: () => void
}

export function AddExamDialog({ trigger, onCreated }: Props) {
  const courses = useCourses()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"Entrance" | "Main" | "Internal Assessment">("Entrance")
  const [course, setCourse] = React.useState("")
  const [batch, setBatch] = React.useState("")
  const [formLink, setFormLink] = React.useState("")
  const [sheetLink, setSheetLink] = React.useState("")
  const [totalMarks, setTotalMarks] = React.useState<string>("100")
  const [passingMarks, setPassingMarks] = React.useState<string>("50")
  const [durationMinutes, setDurationMinutes] = React.useState<string>("60")
  const createdBy = "Admin" // no auth yet, auto-fill

  function reset() {
    setTitle("")
    setType("Entrance")
    setCourse("")
    setBatch("")
    setFormLink("")
    setSheetLink("")
    setTotalMarks("100")
    setPassingMarks("50")
    setDurationMinutes("60")
  }

  function submit() {
    if (!title.trim() || !type || !formLink.trim()) return
    addExam({
      title: title.trim(),
      type,
      course: course || "",
      batch: batch || "",
      formLink: formLink.trim(),
      sheetLink: sheetLink.trim() || undefined,
      totalMarks: Number(totalMarks) || undefined,
      passingMarks: Number(passingMarks) || undefined,
      durationMinutes: Number(durationMinutes) || undefined,
      createdBy,
      status: "Active",
    })
    setOpen(false)
    reset()
    onCreated?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Exam</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input placeholder="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Exam Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entrance">Entrance</SelectItem>
              <SelectItem value="Main">Main</SelectItem>
              <SelectItem value="Internal Assessment">Internal Assessment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={course} onValueChange={(v) => setCourse(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Course Name" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Batch Name (optional)" value={batch} onChange={(e) => setBatch(e.target.value)} />
          <Input
            placeholder="Google Form URL (public)"
            value={formLink}
            onChange={(e) => setFormLink(e.target.value)}
          />
          <Input
            placeholder="Google Sheet Link (optional)"
            value={sheetLink}
            onChange={(e) => setSheetLink(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Total Marks" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
            <Input placeholder="Passing Marks" value={passingMarks} onChange={(e) => setPassingMarks(e.target.value)} />
            <Input
              placeholder="Duration (mins)"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">Created By: {createdBy}</div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
