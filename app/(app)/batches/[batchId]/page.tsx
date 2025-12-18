"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getBatchById } from "@/lib/supabase/batches"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Batch } from "@/lib/supabase/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  course_name: string
  batch_id: string
  submitted_at: string
}

export default function ViewBatchPage() {
  const params = useParams()
  const batchId = params?.batchId as string
  const [batch, setBatch] = useState<Batch | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [addingStudent, setAddingStudent] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    async function loadBatchDetails() {
      if (!batchId) return

      try {
        setLoading(true)
        setError(null)

        const batchData = await getBatchById(batchId)

        if (!batchData) {
          setLoading(false)
          return
        }

        setBatch(batchData)

        const supabase = getSupabaseClient()

        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*")
          .eq("batch_id", batchId)
          .order("submitted_at", { ascending: false })

        if (!studentsError && studentsData) {
          setStudents(studentsData as Student[])
        }

        const { data: allStudents } = await supabase
          .from("students")
          .select("*")
          .eq("course_name", batchData.course_name)
          .is("batch_id", null)
          .order("name", { ascending: true })

        if (allStudents) {
          setAvailableStudents(allStudents as Student[])
        }

        const subscription = supabase
          .channel(`batch_${batchId}_students`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "students",
              filter: `batch_id=eq.${batchId}`,
            },
            () => {
              supabase
                .from("students")
                .select("*")
                .eq("batch_id", batchId)
                .order("submitted_at", { ascending: false })
                .then(({ data }) => {
                  if (data) setStudents(data as Student[])
                })
            },
          )
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error("[v0] Error loading batch details:", err)
        setError(err instanceof Error ? err.message : "Failed to load batch details")
      } finally {
        setLoading(false)
      }
    }

    let isMounted = true
    let unsubscribe: (() => void) | null = null
    let pollInterval: ReturnType<typeof setInterval> | null = null

    loadBatchDetails().then((unsub) => {
      if (isMounted) {
        unsubscribe = unsub || null
      }
    })

    pollInterval = setInterval(() => {
      if (isMounted && !error) {
        loadBatchDetails()
      }
    }, 5000)

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [batchId])

  const handleAddStudent = async () => {
    if (!selectedStudent) return

    setAddingStudent(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("students").update({ batch_id: batchId }).eq("id", selectedStudent)

      if (!error) {
        setStudents([...students, availableStudents.find((s) => s.id === selectedStudent)!])
        setAvailableStudents(availableStudents.filter((s) => s.id !== selectedStudent))
        setSelectedStudent("")
        setDialogOpen(false)
      }
    } catch (err) {
      console.error("[v0] Error adding student to batch:", err)
    } finally {
      setAddingStudent(false)
    }
  }

  if (loading) {
    return (
      <main>
        <p className="text-muted-foreground">Loading batch details...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Make sure your Supabase environment variables are properly configured in the Vars section.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!batch) {
    return (
      <main>
        <p className="text-muted-foreground">Batch not found.</p>
      </main>
    )
  }

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  const durationDays = (startStr: string | undefined | null, endStr: string | undefined | null) => {
    if (!startStr || !endStr) return "-"
    try {
      const start = new Date(startStr).getTime()
      const end = new Date(endStr).getTime()
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
      return `${days} days`
    } catch {
      return "-"
    }
  }

  return (
    <main className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course</CardTitle>
          </CardHeader>
          <CardContent>{batch.course_name || "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trainer</CardTitle>
          </CardHeader>
          <CardContent>{batch.trainer_name || "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{batch.status || "Unknown"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            {formatDate(batch.start_date)} – {formatDate(batch.end_date)} (
            {durationDays(batch.start_date, batch.end_date)})
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Students</CardTitle>
          </CardHeader>
          <CardContent>{students.length}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Students</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">+ Add Student</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Student to Batch</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Student</label>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStudents.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No unassigned students in this course
                            </div>
                          ) : (
                            availableStudents.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} ({s.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStudent} disabled={!selectedStudent || addingStudent}>
                        {addingStudent ? "Adding..." : "Add Student"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{s.email}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>{formatDate(s.submitted_at)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Link href={`/documents/${encodeURIComponent(s.id)}`} className="text-primary underline">
                          View Student
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No students found for this batch.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Module-wise Teacher Assignment</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Assigned Teachers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No module-wise assignment found for this batch.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No schedule available.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Attendance %</CardTitle>
              </CardHeader>
              <CardContent>-</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>-</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Test Score</CardTitle>
              </CardHeader>
              <CardContent>-</CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Batch Files</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Uploads and documents can be surfaced here (PDFs, slides, etc.).
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
