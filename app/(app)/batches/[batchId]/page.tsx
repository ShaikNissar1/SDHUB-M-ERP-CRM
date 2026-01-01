"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getBatchById,
  updateBatch,
  getBatchSchedule,
  getBatchTeachers,
  assignTeacherToBatch,
  removeTeacherFromBatch,
  addBatchScheduleItem,
  deleteBatchScheduleItem,
} from "@/lib/supabase/batches"
import { getTeachers } from "@/lib/supabase/teachers"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getFilteredAttendance } from "@/lib/supabase/attendance"
import { getTestResultsByEmails } from "@/lib/supabase/test-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Batch, BatchSchedule, BatchTeacher } from "@/lib/supabase/batches"
import type { Teacher, Attendance, TestResult } from "@/lib/supabase/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2Icon, PlusIcon, UserPlusIcon, CalendarIcon, CheckCircle2, UserMinusIcon, AlertCircle, FileTextIcon, BarChart3Icon } from "lucide-react"

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
  const router = useRouter()
  const batchId = params?.batchId as string
  const [batch, setBatch] = useState<Batch | null>(null)

  // Data States
  const [students, setStudents] = useState<Student[]>([])
  const [schedule, setSchedule] = useState<BatchSchedule[]>([])
  const [assignedTeachers, setAssignedTeachers] = useState<BatchTeacher[]>([])
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])

  // UX States
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Student Assignment
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [addingStudent, setAddingStudent] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)

  // Teacher Assignment
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [addingTeacher, setAddingTeacher] = useState(false)
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)

  // Schedule Management
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [newSchedule, setNewSchedule] = useState<Partial<BatchSchedule>>({
    day_of_week: "Monday",
    mode: "Online",
    start_time: "10:00",
    end_time: "11:00",
  })

  // Progress Updates
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressInput, setProgressInput] = useState(0)
  const [moduleInput, setModuleInput] = useState("")

  useEffect(() => {
    async function loadBatchDetails() {
      if (!batchId) return

      try {
        setLoading(true)
        setError(null)

        const batchData = await getBatchById(batchId)
        if (!batchData) {
          setLoading(false)
          setError("Batch not found")
          return
        }
        setBatch(batchData)
        setProgressInput(batchData.syllabus_completion_percentage || 0)
        setModuleInput(batchData.current_module || "")

        // Load parallel data
        const supabase = getSupabaseClient()

        // 1. Students
        const { data: studentsData } = await supabase
          .from("students")
          .select("*")
          .eq("batch_id", batchId)
          .order("submitted_at", { ascending: false })
        const studentsList = (studentsData as Student[]) || []
        setStudents(studentsList)

        // 2. Available Students (for assignment)
        const { data: allStudents } = await supabase
          .from("students")
          .select("*")
          .eq("course_name", batchData.course_name)
          .is("batch_id", null)
          .order("name", { ascending: true })
        if (allStudents) setAvailableStudents(allStudents as Student[])

        // 3. Schedule
        const scheduleData = await getBatchSchedule(batchId)
        setSchedule(scheduleData)

        // 4. Assigned Teachers
        const teachersData = await getBatchTeachers(batchId)
        setAssignedTeachers(teachersData)

        // 5. All Teachers (for assignment dropdown)
        const allTeachersList = await getTeachers()
        setAllTeachers(allTeachersList)

        // 6. Attendance Stats
        const attendance = await getFilteredAttendance(undefined, undefined, batchId, undefined, "student")
        setAttendanceRecords(attendance)

        // 7. Performance Stats (using student emails)
        if (studentsList.length > 0) {
          const results = await getTestResultsByEmails(studentsList.map(s => s.email))
          setTestResults(results)
        }

        // Realtime subscription for students
        const subscription = supabase
          .channel(`batch_${batchId}_students_updates`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "students", filter: `batch_id=eq.${batchId}` },
            (payload) => {
              // Reload students
              supabase
                .from("students")
                .select("*")
                .eq("batch_id", batchId)
                .order("submitted_at", { ascending: false })
                .then(({ data }) => setStudents(data as Student[] || []))
            }
          )
          .subscribe()

        return () => { supabase.removeChannel(subscription) }
      } catch (err) {
        console.error("Error loading batch details:", err)
        setError("Failed to load batch details")
      } finally {
        setLoading(false)
      }
    }

    loadBatchDetails()
  }, [batchId])

  /* --- Calculations --- */

  const enrolledCount = students.length
  const maxCapacity = batch?.max_students || 0
  const availableSeats = Math.max(0, maxCapacity - enrolledCount)
  const capacityPercent = maxCapacity > 0 ? (enrolledCount / maxCapacity) * 100 : 0

  // Attendance Stats
  const studentAttendanceMap = students.reduce((acc, s) => {
    const records = attendanceRecords.filter(r => r.person_id === s.id)
    const present = records.filter(r => r.status === "Present").length
    const total = records.length
    acc[s.id] = total > 0 ? Math.round((present / total) * 100) : null
    return acc
  }, {} as Record<string, number | null>)

  const avgAttendance = (() => {
    const values = Object.values(studentAttendanceMap).filter(v => v !== null) as number[]
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
  })()

  const defaulters = Object.entries(studentAttendanceMap)
    .filter(([_, pc]) => pc !== null && pc < 75)
    .map(([id]) => students.find(s => s.id === id)!)

  // Performance Stats
  const avgScore = testResults.length > 0
    ? Math.round(testResults.reduce((a, b) => a + (b.score || 0), 0) / testResults.length)
    : 0
  const passCount = testResults.filter(r => (r.score || 0) >= 40).length // Assuming 40 is pass
  const passPercentage = testResults.length > 0 ? Math.round((passCount / testResults.length) * 100) : 0

  /* --- Handlers --- */

  const handleAddStudent = async () => {
    if (!selectedStudent || !batch) return

    // Capacity Check
    if (batch.max_students && students.length >= batch.max_students) {
      alert("Batch is full! Cannot add more students.")
      return
    }

    setAddingStudent(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("students").update({ batch_id: batchId }).eq("id", selectedStudent)

      if (!error) {
        const addedStudent = availableStudents.find((s) => s.id === selectedStudent)
        if (addedStudent) {
          setStudents([...students, addedStudent])
          setAvailableStudents(availableStudents.filter((s) => s.id !== selectedStudent))
        }
        setSelectedStudent("")
        setStudentDialogOpen(false)
        router.refresh()
      }
    } catch (err) {
      console.error("Error adding student:", err)
    } finally {
      setAddingStudent(false)
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the batch?")) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("students").update({ batch_id: null }).eq("id", studentId)
      if (!error) {
        const removed = students.find(s => s.id === studentId)
        setStudents(students.filter(s => s.id !== studentId))
        if (removed) setAvailableStudents([...availableStudents, removed])
        router.refresh()
      }
    } catch (err) {
      console.error("Error removing student:", err)
    }
  }

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return
    setAddingTeacher(true)
    try {
      const result = await assignTeacherToBatch(batchId, selectedTeacher)
      if (result) {
        const updatedTeachers = await getBatchTeachers(batchId)
        setAssignedTeachers(updatedTeachers)
        setTeacherDialogOpen(false)
        setSelectedTeacher("")
      }
    } catch (err) {
      console.error("Error assigning teacher:", err)
    } finally {
      setAddingTeacher(false)
    }
  }

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!confirm("Remove this teacher from the batch?")) return
    await removeTeacherFromBatch(batchId, teacherId)
    setAssignedTeachers(assignedTeachers.filter(t => t.teacher_id !== teacherId))
  }

  const handleAddSchedule = async () => {
    if (!newSchedule.day_of_week || !newSchedule.start_time || !newSchedule.end_time) return

    try {
      const item = await addBatchScheduleItem({
        batch_id: batchId,
        day_of_week: newSchedule.day_of_week!,
        start_time: newSchedule.start_time!,
        end_time: newSchedule.end_time!,
        mode: newSchedule.mode as "Online" | "Offline",
        classroom_link: newSchedule.classroom_link
      })
      if (item) {
        setSchedule([...schedule, item])
        setScheduleDialogOpen(false)
        setNewSchedule({ day_of_week: "Monday", mode: "Online", start_time: "10:00", end_time: "11:00" })
      }
    } catch (err) {
      console.error("Error adding schedule:", err)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Delete this schedule item?")) return
    await deleteBatchScheduleItem(id)
    setSchedule(schedule.filter(s => s.id !== id))
  }

  const handleSaveProgress = async () => {
    try {
      await updateBatch(batchId, {
        syllabus_completion_percentage: progressInput,
        current_module: moduleInput
      })
      setBatch((prev: Batch | null) => prev ? ({ ...prev, syllabus_completion_percentage: progressInput, current_module: moduleInput }) : null)
      setEditingProgress(false)
    } catch (err) {
      console.error("Error updating progress:", err)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading batch details...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>
  if (!batch) return <div className="p-8 text-center text-muted-foreground">Batch not found</div>

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "-"

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            {batch.course_name} <span className="text-border">|</span>
            <Badge variant={batch.status === 'Active' ? 'default' : 'secondary'}>{batch.status}</Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back to Batches</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <UserPlusIcon className="h-4 w-4" /> Capacity & Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCount} <span className="text-sm font-normal text-muted-foreground">/ {maxCapacity || "∞"}</span></div>
            <Progress value={capacityPercent} className="h-2 mt-2" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">{availableSeats} seats available</span>
              {maxCapacity > 0 && enrolledCount >= maxCapacity && <Badge variant="destructive" className="h-5 text-[10px]">FULL</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance}% <span className="text-sm font-normal text-muted-foreground">Avg</span></div>
            <div className={`flex items-center gap-1 text-xs mt-2 ${defaulters.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <AlertCircle className="h-3 w-3" />
              <span>{defaulters.length} Defaulters (&lt;75%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" /> Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore} <span className="text-sm font-normal text-muted-foreground">Avg Score</span></div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Pass Rate</span>
              <span className="text-xs font-bold text-green-600">{passPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" /> Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingProgress ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={progressInput}
                    onChange={e => setProgressInput(Number(e.target.value))}
                    max={100} min={0}
                    className="h-8 w-16"
                  />
                  <span className="text-sm">%</span>
                  <Button size="sm" onClick={handleSaveProgress} className="h-8 ml-auto">Save</Button>
                </div>
              </div>
            ) : (
              <div onClick={() => setEditingProgress(true)} className="cursor-pointer group">
                <div className="text-2xl font-bold flex items-center justify-between">
                  {batch.syllabus_completion_percentage || 0}%
                  <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Badge>
                </div>
                <Progress value={batch.syllabus_completion_percentage || 0} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2 truncate">Module: {batch.current_module || "Not set"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
        </TabsList>

        {/* STUDENTS TAB */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Enrolled Students ({students.length})</CardTitle>
              <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlusIcon className="h-4 w-4" /> Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Student to Batch</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select Student</Label>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Search student..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {availableStudents.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No unassigned students in this course</div>
                          ) : (
                            availableStudents.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground font-medium">Tip: Only showing students enrolled in {batch.course_name}.</p>
                    </div>
                    <Button onClick={handleAddStudent} disabled={!selectedStudent || addingStudent}>
                      {addingStudent ? "Adding..." : "Add to Batch"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No students enrolled yet.</TableCell></TableRow>
                  ) : (
                    students.map(s => {
                      const att = studentAttendanceMap[s.id]
                      return (
                        <TableRow key={s.id} className="group">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{s.name}</span>
                              <span className="text-xs text-muted-foreground">{s.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {att !== null ? (
                              <div className="flex items-center gap-2">
                                <Progress value={att} className="h-1.5 w-16" />
                                <Badge variant={att < 75 ? "destructive" : "secondary"} className="h-5">{att}%</Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px] uppercase tracking-wider">No records</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(s.submitted_at)}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
                              <Link href={`/documents/${s.id}`} title="View Folder"><FileTextIcon className="h-4 w-4" /></Link>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveStudent(s.id)} title="Remove from Batch">
                              <UserMinusIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Weekly Schedule</CardTitle>
              <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <PlusIcon className="h-4 w-4" /> Add Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Schedule Slot</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select
                          value={newSchedule.day_of_week}
                          onValueChange={(val) => setNewSchedule({ ...newSchedule, day_of_week: val })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Mode</Label>
                        <Select
                          value={newSchedule.mode}
                          onValueChange={(val) => setNewSchedule({ ...newSchedule, mode: val as any })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input type="time" value={newSchedule.start_time} onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input type="time" value={newSchedule.end_time} onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Classroom / Zoom Link</Label>
                      <Input
                        placeholder="Link or Room No."
                        value={newSchedule.classroom_link || ""}
                        onChange={e => setNewSchedule({ ...newSchedule, classroom_link: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddSchedule}>Add to Schedule</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Location/Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No class schedule defined.</TableCell></TableRow>
                  ) : (
                    schedule.map(item => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-bold underline decoration-primary/30 underline-offset-4">{item.day_of_week}</TableCell>
                        <TableCell className="font-mono text-xs">{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</TableCell>
                        <TableCell><Badge variant="outline" className="font-normal">{item.mode}</Badge></TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.classroom_link ? (
                            item.classroom_link.startsWith('http') ?
                              <a href={item.classroom_link} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                Join Session <Link href={item.classroom_link} target="_blank" />
                              </a> :
                              <span className="flex items-center gap-1 text-muted-foreground"><PlusIcon className="h-3 w-3" /> {item.classroom_link}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSchedule(item.id)}>
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEACHERS TAB */}
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Additional Instructors</CardTitle>
              <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlusIcon className="h-4 w-4" /> Assign teacher
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Teacher</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Teacher</Label>
                      <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose teacher" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {allTeachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAssignTeacher} disabled={!selectedTeacher || addingTeacher}>
                      {addingTeacher ? "Assigning..." : "Assign Teacher"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedTeachers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No additional teachers assigned.</TableCell></TableRow>
                  ) : (
                    assignedTeachers.map(at => (
                      <TableRow key={at.id} className="group">
                        <TableCell className="font-medium text-primary">{at.teacher?.name}</TableCell>
                        <TableCell className="text-muted-foreground">{at.teacher?.email}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(at.assigned_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveTeacher(at.teacher_id)}>
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
