"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCourses } from "@/lib/courses"
import { useBatches, formatDate } from "@/lib/batches"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  uploadFileToStorage,
  uploadStudentDocument,
  deleteStudentDocument,
  getStudentDocuments,
} from "@/lib/supabase/documents"
import { getSupabaseClient } from "@/lib/supabase/client"
import { updateStudent } from "@/lib/supabase/students"
import { useState } from "react"

type FileMeta = {
  id?: string
  name: string
  size: number
  type: string
  kind?: "photo" | "study" | "income" | "aadhaar" | "pan"
  dataUrl?: string
  url?: string
  uploadedAt?: string
}

type NoteItem = {
  id: string
  text: string
  by: string
  at: string
}

type RecordItem = {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  course: string
  batchNumber: string
  batchStart: string
  aadhaarNumber?: string
  panNumber?: string
  submittedAt: string
  files: FileMeta[]
  status?: "Active" | "Admitted" | "Pending" | "Alumni" | "Dropped"
  photoUrl?: string
  gender?: string
  dob?: string
  bloodGroup?: string
  addressPermanent?: string
  addressCorrespondence?: string
  guardianName?: string
  guardianContact?: string
  emergencyContact?: string
  altContact?: string
  experienceYears?: number
  previousInstitutes?: string
  skills?: string
  languages?: string
  joinDate?: string
  contractType?: string
  notes?: NoteItem[]
}

const STORAGE_KEY = "sdhub:student-records"

function loadRecords(): RecordItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecordItem[]) : []
  } catch {
    return []
  }
}

