"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useSupabaseCourses } from "@/lib/courses"
import { formatDate, makeDefaultBatchName } from "@/lib/batches"
import { loadLeads, saveLeads, todayYMDLocal } from "@/lib/leads"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getBatches as getSupabaseBatchesAll, getBatchesByCourse } from "@/lib/supabase/batches"
import type { Batch as SupabaseBatch } from "@/lib/supabase/types"

type FileMeta = {
  name: string
  size: number
  type: string
  kind?: "photo" | "study" | "income" | "aadhaar" | "pan"
  dataUrl?: string
  timestamp?: number
  url?: string
  uploadedAt?: string
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
  status?: string
}

const STORAGE_KEY = "sdhub:student-records"

function formatLocalYMD(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

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
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("student-records:changed"))
    }
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

export default function DocumentsPage() {
  const sp = useSearchParams()

  const defaults = useMemo(
    () => ({
      name: sp.get("name") || "",
      email: sp.get("email") || "",
      phone: sp.get("phone") || "",
      course: sp.get("course") || "",
      open: sp.get("open") === "1",
    }),
    [sp],
  )

  const [name, setName] = useState(defaults.name)
  const [email, setEmail] = useState(defaults.email)
  const [phone, setPhone] = useState(defaults.phone)
  const [qualification, setQualification] = useState("")
  const [course, setCourse] = useState(defaults.course)
  const [batchNumber, setBatchNumber] = useState("")
  const [batchStart, setBatchStart] = useState("")
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [panNumber, setPanNumber] = useState("")

  const [photo, setPhoto] = useState<File | null>(null)
  const [study, setStudy] = useState<FileList | null>(null)
  const [income, setIncome] = useState<File | null>(null)
  const [aadhaar, setAadhaar] = useState<File | null>(null)
  const [pan, setPan] = useState<File | null>(null)

  const [records, setRecords] = useState<RecordItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseBatches, setSupabaseBatches] = useState<SupabaseBatch[]>([])
  const [batchesLoading, setBatchesLoading] = useState(false)
  const [showForm, setShowForm] = useState<boolean>(defaults.open || false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<RecordItem>({
    id: "",
    name: "",
    email: "",
    phone: "",
    qualification: "",
    course: "",
    batchNumber: "",
    batchStart: "",
    aadhaarNumber: "",
    panNumber: "",
    submittedAt: "",
    files: [],
  })
  const [editFiles, setEditFiles] = useState<FileMeta[]>([])
  const [allSupabaseBatches, setAllSupabaseBatches] = useState<SupabaseBatch[]>([])

  const { courses: supabaseCourses = [] } = useSupabaseCourses()
  const courses = supabaseCourses.map((c) => c.name)

  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!supabase) return

    let isMounted = true
    let pollInterval: ReturnType<typeof setInterval> | null = null
    const subscription: any = null

    const loadInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000)

        if (error) {
          console.error("[v0] Error loading initial students:", error)
          return
        }

        if (isMounted) {
          const records = (data || []).map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            qualification: student.qualification,
            course: student.course_name,
            batchNumber: student.batch_number,
            batchStart: student.batch_start || "",
            aadhaarNumber: student.aadhaar_number || "",
            panNumber: student.pan_number || "",
            submittedAt: student.created_at?.split("T")[0] || "",
            files: [],
          }))
          setRecords(records)
        }
      } catch (error) {
        console.error("[v0] Error in loadInitialData:", error)
      }
    }

    loadInitialData()

    // Fallback polling - if real-time fails, poll every 10 seconds
    pollInterval = setInterval(() => {
      loadInitialData()
    }, 10000)

    console.log("[v0] Student records polling started (10s interval)")

    return () => {
      isMounted = false
      if (pollInterval) clearInterval(pollInterval)
      if (subscription) subscription.unsubscribe()
    }
  }, [supabase])

  const initialFilterCourse = (sp.get("filterCourse") || sp.get("course") || "All") as string
  const [filterCourse, setFilterCourse] = useState<string>(initialFilterCourse)
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all")

  useEffect(() => {
    const next = sp.get("filterCourse") || sp.get("course")
    if (next && next !== filterCourse) setFilterCourse(next)
  }, [sp, filterCourse])

  useEffect(() => {
    const fetchAllBatches = async () => {
      try {
        const batches = await getSupabaseBatchesAll()
        setAllSupabaseBatches(batches)
      } catch (error) {
        console.error("[v0] Error fetching all batches:", error)
        setAllSupabaseBatches([])
      }
    }
    fetchAllBatches()
  }, [])

  useEffect(() => {
    const fetchBatches = async () => {
      if (!course) {
        setSupabaseBatches([])
        return
      }

      setBatchesLoading(true)
      try {
        // Find the course ID from supabaseCourses
        const selectedCourse = supabaseCourses.find((c) => c.name === course)
        if (!selectedCourse) {
          setSupabaseBatches([])
          return
        }

        // Fetch batches for this course
        const batches = await getBatchesByCourse(selectedCourse.id)

        // Filter for active and upcoming batches, and format dates
        const filtered = batches.filter((b) => b.status === "Active" || b.status === "Upcoming")
        setSupabaseBatches(filtered)
      } catch (error) {
        console.error("[v0] Error fetching batches:", error)
        setSupabaseBatches([])
      } finally {
        setBatchesLoading(false)
      }
    }

    fetchBatches()
  }, [course, supabaseCourses])

  const activeUpcomingBatchesAdd = useMemo(() => {
    return supabaseBatches.map((b) => ({
      id: b.id,
      name: b.name,
      course: b.course_name,
      startDate: b.start_date,
      endDate: b.end_date,
      status: b.status,
    }))
  }, [supabaseBatches])

  const activeUpcomingBatches = useMemo(() => {
    try {
      return supabaseBatches.filter((b) => b.status === "Active" || b.status === "Upcoming")
    } catch {
      return []
    }
  }, [supabaseBatches])

  const activeUpcomingBatchesEdit = useMemo(() => {
    try {
      return supabaseBatches.filter(
        (b) =>
          (b.status === "Active" || b.status === "Upcoming") && (!editForm.course || b.course_name === editForm.course),
      )
    } catch {
      return []
    }
  }, [editForm.course, supabaseBatches])

  const filteredBatchesBySelectedCourse = useMemo(() => {
    if (filterCourse === "All") {
      return allSupabaseBatches.filter((b) => b.status === "Active" || b.status === "Upcoming")
    }
    return allSupabaseBatches.filter(
      (b) => (b.status === "Active" || b.status === "Upcoming") && b.course_name === filterCourse,
    )
  }, [allSupabaseBatches, filterCourse])

  const courseOptions = ["All", ...(courses ?? [])]

  const filtered = useMemo(() => {
    if (!Array.isArray(records)) {
      return []
    }
    return records.filter((r) => {
      const courseMatch = filterCourse === "All" || r.course === filterCourse
      let batchMatch = true
      if (selectedBatchId !== "all") {
        batchMatch = r.batchNumber === selectedBatchId
      } else {
        batchMatch = r.status !== "Completed"
      }
      return courseMatch && batchMatch
    })
  }, [records, filterCourse, selectedBatchId])

  function onSuggestBatch() {
    if (!batchStart) return
    setBatchNumber(makeDefaultBatchName(course, batchStart))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    console.log("[v0] Document submission started")
    console.log("[v0] Form data:", { name, email, phone, course, batchNumber })

    if (!batchNumber) {
      alert("Please select a batch before submitting.")
      return
    }

    const filesCollected: FileMeta[] = []

    const jobs: Promise<void>[] = []

    if (photo) {
      jobs.push(
        (async () => {
          filesCollected.push({
            name: photo.name,
            size: photo.size,
            type: photo.type,
            kind: "photo",
            dataUrl: await fileToDataUrl(photo),
            timestamp: Date.now(),
          })
        })(),
      )
    }
    if (study && study.length) {
      Array.from(study).forEach((f) =>
        jobs.push(
          (async () => {
            filesCollected.push({
              name: f.name,
              size: f.size,
              type: f.type,
              kind: "study",
              dataUrl: await fileToDataUrl(f),
              timestamp: Date.now(),
            })
          })(),
        ),
      )
    }
    if (income) {
      jobs.push(
        (async () => {
          filesCollected.push({
            name: income.name,
            size: income.size,
            type: income.type,
            kind: "income",
            dataUrl: await fileToDataUrl(income),
            timestamp: Date.now(),
          })
        })(),
      )
    }
    if (aadhaar) {
      jobs.push(
        (async () => {
          filesCollected.push({
            name: aadhaar.name,
            size: aadhaar.size,
            type: aadhaar.type,
            kind: "aadhaar",
            dataUrl: await fileToDataUrl(aadhaar),
            timestamp: Date.now(),
          })
        })(),
      )
    }
    if (pan) {
      jobs.push(
        (async () => {
          filesCollected.push({
            name: pan.name,
            size: pan.size,
            type: pan.type,
            kind: "pan",
            dataUrl: await fileToDataUrl(pan),
            timestamp: Date.now(),
          })
        })(),
      )
    }

    await Promise.all(jobs)

    const today = formatLocalYMD(new Date())

    try {
      if (editId) {
        setRecords((prev) => {
          const next = prev.map((r) =>
            r.id === editId
              ? {
                  ...r,
                  name,
                  email,
                  phone,
                  qualification,
                  course,
                  batchNumber,
                  batchStart,
                  aadhaarNumber,
                  panNumber,
                  files: filesCollected.length ? filesCollected : r.files,
                }
              : r,
          )
          saveRecords(next)
          return next
        })
        alert("Record updated.")
        setEditId(null)
      } else {
        console.log("[v0] Creating student with batchId:", batchNumber)

        const res = await fetch("/api/students/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            qualification,
            course,
            batchNumber,
            batchId: batchNumber || null,
            aadhaarNumber,
            panNumber,
          }),
        })

        const studentData = await res.json()
        console.log("[v0] Student creation response:", studentData)

        if (res.status === 409) {
          console.error("[v0] Duplicate student detected:", studentData)
          alert(`Cannot submit documents: ${studentData.error}`)
          return
        }

        if (!res.ok || !studentData.id) {
          console.error("[v0] Student creation failed:", studentData)
          alert(`Failed to create student record: ${studentData.error || "Unknown error"}`)
          return
        }

        const studentId = studentData.id
        console.log("[v0] Created student with UUID:", studentId)

        console.log("[v0] Starting file uploads, total files:", filesCollected.length)

        for (const file of filesCollected) {
          if (!file.dataUrl) continue

          try {
            const response = await fetch(file.dataUrl)
            const blob = await response.blob()
            const sanitizedName = name.replace(/\s+/g, "_").substring(0, 50)
            const folderPath = `${sanitizedName}_${studentId}/${file.kind}/${file.timestamp}_${file.name}`

            console.log("[v0] Uploading file to storage:", folderPath)

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("student_documents")
              .upload(folderPath, blob, { upsert: true })

            if (uploadError) {
              console.error("[v0] Storage upload error:", uploadError)
              continue
            }

            // Get the public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage.from("student_documents").getPublicUrl(folderPath)

            // Add the URL to the file metadata
            file.url = publicUrlData.publicUrl
            console.log("[v0] Uploaded file with URL:", file.url)
          } catch (error) {
            console.error("[v0] File upload error:", error)
          }
        }

        console.log("[v0] Saving document metadata to database")

        try {
          const docRes = await fetch("/api/students/upload-documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId,
              studentName: name,
              documents: filesCollected.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
                kind: f.kind,
                timestamp: f.timestamp,
                url: f.url || "", // Include the storage URL
              })),
            }),
          })

          if (!docRes.ok) {
            const err = await res.json()
            console.error("[v0] Document metadata save error:", err)
            alert(`Failed to save documents: ${err.error || "Unknown error"}`)
            return
          }

          console.log("[v0] Document metadata saved successfully")

          await new Promise((resolve) => setTimeout(resolve, 500))

          console.log("[v0] Fetching updated student data")

          const { data: updatedStudent, error: studentError } = await supabase
            .from("students")
            .select("*")
            .eq("id", studentId)
            .single()

          if (studentError) {
            console.error("[v0] Error fetching student after upload:", studentError)
            alert("Document saved but could not refresh display")
            return
          }

          console.log("[v0] Updated student data:", updatedStudent)

          if (updatedStudent) {
            const { data: docs, error: docsError } = await supabase
              .from("student_documents")
              .select("*")
              .eq("student_id", studentId)
              .order("uploaded_at", { ascending: false })

            if (docsError) {
              console.error("[v0] Error fetching documents:", docsError)
            }

            console.log("[v0] Fetched documents:", docs?.length || 0)

            const newRecord: RecordItem = {
              id: studentId,
              name: updatedStudent.name,
              email: updatedStudent.email,
              phone: updatedStudent.phone,
              qualification: updatedStudent.qualification || "",
              course: updatedStudent.course_name || "",
              batchNumber: updatedStudent.batch_number || "",
              batchStart: updatedStudent.batch_start || "",
              aadhaarNumber: updatedStudent.aadhaar_number || "",
              panNumber: updatedStudent.pan_number || "",
              submittedAt: updatedStudent.created_at?.split("T")[0] || today,
              files: (docs || []).map((d) => ({
                name: d.name,
                size: d.size,
                type: d.type,
                kind: d.kind,
                url: d.url,
                uploadedAt: d.uploaded_at,
              })),
            }

            console.log("[v0] Adding new record to local state:", newRecord)

            setRecords((prev) => {
              const next = [newRecord, ...prev.filter((r) => r.id !== studentId)]
              saveRecords(next)
              return next
            })

            console.log("[v0] Document submission completed successfully")
            alert("Documents submitted successfully!")
          }

          try {
            const leads = loadLeads()
            const updated = leads.map((l) => {
              if ((email && l.email === email) || (phone && l.phone === phone)) {
                return {
                  ...l,
                  status: "Admitted",
                  history: [
                    ...(l.history ?? []),
                    { at: todayYMDLocal(), action: "Converted to Student (Docs submitted)" },
                  ],
                }
              }
              return l
            })
            saveLeads(updated)
          } catch {
            // no-op
          }

          try {
            const { data: leadToUpdate } = await supabase
              .from("leads")
              .select("id")
              .or(`email.eq.${email},phone.eq.${phone}`)
              .maybeSingle()

            if (leadToUpdate) {
              await supabase
                .from("leads")
                .update({
                  status: "Admitted",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", leadToUpdate.id)
              console.log("[v0] Lead status updated in Supabase:", leadToUpdate.id)
            }
          } catch (error) {
            console.error("[v0] Error updating lead status in Supabase:", error)
          }
        } catch (error) {
          console.error("[v0] Error in document processing:", error)
          alert(`Failed to process documents: ${error instanceof Error ? error.message : "Unknown error"}`)
          return
        }
      }
    } catch (error) {
      console.error("[v0] Error in document upload:", error)
      alert(`Failed to save documents: ${error instanceof Error ? error.message : "Unknown error"}`)
      return
    }

    setPhoto(null)
    setStudy(null)
    setIncome(null)
    setAadhaar(null)
    setPan(null)
    setShowForm(false)
  }

  function loadForEdit(item: RecordItem) {
    setEditId(item.id)
    setName(item.name)
    setEmail(item.email)
    setPhone(item.phone)
    setQualification(item.qualification || "")
    setCourse(item.course)
    setBatchNumber(item.batchNumber)
    setBatchStart(item.batchStart)
    setAadhaarNumber(item.aadhaarNumber || "")
    setPanNumber(item.panNumber || "")
    setPhoto(null)
    setStudy(null)
    setIncome(null)
    setAadhaar(null)
    setPan(null)
    setShowForm(true)
  }

  function deleteRecordById(id: string) {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id)
      try {
        localStorage.setItem("sdhub:student-records", JSON.stringify(next))
        window.dispatchEvent(new Event("student-records:changed"))
      } catch {}
      return next
    })
  }

  return (
    <main className="p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-pretty">Student Records</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Maintain student details, batches, and uploaded documents.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditId(null)
            setName("")
            setEmail("")
            setPhone("")
            setQualification("")
            setCourse("")
            setBatchNumber("")
            setBatchStart("")
            setAadhaarNumber("")
            setPanNumber("")
            setPhoto(null)
            setStudy(null)
            setIncome(null)
            setAadhaar(null)
            setPan(null)
            setShowForm(true)
          }}
          className="h-9"
        >
          + Add Record
        </Button>
      </header>

      {/* Filter Section */}
      <section className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-sm">Filter by Course</Label>
          <select
            className="mt-1 h-9 rounded-md border bg-background px-3 text-sm"
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value)
              setSelectedBatchId("all")
            }}
          >
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-sm">Filter by Batch</Label>
          <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
            <SelectTrigger className="mt-1 w-[200px]">
              <SelectValue placeholder="All batches (Active students)" />
            </SelectTrigger>
            <SelectContent className="z-[1000]">
              <SelectItem value="all">All batches (Active students only)</SelectItem>
              {filteredBatchesBySelectedCourse.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.id}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        b.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "Upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Table */}
      <Card className="rounded-lg border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Records</CardTitle>
          <CardDescription>Recent submissions with batch and files info</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Batch Start</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Files</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.course}</TableCell>
                    <TableCell>{r.batchNumber || "-"}</TableCell>
                    <TableCell>{r.batchStart || "-"}</TableCell>
                    <TableCell>{r.submittedAt}</TableCell>
                    <TableCell>
                      {(r.files?.length ?? 0) ? (
                        <Badge variant="secondary">
                          {r.files?.length ?? 0} {(r.files?.length ?? 0) === 1 ? "file" : "files"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/documents/${encodeURIComponent(r.id)}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteRecordById(r.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Popup Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] h-[min(85vh,calc(100vh-2rem))] overflow-hidden overscroll-contain flex flex-col">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Student Record" : "Add Student Record"}</DialogTitle>
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
                  <Label className="text-sm" htmlFor="qualification">
                    Qualification
                  </Label>
                  <Input
                    id="qualification"
                    className="mt-1"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g., Bachelor's"
                  />
                </div>

                <div>
                  <Label className="text-sm">Course</Label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="z-[1000]">
                      {(courses ?? []).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Assign to Batch</Label>
                  <Select
                    value={batchNumber}
                    onValueChange={(batchId) => {
                      const b = activeUpcomingBatchesAdd.find((x) => x.id === batchId)
                      if (b) {
                        setBatchNumber(b.id)
                        setBatchStart(b.startDate)
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select active/upcoming batch" />
                    </SelectTrigger>
                    <SelectContent className="z-[1000]">
                      {batchesLoading ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading batches...</div>
                      ) : activeUpcomingBatchesAdd.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {course ? "No active/upcoming batches" : "Select a course first"}
                        </div>
                      ) : (
                        activeUpcomingBatchesAdd.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium">{b.id}</div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    b.status === "Active"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {b.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(b.startDate)} → {formatDate(b.endDate)}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm" htmlFor="batchNumber">
                    Batch ID
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="batchNumber"
                      className="mt-1"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                    <Button type="button" variant="secondary" onClick={onSuggestBatch}>
                      Suggest Batch
                    </Button>
                  </div>
                  {batchNumber && <div className="text-xs mt-1">{batchNumber}</div>}
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

                <div>
                  <Label className="text-sm" htmlFor="aadhaarNumber">
                    Aadhaar Number
                  </Label>
                  <Input
                    id="aadhaarNumber"
                    className="mt-1"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm" htmlFor="panNumber">
                    PAN Number
                  </Label>
                  <Input
                    id="panNumber"
                    className="mt-1"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm" htmlFor="photo">
                    Passport Size Photo
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="photo"
                      className="hidden"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    />
                    <Button type="button" variant="secondary" asChild>
                      <label htmlFor="photo">Choose Photo</label>
                    </Button>
                  </div>
                  {photo && <div className="text-xs mt-1">{photo.name}</div>}
                </div>

                <div>
                  <Label className="text-sm" htmlFor="study">
                    Study Certificate / Marksheet
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="study"
                      className="hidden"
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => setStudy(e.target.files)}
                    />
                    <Button type="button" variant="secondary" asChild>
                      <label htmlFor="study">Choose Files</label>
                    </Button>
                  </div>
                  {study && study.length > 0 && <div className="text-xs mt-1">{study.length} file(s) selected</div>}
                </div>

                <div>
                  <Label className="text-sm" htmlFor="income">
                    Income Certificate
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="income"
                      className="hidden"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIncome(e.target.files?.[0] ?? null)}
                    />
                    <Button type="button" variant="secondary" asChild>
                      <label htmlFor="income">Choose File</label>
                    </Button>
                  </div>
                  {income && <div className="text-xs mt-1">{income.name}</div>}
                </div>

                <div>
                  <Label className="text-sm" htmlFor="aadhaar">
                    Aadhaar Card
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="aadhaar"
                      className="hidden"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setAadhaar(e.target.files?.[0] ?? null)}
                    />
                    <Button type="button" variant="secondary" asChild>
                      <label htmlFor="aadhaar">Choose File</label>
                    </Button>
                  </div>
                  {aadhaar && <div className="text-xs mt-1">{aadhaar.name}</div>}
                </div>

                <div>
                  <Label className="text-sm" htmlFor="pan">
                    PAN Card
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="pan"
                      className="hidden"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPan(e.target.files?.[0] ?? null)}
                    />
                    <Button type="button" variant="secondary" asChild>
                      <label htmlFor="pan">Choose File</label>
                    </Button>
                  </div>
                  {pan && <div className="text-xs mt-1">{pan.name}</div>}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sticky bottom-0 bg-background pt-2 border-t">
              <Button type="submit">{editId ? "Save Changes" : "Submit"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setRecords((prev) => {
                      const next = prev.filter((r) => r.id !== editId)
                      saveRecords(next)
                      return next
                    })
                    setShowForm(false)
                    setEditId(null)
                  }}
                >
                  Delete
                </Button>
              )}
              <Link
                href="/enquiries"
                className="h-9 px-3 rounded-md border bg-background text-sm inline-flex items-center"
              >
                Back to Enquiries
              </Link>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
