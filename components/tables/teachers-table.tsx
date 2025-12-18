"use client"

import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Plus, User2, MoreVertical } from "lucide-react"
import { getTeachers, addTeacher, updateTeacher, removeTeacher, type Teacher } from "@/lib/teachers"
import { getBatches } from "@/lib/batches"
import { getCourses } from "@/lib/courses"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Simple CSV export
function exportCsv(filename: string, rows: any[]) {
  const header = Object.keys(rows[0] || {})
  const csv = [header.join(","), ...rows.map((r) => header.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type RatingRange = "all" | "4.5-5" | "4-4.5" | "3-4" | "lt-3"
type StatusFilter = "all" | "active" | "on_leave" | "inactive"

export function TeachersTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [role, setRole] = useState<string>("all")
  const [course, setCourse] = useState<string>("all")
  const [batch, setBatch] = useState<string>("all")
  const [rating, setRating] = useState<RatingRange>("all")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [assignOpenId, setAssignOpenId] = useState<string | null>(null)
  const courses = getCourses?.() || []
  const batches = getBatches?.() || []
  const router = useRouter()

  useEffect(() => {
    const load = () => setTeachers(getTeachers())
    load()
    const onChange = () => load()
    window.addEventListener("teachers:changed", onChange)
    return () => window.removeEventListener("teachers:changed", onChange)
  }, [])

  const roles = useMemo(() => Array.from(new Set(teachers.map((t) => t.role || "Unknown"))), [teachers])
  const courseOptions = useMemo(() => Array.from(new Set(courses.map((c: any) => c.name))).filter(Boolean), [courses])
  const batchOptions = useMemo(() => Array.from(new Set(batches.map((b: any) => b.name))).filter(Boolean), [batches])

  const filtered = teachers.filter((t) => {
    const byRole = role === "all" || (t.role || "Unknown") === role
    const byCourse = course === "all" || (t.courseName || "") === course
    const byBatch = batch === "all" || (t.batchName || "") === batch
    const r = t.rating ?? 0
    const byRating =
      rating === "all" ||
      (rating === "4.5-5" && r >= 4.5) ||
      (rating === "4-4.5" && r >= 4 && r < 4.5) ||
      (rating === "3-4" && r >= 3 && r < 4) ||
      (rating === "lt-3" && r < 3)
    const byStatus = status === "all" || (t.status ?? "active") === status
    return byRole && byCourse && byBatch && byRating && byStatus
  })

  const handleAdd = (form: FormData) => {
    const name = String(form.get("name") || "").trim()
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, "-")
    addTeacher({
      id,
      name,
      role: String(form.get("role") || "Instructor"),
      contact: String(form.get("contact") || ""),
      courseName: String(form.get("course") || ""),
      batchName: String(form.get("batch") || ""),
      rating: Number(form.get("rating") || 0),
      status: String(form.get("status") || "active") as Teacher["status"],
    })
    setAddOpen(false)
  }

  const assignFor = assignOpenId ? teachers.find((t) => t.id === assignOpenId) : null

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full md:w-auto">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courseOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={batch} onValueChange={setBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batchOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger>
              <SelectValue placeholder="Rating Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4.5-5">4.5 – 5.0</SelectItem>
              <SelectItem value="4-4.5">4.0 – 4.5</SelectItem>
              <SelectItem value="3-4">3.0 – 4.0</SelectItem>
              <SelectItem value="lt-3">Below 3.0</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCsv("teachers.csv", filtered)}>
            <Download className="h-4 w-4 mr-2" /> Export Data
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget as HTMLFormElement)
                  handleAdd(fd)
                }}
              >
                <div className="grid gap-1">
                  <Label htmlFor="name">Name</Label>
                  <Input name="name" id="name" required />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="role">Role</Label>
                  <Input name="role" id="role" placeholder="Instructor, HR, Admin..." />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="contact">Contact</Label>
                  <Input name="contact" id="contact" placeholder="email / phone" />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="course">Assigned Course</Label>
                  <Select
                    name="course"
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="course"]')
                      if (input) input.value = v
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="hidden" name="course" />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="batch">Assigned Batch</Label>
                  <Select
                    name="batch"
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="batch"]')
                      if (input) input.value = v
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchOptions.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="hidden" name="batch" />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="rating">Rating</Label>
                  <Input name="rating" id="rating" type="number" min={0} max={5} step={0.1} placeholder="e.g., 4.5" />
                </div>
                <div className="grid gap-1">
                  <Label>Status</Label>
                  <Select
                    name="status"
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="status"]')
                      if (input) input.value = v
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="hidden" name="status" defaultValue="active" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Course / Batch</TableHead>
              <TableHead>Performance Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/40">
                <TableCell className="font-medium flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" /> {t.name}
                </TableCell>
                <TableCell>{t.role || "—"}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="text-left w-full"
                    onClick={() => setAssignOpenId(t.id)}
                    aria-label="Assign Course and Batch"
                    title="Assign Course/Batch"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{t.courseName || "—"}</div>
                      <div className="text-muted-foreground">{t.batchName || ""}</div>
                    </div>
                  </button>
                </TableCell>
                <TableCell>{typeof t.rating === "number" ? `${t.rating.toFixed(1)} / 5` : "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      (t.status ?? "active") === "active" && "bg-emerald-100 text-emerald-700",
                      (t.status ?? "active") === "on_leave" && "bg-amber-100 text-amber-700",
                      (t.status ?? "active") === "inactive" && "bg-slate-200 text-slate-700",
                    )}
                  >
                    {(t.status ?? "active").replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/teachers/${t.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            const prefill = t.courseName ? `&prefillCourse=${encodeURIComponent(t.courseName)}` : ""
                            router.push(`/batches?new=1${prefill}`)
                          }}
                        >
                          Assign Batch
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            setAssignOpenId(t.id)
                          }}
                        >
                          Quick Assign (Course/Batch)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            const trigger = document.getElementById(`edit-trigger-${t.id}`)
                            if (trigger) (trigger as HTMLButtonElement).click()
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => {
                            e.preventDefault()
                            removeTeacher(t.id)
                          }}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* keep existing dialogs but hide their default triggers; we programmatically open them */}
                  <Dialog open={assignOpenId === t.id} onOpenChange={(o) => setAssignOpenId(o ? t.id : null)}>
                    <DialogTrigger asChild>
                      <button className="hidden" aria-hidden="true" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Assign Course/Batch</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3">
                        <div className="grid gap-1">
                          <Label>Course</Label>
                          <Select
                            value={assignFor?.courseName || ""}
                            onValueChange={(v) => {
                              updateTeacher(t.id, { courseName: v })
                              setTeachers((prev) =>
                                prev.map((row) =>
                                  row.id === t.id
                                    ? {
                                        ...row,
                                        courseName: v,
                                        batchName: (() => {
                                          const current = row.batchName || ""
                                          if (!current) return ""
                                          const found = batches.find((x: any) => x.name === current)
                                          return found?.course === v ? current : ""
                                        })(),
                                      }
                                    : row,
                                ),
                              )
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courseOptions.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1">
                          <Label>Batch</Label>
                          <Select
                            value={assignFor?.batchName || ""}
                            onValueChange={(v) => {
                              updateTeacher(t.id, { batchName: v })
                              const batchObj = batches.find((x: any) => x.name === v)
                              setTeachers((prev) =>
                                prev.map((row) =>
                                  row.id === t.id
                                    ? { ...row, batchName: v, courseName: batchObj?.course || row.courseName }
                                    : row,
                                ),
                              )
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch" />
                            </SelectTrigger>
                            <SelectContent>
                              {batchOptions
                                .filter((b) => {
                                  const found = batches.find((x: any) => x.name === b)
                                  if (!assignFor?.courseName) return true
                                  return found?.course === assignFor?.courseName
                                })
                                .map((b) => (
                                  <SelectItem key={b} value={b}>
                                    {b}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setAssignOpenId(null)}>
                            Close
                          </Button>
                          <Button onClick={() => setAssignOpenId(null)}>Save</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button id={`edit-trigger-${t.id}`} className="hidden" aria-hidden="true" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Staff</DialogTitle>
                      </DialogHeader>
                      <form
                        className="grid gap-3"
                        onSubmit={(e) => {
                          e.preventDefault()
                          const fd = new FormData(e.currentTarget as HTMLFormElement)
                          updateTeacher(t.id, {
                            name: String(fd.get("name") || t.name),
                            role: String(fd.get("role") || t.role),
                            contact: String(fd.get("contact") || t.contact),
                            rating: Number(fd.get("rating") || t.rating || 0),
                            status: String(fd.get("status") || t.status || "active") as any,
                          })
                        }}
                      >
                        <div className="grid gap-1">
                          <Label>Name</Label>
                          <Input name="name" defaultValue={t.name} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Role</Label>
                          <Input name="role" defaultValue={t.role} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Contact</Label>
                          <Input name="contact" defaultValue={t.contact} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Rating</Label>
                          <Input name="rating" type="number" min={0} max={5} step={0.1} defaultValue={t.rating ?? ""} />
                        </div>
                        <div className="grid gap-1">
                          <Label>Status</Label>
                          <Select
                            defaultValue={t.status ?? "active"}
                            onValueChange={(v) => updateTeacher(t.id, { status: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="on_leave">On Leave</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="submit">Save</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No staff found for selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