function saveRecords(items: RecordItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const recordId = params?.recordId as string

  const [records, setRecords] = React.useState<RecordItem[]>([])
  const [item, setItem] = React.useState<RecordItem | null>(null)
  const [supabaseDocuments, setSupabaseDocuments] = useState<FileMeta[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const courses = useCourses()
  const batches = useBatches()

  React.useEffect(() => {
    const all = loadRecords()
    setRecords(all)
    const foundItem = all.find((r) => r.id === recordId)
    setItem(foundItem || null)

    if (foundItem?.id) {
      loadSupabaseDocuments(foundItem.id)
    }
  }, [recordId])

  React.useEffect(() => {
    if (item === null && recordId) {
      const loadFromSupabase = async () => {
        const supabase = getSupabaseClient()
        const { data: student, error } = await supabase.from("students").select("*").eq("id", recordId).maybeSingle()

        if (error) {
          console.error("[v0] Error fetching student from Supabase:", error)
          return
        }

        if (student) {
          const { data: docs } = await supabase
            .from("student_documents")
            .select("*")
            .eq("student_id", student.id)
            .order("uploaded_at", { ascending: false })

          const recordItem: RecordItem = {
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            qualification: student.qualification || "",
            course: student.course_name || "",
            batchNumber: student.batch_number || "",
            batchStart: student.batch_start || "",
            aadhaarNumber: student.aadhaar_number || "",
            panNumber: student.pan_number || "",
            submittedAt: student.created_at?.split("T")[0] || "",
            files: (docs || []).map((d) => ({
              name: d.name,
              size: d.size,
              type: d.type,
              kind: d.kind,
              url: d.url,
              uploadedAt: d.uploaded_at,
            })),
            status: student.status,
            photoUrl: student.photo_url,
            gender: student.gender,
            dob: student.dob,
            bloodGroup: student.blood_group,
            addressPermanent: student.address_permanent,
            addressCorrespondence: student.address_correspondence,
            guardianName: student.guardian_name,
            guardianContact: student.guardian_contact,
            emergencyContact: student.emergency_contact,
            altContact: student.alt_contact,
            experienceYears: student.experience_years,
            previousInstitutes: student.previous_institutes,
            skills: student.skills,
            joinDate: student.join_date,
            contractType: student.contract_type,
          }
          setItem(recordItem)
          await loadSupabaseDocuments(recordItem.id)
        }
      }
      loadFromSupabase()
    }
  }, [item, recordId])

  const loadSupabaseDocuments = async (studentId: string) => {
    const docs = await getStudentDocuments(studentId)
    setSupabaseDocuments(
      docs.map((doc) => ({
        ...doc,
        id: doc.id,
        uploadedAt: doc.uploaded_at,
      })),
    )
  }

  // local editable fields
  const [form, setForm] = React.useState<RecordItem | null>(null)
  React.useEffect(() => {
    if (item) setForm({ ...item })
  }, [item])

  const activeUpcomingBatchesForCourse = React.useMemo(() => {
    const course = form?.course
    if (!course) return []
    return batches.filter((b) => (b.status === "Active" || b.status === "Upcoming") && b.course === course)
  }, [form?.course, batches])

  const [editing, setEditing] = React.useState(false)
  const [noteText, setNoteText] = React.useState("")
  const [noteBy, setNoteBy] = React.useState("Admin")

  function statusVariant(s?: RecordItem["status"]) {
    switch (s) {
      case "Active":
      case "Admitted":
        return "secondary" as const
      case "Pending":
        return "outline" as const
      case "Alumni":
        return "default" as const
      case "Dropped":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  function addNote() {
    if (!form || !noteText.trim()) return
    const note: NoteItem = {
      id: crypto.randomUUID(),
      text: noteText.trim(),
      by: noteBy || "Admin",
      at: new Date().toISOString(),
    }
    setForm({ ...form, notes: [...(form.notes ?? []), note] })
    setNoteText("")
  }

  const handleFileUpload = async (file: File, kind: FileMeta["kind"]) => {
    if (!form?.id) return

    setUploading(true)
    try {
      const url = await uploadFileToStorage(file, `student-${form.id}`, form.id, kind)

      if (!url) {
        alert("Failed to upload file")
        return
      }

      // Save document metadata to database
      const doc = {
        name: file.name,
        size: file.size,
        type: file.type,
        kind: kind || "study",
        url,
      }

      const savedDoc = await uploadStudentDocument(form.id, doc)

      if (savedDoc) {
        // Reload documents
        await loadSupabaseDocuments(form.id)
        alert("Document uploaded successfully!")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading document")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (docId: string, filePath: string) => {
    if (!confirm("Delete this document?")) return

    try {
      const success = await deleteStudentDocument(docId, filePath)
      if (success && form?.id) {
        await loadSupabaseDocuments(form.id)
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Error deleting document")
    }
  }

  const handleSave = async () => {
    if (!form) return

    setSaving(true)
    try {
      // Save to localStorage
      const next = records.map((r) => (r.id === form.id ? form : r))
      saveRecords(next)
      setRecords(next)

      const supabaseUpdates = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        qualification: form.qualification,
        course_name: form.course,
        batch_number: form.batchNumber,
        batch_id: form.batchNumber,
        aadhaar_number: form.aadhaarNumber,
        pan_number: form.panNumber,
        status: form.status,
        photo_url: form.photoUrl,
        gender: form.gender,
        dob: form.dob,
        blood_group: form.bloodGroup,
        address_permanent: form.addressPermanent,
        address_correspondence: form.addressCorrespondence,
        guardian_name: form.guardianName,
        guardian_contact: form.guardianContact,
        emergency_contact: form.emergencyContact,
        alt_contact: form.altContact,
        experience_years: form.experienceYears,
        previous_institutes: form.previousInstitutes,
        skills: form.skills,
        join_date: form.joinDate,
        contract_type: form.contractType,
      }

      const result = await updateStudent(form.id, supabaseUpdates)
      if (result) {
        console.log("[v0] Student updated successfully in Supabase")
      } else {
        console.error("[v0] Failed to update student in Supabase")
        alert("Error saving to database. Changes saved locally.")
      }

      router.push("/documents")
    } catch (error) {
      console.error("[v0] Save error:", error)
      alert("Error saving. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!item || !form) {
    return (
      <main className="p-6">
        <p className="text-muted-foreground">Student record not found.</p>
        <div className="mt-4">
          <Link href="/documents" className="text-primary underline">
            Back to Documents
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={form.photoUrl || ""} alt={form.name} />
            <AvatarFallback>
              {form.name
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2) || "ST"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-pretty">{form.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={statusVariant(form.status)}>{form.status || "Pending"}</Badge>
              <span>{form.course || "-"}</span>
              <span>•</span>
              <span>{form.batchNumber || "-"}</span>
              <span>•</span>
              <span>{form.email}</span>
              {form.phone ? (
                <>
                  <span>•</span>
                  <span>{form.phone}</span>
                </>
              ) : null}
              {form.altContact ? (
                <>
                  <span>•</span>
                  <span>{form.altContact}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? "Stop Editing" : "Edit Profile"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const target = document.getElementById("documents-section")
              target?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
          >
            Upload Documents
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const target = document.getElementById("assign-section")
              target?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
          >
            Change Batch / Course
          </Button>
          <Button
            variant="outline"
            onClick={() => setForm({ ...form, status: form.status === "Active" ? "Alumni" : "Active" })}
          >
            {form.status === "Active" ? "Mark as Alumni" : "Activate"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") window.print()
            }}
          >
            Export as PDF
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Link href="/documents" className="h-9 px-3 rounded-md border bg-background text-sm inline-flex items-center">
            Back
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Full Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Gender</Label>
                <Input
                  value={form.gender ?? ""}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob ?? ""}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Blood Group</Label>
                <Input
                  value={form.bloodGroup ?? ""}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Address (Permanent)</Label>
                <Input
                  value={form.addressPermanent ?? ""}
                  onChange={(e) => setForm({ ...form, addressPermanent: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Address (Correspondence)</Label>
                <Input
                  value={form.addressCorrespondence ?? ""}
                  onChange={(e) => setForm({ ...form, addressCorrespondence: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Parent / Guardian Name</Label>
                <Input
                  value={form.guardianName ?? ""}
                  onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Parent / Guardian Contact</Label>
                <Input
                  value={form.guardianContact ?? ""}
                  onChange={(e) => setForm({ ...form, guardianContact: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Emergency Contact</Label>
                <Input
                  value={form.emergencyContact ?? ""}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div>
                <Label className="text-sm">Alternate Contact</Label>
                <Input
                  value={form.altContact ?? ""}
                  onChange={(e) => setForm({ ...form, altContact: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="assign-section">
          <CardHeader>
            <CardTitle className="text-base">Academic / Enrollment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Status</Label>
                <Select
                  value={form.status ?? "Pending"}
                  onValueChange={(v: RecordItem["status"]) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    {["Active", "Admitted", "Pending", "Alumni", "Dropped"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Course Enrolled</Label>
                <Select value={form.course} onValueChange={(v) => setForm({ ...form, course: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    {courses.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Assign / Change Batch</Label>
                <Select
                  onValueChange={(batchId) => {
                    const b = activeUpcomingBatchesForCourse.find((x) => x.id === batchId)
                    if (b && form) {
                      setForm({ ...form, batchNumber: b.id, batchStart: b.startDate })
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={form.course ? "Select active/upcoming batch" : "Select course first"} />
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    {activeUpcomingBatchesForCourse.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.id} • {b.name} • {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Batch ID</Label>
                <Input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm">Admission Date</Label>
                <Input
                  type="date"
                  value={form.submittedAt?.slice(0, 10) ?? ""}
                  onChange={(e) => setForm({ ...form, submittedAt: `${e.target.value}T00:00:00` })}
                />
              </div>
              <div>
                <Label className="text-sm">Qualification / Previous Education</Label>
                <Input
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm">Experience (Years)</Label>
                <Input
                  type="number"
                  value={form.experienceYears ?? 0}
                  onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Previous Institutes</Label>
                <Input
                  value={form.previousInstitutes ?? ""}
                  onChange={(e) => setForm({ ...form, previousInstitutes: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">Skills / Expertise / Languages</Label>
                <Input value={form.skills ?? ""} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm">Joining Date</Label>
                <Input
                  type="date"
                  value={form.joinDate ?? ""}
                  onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm">Contract Type</Label>
                <Input
                  value={form.contractType ?? ""}
                  onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="documents-section">
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Add Photo</Label>
              <input
                className="hidden"
                id="up-photo"
                type="file"
                accept="image/*,.pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "photo")
                }}
              />
              <Button variant="secondary" asChild disabled={uploading}>
                <label htmlFor="up-photo">{uploading ? "Uploading..." : "Choose Photo"}</label>
              </Button>
            </div>

            <div>
              <Label className="text-sm">Add Study Docs</Label>
              <input
                className="hidden"
                id="up-study"
                type="file"
                multiple
                accept="image/*,.pdf"
                disabled={uploading}
                onChange={(e) => {
                  const files = e.target.files
                  if (files) {
                    Array.from(files).forEach((file) => handleFileUpload(file, "study"))
                  }
                }}
              />
              <Button variant="secondary" asChild disabled={uploading}>
                <label htmlFor="up-study">{uploading ? "Uploading..." : "Choose Files"}</label>
              </Button>
            </div>

            <div>
              <Label className="text-sm">Add Income Certificate</Label>
              <input
                className="hidden"
                id="up-income"
                type="file"
                accept="image/*,.pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "income")
                }}
              />
              <Button variant="secondary" asChild disabled={uploading}>
                <label htmlFor="up-income">{uploading ? "Uploading..." : "Choose File"}</label>
              </Button>
            </div>

            <div>
              <Label className="text-sm">Add Aadhaar Card</Label>
              <input
                className="hidden"
                id="up-aadhaar"
                type="file"
                accept="image/*,.pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "aadhaar")
                }}
              />
              <Button variant="secondary" asChild disabled={uploading}>
                <label htmlFor="up-aadhaar">{uploading ? "Uploading..." : "Choose File"}</label>
              </Button>
            </div>

            <div>
              <Label className="text-sm">Add PAN Card</Label>
              <input
                className="hidden"
                id="up-pan"
                type="file"
                accept="image/*,.pdf"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "pan")
                }}
              />
              <Button variant="secondary" asChild disabled={uploading}>
                <label htmlFor="up-pan">{uploading ? "Uploading..." : "Choose File"}</label>
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm">Uploaded Files (from Supabase)</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {supabaseDocuments.map((f) => (
                <div key={f.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-semibold">[{f.kind || "file"}]</div>
                      <div className="truncate">{f.name}</div>
                      <div className="text-xs">
                        {new Date(f.uploadedAt || "").toLocaleDateString()} • {(f.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteFile(f.id, f.url || "")}>
                      Delete
                    </Button>
                  </div>
                  {f.url && f.url.trim() ? (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline text-sm hover:no-underline"
                    >
                      View File
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs">File URL unavailable</span>
                  )}
                </div>
              ))}
              {supabaseDocuments.length === 0 && (
                <div className="text-sm text-muted-foreground">No documents uploaded yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Remarks / Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
            <Input
              placeholder="Add a remark about the student"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Input
              className="md:w-44"
              placeholder="By (e.g., Admin)"
              value={noteBy}
              onChange={(e) => setNoteBy(e.target.value)}
            />
            <Button onClick={addNote}>Add Note</Button>
          </div>

          <div className="space-y-2">
            {(form.notes ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No remarks yet.</div>
            ) : (
              (form.notes ?? [])
                .slice()
                .reverse()
                .map((n) => (
                  <div key={n.id} className="border rounded-md p-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(n.at).toLocaleString()} • {n.by}
                    </div>
                    <div className="text-sm">{n.text}</div>
                  </div>
                ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/test-results" className="h-9 px-3 rounded-md border text-sm inline-flex items-center">
              View Exam Results
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
