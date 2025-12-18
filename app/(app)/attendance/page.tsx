"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, ChevronDown, Save, Eye } from "lucide-react"
import { getStudentsByBatch } from "@/lib/supabase/students"
import { getTeachers } from "@/lib/supabase/teachers"
import { getAttendanceByBatch, upsertAttendance, getAttendanceReport } from "@/lib/supabase/attendance"
import { getCourses } from "@/lib/supabase/courses"
import { getBatches } from "@/lib/supabase/batches"
import type { Student, Teacher, Attendance } from "@/lib/supabase/types"

type AttendanceStatus = "Present" | "Absent" | "On Leave"

type StudentAttendance = Student & {
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
  notes?: string
}

type TeacherAttendance = Teacher & {
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
  remarks?: string
}

type Course = {
  id: string
  name: string
}

type Batch = {
  id: string
  name: string
  course_id: string
  course_name: string
  status: string
}

export default function AttendancePage() {
  const sp = useSearchParams()

  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10))
  const [selectedCourse, setSelectedCourse] = React.useState<string>("All")
  const [selectedBatch, setSelectedBatch] = React.useState<string>("All")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [activeTab, setActiveTab] = React.useState<"students" | "teachers">("students")
  const [includeCompleted, setIncludeCompleted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [unsavedChanges, setUnsavedChanges] = React.useState<Set<string>>(new Set())

  const [courses, setCourses] = React.useState<Course[]>([])
  const [allBatches, setAllBatches] = React.useState<Batch[]>([])
  const [students, setStudents] = React.useState<StudentAttendance[]>([])
  const [teachers, setTeachers] = React.useState<TeacherAttendance[]>([])
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, Attendance>>({})

  React.useEffect(() => {
    async function loadCoursesAndBatches() {
      try {
        const coursesData = await getCourses()
        const batchesData = await getBatches()
        setCourses(coursesData.map((c: any) => ({ id: c.id, name: c.name })))
        setAllBatches(batchesData as Batch[])
      } catch (error) {
        console.error("[v0] Error loading courses and batches:", error)
      }
    }
    loadCoursesAndBatches()
  }, [])

  React.useEffect(() => {
    async function loadData() {
      setLoading(true)
      setUnsavedChanges(new Set())
      try {
        if (selectedBatch !== "All") {
          // Fetch students for selected batch
          const batchStudents = await getStudentsByBatch(selectedBatch)
          console.log("[v0] Fetched students for batch:", batchStudents.length)

          // Fetch attendance records for today
          const attendanceRecords = await getAttendanceByBatch(selectedBatch, date)
          console.log("[v0] Fetched attendance records:", attendanceRecords.length)
          console.log(
            "[v0] Attendance records details:",
            attendanceRecords.map((r) => ({
              person_id: r.person_id,
              person_name: r.person_name,
              status: r.status,
              date: r.date,
            })),
          )

          const attendanceByPersonId: Record<string, Attendance> = {}
          attendanceRecords.forEach((rec) => {
            attendanceByPersonId[rec.person_id] = rec
          })
          setAttendanceMap(attendanceByPersonId)
          console.log("[v0] Attendance map created with", Object.keys(attendanceByPersonId).length, "entries")

          // Map students with attendance data
          const studentsWithAttendance: StudentAttendance[] = batchStudents.map((s) => {
            const att = attendanceByPersonId[s.id]
            const finalStatus = (att?.status as AttendanceStatus) || "Absent"
            console.log(
              "[v0] Student",
              s.name,
              "- attendance found:",
              !!att,
              "- status from DB:",
              att?.status,
              "- final status:",
              finalStatus,
            )
            return {
              ...s,
              status: finalStatus,
              checkIn: att?.check_in,
              checkOut: att?.check_out,
              notes: att?.notes,
            }
          })
          setStudents(studentsWithAttendance)
        } else {
          setStudents([])
        }

        // Fetch all teachers
        const allTeachers = await getTeachers()
        const teachersWithAttendance: TeacherAttendance[] = allTeachers.map((t) => ({
          ...t,
          status: "Absent",
          checkIn: undefined,
          checkOut: undefined,
          remarks: undefined,
        }))
        setTeachers(teachersWithAttendance)
      } catch (error) {
        console.error("[v0] Error loading attendance data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedBatch, date])

  React.useEffect(() => {
    const batchId = sp.get("batchId")
    if (batchId && allBatches.length > 0) {
      const batch = allBatches.find((b) => b.id === batchId)
      if (batch) {
        setSelectedCourse(batch.course_name)
        setSelectedBatch(batch.id)
      }
    }
  }, [sp, allBatches])

  const availableBatches = React.useMemo(() => {
    if (selectedCourse === "All") return allBatches
    return allBatches.filter((b) => b.course_name === selectedCourse)
  }, [selectedCourse, allBatches])

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      const searchMatch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batch_id?.toLowerCase().includes(searchQuery.toLowerCase())
      const statusMatch = includeCompleted || s.status !== "Completed"
      return searchMatch && statusMatch
    })
  }, [students, searchQuery, includeCompleted])

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((t) => {
      const searchMatch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
      return searchMatch
    })
  }, [teachers, searchQuery])

  async function handleMarkAll(status: AttendanceStatus) {
    try {
      if (activeTab === "students") {
        const updatedStudents = filteredStudents.map((s) => ({
          ...s,
          status,
          checkIn: status === "Present" ? "09:00" : undefined,
          checkOut: status === "Present" ? "17:00" : undefined,
        }))

        setStudents((prev) =>
          prev.map((s) => {
            const updated = updatedStudents.find((u) => u.id === s.id)
            if (updated) {
              setUnsavedChanges((prev) => new Set(prev).add(s.id))
              return updated
            }
            return s
          }),
        )
      }
    } catch (error) {
      console.error("[v0] Error marking attendance:", error)
    }
  }

  async function handleStatusChange(studentId: string, status: AttendanceStatus) {
    try {
      // Update local state
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status,
                checkIn: status === "Present" ? "09:00" : undefined,
                checkOut: status === "Present" ? "17:00" : undefined,
              }
            : s,
        ),
      )
      setUnsavedChanges((prev) => new Set(prev).add(studentId))
    } catch (error) {
      console.error("[v0] Error updating attendance:", error)
    }
  }

  async function handleSaveAttendance() {
    setSaving(true)
    try {
      if (activeTab === "students") {
        // Save all unsaved student records
        for (const student of students) {
          if (unsavedChanges.has(student.id)) {
            await upsertAttendance(student.id, date, "student", {
              status: student.status,
              person_name: student.name,
              batch_id: student.batch_id,
              course_id: student.course_id,
              check_in: student.checkIn,
              check_out: student.checkOut,
              notes: student.notes,
            })
          }
        }
      } else if (activeTab === "teachers") {
        // Save all teacher records
        for (const teacher of teachers) {
          if (unsavedChanges.has(teacher.id)) {
            await upsertAttendance(teacher.id, date, "teacher", {
              status: teacher.status,
              person_name: teacher.name,
              check_in: teacher.checkIn,
              check_out: teacher.checkOut,
            })
          }
        }
      }

      // Clear unsaved changes
      setUnsavedChanges(new Set())

      // Reload attendance data to confirm
      if (selectedBatch !== "All") {
        const attendanceRecords = await getAttendanceByBatch(selectedBatch, date)
        const attendanceByPersonId: Record<string, Attendance> = {}
        attendanceRecords.forEach((rec) => {
          attendanceByPersonId[rec.person_id] = rec
        })
        setAttendanceMap(attendanceByPersonId)
      }
    } catch (error) {
      console.error("[v0] Error saving attendance:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadReport(period: "daily" | "weekly" | "monthly") {
    try {
      const csv = await getAttendanceReport(selectedBatch, period, date)
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attendance-${period}-${date}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Error downloading report:", error)
    }
  }

  const studentCount = filteredStudents.length
  const presentCount = filteredStudents.filter((s) => s.status === "Present").length
  const absentCount = filteredStudents.filter((s) => s.status === "Absent").length
  const leaveCount = filteredStudents.filter((s) => s.status === "On Leave").length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <Link href="/attendance/view-attendance">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Eye className="w-4 h-4" />
            View Attendance History
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Batches</SelectItem>
                  {availableBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Search</Label>
              <Input
                placeholder="Search by name or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Checkbox
              id="include-completed"
              checked={includeCompleted}
              onCheckedChange={(checked) => setIncludeCompleted(checked as boolean)}
            />
            <Label htmlFor="include-completed" className="cursor-pointer">
              Include completed students
            </Label>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button onClick={handleSaveAttendance} disabled={unsavedChanges.size === 0 || saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : `Save Attendance${unsavedChanges.size > 0 ? ` (${unsavedChanges.size})` : ""}`}
            </Button>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Download Report
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownloadReport("daily")}>Daily Report</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport("weekly")}>Weekly Report</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport("monthly")}>Monthly Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "students" | "teachers")}>
              <TabsList>
                <TabsTrigger value="students">Students ({studentCount})</TabsTrigger>
                <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "students" | "teachers")}>
            <TabsContent value="students" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  onClick={() => handleMarkAll("Present")}
                  disabled={loading || filteredStudents.length === 0}
                >
                  Mark All Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll("Absent")}
                  disabled={loading || filteredStudents.length === 0}
                >
                  Mark All Absent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll("On Leave")}
                  disabled={loading || filteredStudents.length === 0}
                >
                  Mark All On Leave
                </Button>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found for the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Check-Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mark / Update</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow
                          key={student.id}
                          className={unsavedChanges.has(student.id) ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}
                        >
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.course_name}</TableCell>
                          <TableCell>{student.batch_id}</TableCell>
                          <TableCell>{student.checkIn || "-"}</TableCell>
                          <TableCell>{student.checkOut || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "Present"
                                  ? "default"
                                  : student.status === "Absent"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={student.status}
                              onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{student.notes || "-"}</TableCell>
                          <TableCell>
                            <Link href={`/attendance/student/${student.id}?name=${encodeURIComponent(student.name)}`}>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="teachers" className="space-y-4">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No teachers found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Check-Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mark / Update</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher) => (
                        <TableRow
                          key={teacher.id}
                          className={unsavedChanges.has(teacher.id) ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}
                        >
                          <TableCell className="font-medium">{teacher.name}</TableCell>
                          <TableCell>{teacher.email || "-"}</TableCell>
                          <TableCell>{teacher.phone || "-"}</TableCell>
                          <TableCell>{teacher.checkIn || "-"}</TableCell>
                          <TableCell>{teacher.checkOut || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                teacher.status === "Present"
                                  ? "default"
                                  : teacher.status === "Absent"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {teacher.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={teacher.status}
                              onValueChange={(value) => {
                                setTeachers((prev) =>
                                  prev.map((t) =>
                                    t.id === teacher.id ? { ...t, status: value as AttendanceStatus } : t,
                                  ),
                                )
                                setUnsavedChanges((prev) => new Set(prev).add(teacher.id))
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                                <SelectItem value="On Leave">On Leave</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{teacher.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
