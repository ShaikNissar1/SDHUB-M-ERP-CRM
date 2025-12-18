"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getBatches } from "@/lib/batches"
import { getCourses } from "@/lib/courses"
import { getTeacherById, saveTeacher, addTeacherNote, addTeacherDocument, type TeacherDocument } from "@/lib/teachers"

export default function TeacherProfilePage() {
  const params = useParams()
  const router = useRouter()
  const teacherId =
    typeof params?.teacherId === "string"
      ? params.teacherId
      : Array.isArray(params?.teacherId)
        ? params.teacherId[0]
        : ""

  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [teacher, setTeacher] = useState<any | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])

  const [form, setForm] = useState<any>({})

  useEffect(() => {
    const t = getTeacherById(teacherId)
    setTeacher(t)
    setForm(t)
    setCourses(getCourses())
    setBatches(getBatches())
  }, [teacherId])

  const statusBadgeClass = useMemo(() => {
    const s = (teacher?.status || "").toLowerCase()
    if (s === "active") return "bg-emerald-100 text-emerald-700"
    if (s === "on leave") return "bg-amber-100 text-amber-700"
    return "bg-muted text-muted-foreground"
  }, [teacher])

  const ongoingBatches = useMemo(() => {
    const assignedIds = new Set<string>(
      batches
        .filter((b: any) => (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)))
        .map((b: any) => b.id),
    )
    return batches.filter((b) => assignedIds.has(b.id) && b.status === "Active")
  }, [teacher, batches])

  const totalStudentsTaught = useMemo(() => {
    const assignedIds = new Set<string>(
      batches
        .filter((b: any) => (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)))
        .map((b: any) => b.id),
    )
    return batches.filter((b) => assignedIds.has(b.id)).reduce((sum, b) => sum + (Number(b.totalStudents) || 0), 0)
  }, [teacher, batches])

  function onField<K extends string>(key: K) {
    return (e: any) => setForm((f: any) => ({ ...f, [key]: e?.target ? e.target.value : e }))
  }

  function onSave() {
    setSaving(true)
    try {
      const updated = { ...(teacher || {}), ...(form || {}) }
      saveTeacher(updated)
      setTeacher(updated)
      setEditMode(false)
    } finally {
      setSaving(false)
    }
  }

  async function onUploadDoc(e: React.ChangeEvent<HTMLInputElement>, type: TeacherDocument["type"]) {
    const file = e.target.files?.[0]
    if (!file || !teacher) return
    const url = await readAsDataURL(file)
    const doc: TeacherDocument = {
      id: crypto.randomUUID(),
      type,
      name: file.name,
      url,
      uploadedAt: new Date().toISOString(),
    }
    const updated = addTeacherDocument(teacher.id, doc)
    setTeacher(updated)
    setForm(updated)
  }

  function addNote(text: string) {
    if (!text.trim() || !teacher) return
    const updated = addTeacherNote(teacher.id, text.trim())
    setTeacher(updated)
    setForm(updated)
  }

  function exportProfile() {
    window.print()
  }

  function goAssignBatch() {
    const prefill = teacher?.courseName ? `&prefillCourse=${encodeURIComponent(teacher.courseName)}` : ""
    router.push(`/batches?new=1${prefill}`)
  }

  if (!teacher) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-pretty">Staff Profile</h1>
          <Button variant="outline" asChild>
            <Link href="/teachers">Back</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No teacher found.</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={teacher?.photoUrl || ""} alt={teacher?.name || "Profile"} />
            <AvatarFallback>{getInitials(teacher?.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-pretty">{teacher?.name || "Unnamed"}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{teacher?.role || "Staff"}</span>
              <Badge className={cn("capitalize", statusBadgeClass)}>
                {(teacher?.status || "inactive").replace("_", " ")}
              </Badge>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
              <span>Email: {teacher?.email || teacher?.contact || "-"}</span>
              <span className="hidden md:inline">•</span>
              <span>Phone: {teacher?.phone || "-"}</span>
              {teacher?.altContact ? (
                <>
                  <span className="hidden md:inline">•</span>
                  <span>Alt: {teacher.altContact}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/teachers">Back</Link>
          </Button>
          <Button variant="secondary" onClick={() => setEditMode((v) => !v)}>
            {editMode ? "Cancel" : "Edit Profile"}
          </Button>
          <Button onClick={goAssignBatch}>Assign Batch</Button>
          <Button variant="outline" onClick={exportProfile}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Quick KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Batches (Ongoing)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{ongoingBatches.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Courses Assigned</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {
              Array.from(
                new Set(
                  batches
                    .filter((b: any) =>
                      (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)),
                    )
                    .map((b: any) => b.course),
                ),
              ).length
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{Number(teacher?.rating || 0).toFixed(1)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Students Taught</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalStudentsTaught}</CardContent>
        </Card>
      </section>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name">
            {editMode ? (
              <Input value={form?.name || ""} onChange={onField("name")} />
            ) : (
              <Readonly value={teacher?.name} />
            )}
          </Field>
          <Field label="Gender">
            {editMode ? (
              <Select value={form?.gender || ""} onValueChange={(v) => onField("gender")({ target: { value: v } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Readonly value={teacher?.gender} />
            )}
          </Field>
          <Field label="Date of Birth">
            {editMode ? (
              <Input type="date" value={form?.dob || ""} onChange={onField("dob")} />
            ) : (
              <Readonly value={teacher?.dob} />
            )}
          </Field>
          <Field label="Blood Group (optional)">
            {editMode ? (
              <Input value={form?.bloodGroup || ""} onChange={onField("bloodGroup")} />
            ) : (
              <Readonly value={teacher?.bloodGroup} />
            )}
          </Field>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Address (Permanent)">
              {editMode ? (
                <Textarea value={form?.addrPermanent || ""} onChange={onField("addrPermanent")} />
              ) : (
                <Readonly value={teacher?.addrPermanent} />
              )}
            </Field>
            <Field label="Address (Correspondence)">
              {editMode ? (
                <Textarea value={form?.addrCorrespondence || ""} onChange={onField("addrCorrespondence")} />
              ) : (
                <Readonly value={teacher?.addrCorrespondence} />
              )}
            </Field>
          </div>
          <Field label="Emergency Contact">
            {editMode ? (
              <Input value={form?.emergencyContact || ""} onChange={onField("emergencyContact")} />
            ) : (
              <Readonly value={teacher?.emergencyContact} />
            )}
          </Field>
          <div className="md:col-span-2 flex justify-end">
            {editMode ? (
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Role / Designation">
            {editMode ? (
              <Input value={form?.role || ""} onChange={onField("role")} />
            ) : (
              <Readonly value={teacher?.role} />
            )}
          </Field>
          <Field label="Experience (Years)">
            {editMode ? (
              <Input
                type="number"
                step="0.1"
                value={form?.experienceYears || ""}
                onChange={onField("experienceYears")}
              />
            ) : (
              <Readonly value={teacher?.experienceYears} />
            )}
          </Field>
          <Field label="Previous Institutes">
            {editMode ? (
              <Textarea value={form?.previousInstitutes || ""} onChange={onField("previousInstitutes")} />
            ) : (
              <Readonly value={teacher?.previousInstitutes} />
            )}
          </Field>
          <Field label="Skills / Expertise / Languages">
            {editMode ? (
              <Textarea value={form?.skills || ""} onChange={onField("skills")} />
            ) : (
              <Readonly value={teacher?.skills} />
            )}
          </Field>
          <Field label="Joining Date">
            {editMode ? (
              <Input type="date" value={form?.joiningDate || ""} onChange={onField("joiningDate")} />
            ) : (
              <Readonly value={teacher?.joiningDate} />
            )}
          </Field>
          <Field label="Contract Type">
            {editMode ? (
              <Select
                value={form?.contractType || ""}
                onValueChange={(v) => onField("contractType")({ target: { value: v } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Readonly value={teacher?.contractType} />
            )}
          </Field>

          <div className="md:col-span-2">
            <Label className="mb-2 block">Courses Assigned</Label>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(
                  batches
                    .filter((b: any) =>
                      (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)),
                    )
                    .map((b: any) => b.course),
                ),
              ).map((courseName) => (
                <Badge key={courseName} variant="secondary">
                  {courseName}
                </Badge>
              ))}
              {Array.from(
                new Set(
                  batches
                    .filter((b: any) =>
                      (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)),
                    )
                    .map((b: any) => b.course),
                ),
              ).length === 0 ? (
                <span className="text-sm text-muted-foreground">No courses assigned.</span>
              ) : null}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label className="mb-2 block">Batches Assigned</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches
                  .filter((b: any) =>
                    (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)),
                  )
                  .map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize",
                            b.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : b.status === "Upcoming"
                                ? "bg-muted text-muted-foreground"
                                : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{b.course || "-"}</TableCell>
                      <TableCell>{Number(b.totalStudents) || 0}</TableCell>
                    </TableRow>
                  ))}
                {batches.filter((b: any) =>
                  (b.moduleAssignments || []).some((m: any) => (m.teachers || []).includes(teacher?.name)),
                ).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No batches assigned.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <UploadSlot label="Identity Proof" onChange={(e) => onUploadDoc(e, "identity")} />
            <UploadSlot label="Education Certificates" onChange={(e) => onUploadDoc(e, "education")} />
            <UploadSlot label="Address Proof" onChange={(e) => onUploadDoc(e, "address")} />
            <UploadSlot label="Experience Certificates" onChange={(e) => onUploadDoc(e, "experience")} />
            <UploadSlot label="Photo / ID Card" onChange={(e) => onUploadDoc(e, "photo")} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(teacher?.documents || []).map((d: TeacherDocument) => (
                <TableRow key={d.id}>
                  <TableCell className="capitalize">{d.type}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{new Date(d.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={d.url} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <a href={d.url} download={d.name}>
                        Download
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(teacher?.documents || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No documents uploaded yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes / Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>Notes / Remarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddNote onAdd={addNote} />
          <div className="space-y-3">
            {(teacher?.notes || []).map((n: any) => (
              <div key={n.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{new Date(n.ts).toLocaleString()}</span>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <p className="mt-1 text-sm">{n.text}</p>
              </div>
            ))}
            {(teacher?.notes || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No remarks yet.</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

function Readonly({ value }: { value?: string | number }) {
  return <div className="text-sm">{value ?? "-"}</div>
}

function UploadSlot({
  label,
  onChange,
}: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input type="file" onChange={onChange} />
    </div>
  )
}

function AddNote({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("")
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Add a remark..." value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        onClick={() => {
          onAdd(text)
          setText("")
        }}
      >
        Add
      </Button>
    </div>
  )
}

function getInitials(name?: string) {
  if (!name) return "NA"
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ""
  const last = parts[parts.length - 1]?.[0] || ""
  return (first + last).toUpperCase()
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
