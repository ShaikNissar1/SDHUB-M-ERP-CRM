"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseCourses } from "@/lib/courses"
import { generateUUID } from "@/lib/utils" // Import generateUUID function

export function AddRecordsDialog() {
  const [open, setOpen] = React.useState(false)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [course, setCourse] = React.useState("")
  const [batchNumber, setBatchNumber] = React.useState("")
  const [batchStart, setBatchStart] = React.useState("")
  const [files, setFiles] = React.useState<FileList | null>(null)

  const { toast } = useToast()
  const { courses: supabaseCourses, loading: coursesLoading } = useSupabaseCourses()
  const courseNames = supabaseCourses.map((c) => c.name)

  function resetForm() {
    setName("")
    setEmail("")
    setPhone("")
    setCourse("")
    setBatchNumber("")
    setBatchStart("")
    setFiles(null)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const KEY = "sdhub:student-records"
      const raw = localStorage.getItem(KEY)
      const list = raw ? (JSON.parse(raw) as any[]) : []

      const norm = (s: string) => (s || "").trim().toLowerCase()
      const normPhone = (s: string) => (s || "").replace(/\D/g, "") // keep only digits for comparison

      const emailExists = !!email && list.some((x) => norm(x?.email || "") === norm(email))
      const phoneExists = !!phone && list.some((x) => normPhone(x?.phone || "") === normPhone(phone))

      if (emailExists || phoneExists) {
        toast({
          title: "Duplicate record",
          description: "A student with this email or phone already exists. No duplicates allowed.",
          variant: "destructive",
        })
        return
      }

      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, "0")
      const d = String(today.getDate()).padStart(2, "0")
      const submittedAt = `${y}-${m}-${d}`

      const item = {
        id: generateUUID(), // Use generateUUID() instead of Date.now() for proper UUID generation
        name,
        email,
        phone,
        qualification: "",
        course,
        batchNumber,
        batchStart,
        submittedAt,
        files: [], // metadata only; file storage not persisted here
      }

      const next = [item, ...list]
      localStorage.setItem(KEY, JSON.stringify(next))
      // notify others (batches, pages) to refresh
      window.dispatchEvent(new CustomEvent("student-records:changed"))

      toast({ title: "Student added", description: "Record saved successfully." })
      setOpen(false)
      resetForm()
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Could not save the student record. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-9">+ Add Record</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] h-[min(85vh,calc(100vh-2rem))] overflow-hidden overscroll-contain flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Student Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 flex-1 flex flex-col min-h-0">
          <div
            className="flex-1 min-h-0 overflow-y-auto pr-3 pe-3 pb-2 space-y-5"
            style={{
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
              scrollbarGutter: "stable both-edges",
            }}
          >
            {/* identity fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Student full name"
                />
              </div>
              <div>
                <Label className="text-sm" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label className="text-sm" htmlFor="phone">
                  Phone
                </Label>
                <Input
                  id="phone"
                  className="mt-1"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <Label className="text-sm" htmlFor="course">
                  Course
                </Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading courses...
                      </SelectItem>
                    ) : courseNames.length > 0 ? (
                      courseNames.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm" htmlFor="batchNumber">
                  Batch Number
                </Label>
                <Input
                  id="batchNumber"
                  className="mt-1"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., 2025-Q4"
                />
              </div>
              <div>
                <Label className="text-sm" htmlFor="batchStart">
                  Batch Start Date
                </Label>
                <Input
                  id="batchStart"
                  className="mt-1"
                  type="date"
                  value={batchStart}
                  onChange={(e) => setBatchStart(e.target.value)}
                />
              </div>
            </div>

            {/* documents uploader */}
            <div>
              <Label className="text-sm" htmlFor="docs">
                Documents
              </Label>
              <input
                id="docs"
                className="mt-1 block w-full text-sm"
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
              />
              {files && files.length > 0 && (
                <ul className="mt-2 text-xs list-disc pl-5">
                  {Array.from(files).map((f) => (
                    <li key={f.name}>
                      {f.name} ({Math.round(f.size / 1024)} KB)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer stays visible */}
          <DialogFooter className="gap-2 bg-background border-t pt-2">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
