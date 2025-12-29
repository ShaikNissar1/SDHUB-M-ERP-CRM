"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Save, FileSpreadsheet, FileText, Search, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

import { getActiveBatches, getBatches } from "@/lib/supabase/batches"
import { getStudentsByBatch } from "@/lib/supabase/students"
import { getAttendanceByBatch, upsertAttendance } from "@/lib/supabase/attendance"
import type { Batch, Student, Attendance } from "@/lib/supabase/types"

type AttendanceStatus = "Present" | "Absent" | "On Leave"

export default function TeacherAttendanceMark() {
  const { toast } = useToast()

  // Data State
  const [batches, setBatches] = React.useState<Batch[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [loadingBatches, setLoadingBatches] = React.useState(true)
  const [loadingData, setLoadingData] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Selection State
  const [selectedBatchId, setSelectedBatchId] = React.useState<string>("")
  const [date, setDate] = React.useState<string>(new Date().toISOString().split("T")[0])

  // Attendance State
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, AttendanceStatus>>({})
  const [searchQuery, setSearchQuery] = React.useState("")

  // Initial Load: Fetch Batches
  React.useEffect(() => {
    async function fetchBatches() {
      try {
        const data = await getActiveBatches()
        setBatches(data)
        if (data.length > 0) {
          setSelectedBatchId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to load batches", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load classes. Please refresh."
        })
      } finally {
        setLoadingBatches(false)
      }
    }
    fetchBatches()
  }, [])

  // Fetch Students & Attendance when Batch or Date Changes
  React.useEffect(() => {
    if (!selectedBatchId) return

    async function loadClassData() {
      setLoadingData(true)
      try {
        // 1. Fetch Students
        const studentsData = await getStudentsByBatch(selectedBatchId)
        setStudents(studentsData)

        // 2. Fetch Existing Attendance
        const attendanceData = await getAttendanceByBatch(selectedBatchId, date)

        // 3. Map Attendance
        const newMap: Record<string, AttendanceStatus> = {}
        // Default to empty or map existing
        attendanceData.forEach(record => {
          if (record.person_id) {
            newMap[record.person_id] = record.status
          }
        })

        setAttendanceMap(newMap)
      } catch (error) {
        console.error("Failed to load class data", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student list or attendance."
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadClassData()
  }, [selectedBatchId, date])

  // Mark Handler
  const handleMark = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  // Save Handler
  const handleSave = async () => {
    if (!selectedBatchId) return
    setSaving(true)
    try {
      const promises = students.map(student => {
        const status = attendanceMap[student.id]
        if (!status) return null // Don't save if not marked? Or save as Absent by default? Let's save only if marked for now to avoid overwriting with unknowns, or maybe we should enforce all? 
        // For this requirements: "Update Attendance option overwrites".
        // Let's assume only marked ones are saved.

        return upsertAttendance(student.id, date, "student", {
          status,
          person_name: student.name,
          batch_id: selectedBatchId,
          // We can add course_id if available in student/batch
        })
      })

      await Promise.all(promises)

      toast({
        title: "Attendance Saved",
        description: `Successfully updated records for ${date}.`,
      })
    } catch (error) {
      console.error("Save error", error)
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save attendance. Please try again."
      })
    } finally {
      setSaving(false)
    }
  }

  // Export Excel
  const handleExportExcel = () => {
    if (!selectedBatchId) return
    const batchName = batches.find(b => b.id === selectedBatchId)?.name || "Batch"

    const data = students.map(s => ({
      "Roll No": s.id.substring(0, 8), // Just using ID for now
      "Student Name": s.name,
      "Status": attendanceMap[s.id] || "Not Marked",
      "Date": date,
      "Batch": batchName
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance")
    XLSX.writeFile(workbook, `Attendance_${batchName}_${date}.xlsx`)

    toast({ title: "Export Started", description: "Downloading Excel file..." })
  }

  // Export PDF
  const handleExportPDF = () => {
    if (!selectedBatchId) return
    const batchName = batches.find(b => b.id === selectedBatchId)?.name || "Batch"

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(`Attendance Report`, 14, 20)

    doc.setFontSize(12)
    doc.text(`Batch: ${batchName}`, 14, 30)
    doc.text(`Date: ${date}`, 14, 36)

    const tableData = students.map(s => [
      s.name,
      attendanceMap[s.id] || "Not Marked"
    ])

    autoTable(doc, {
      startY: 45,
      head: [["Student Name", "Status"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] } // Green-ish
    })

    doc.save(`Attendance_${batchName}_${date}.pdf`)
    toast({ title: "Export Started", description: "Downloading PDF file..." })
  }

  // Filtered Students
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const presentCount = Object.values(attendanceMap).filter(s => s === "Present").length
  const absentCount = Object.values(attendanceMap).filter(s => s === "Absent").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>Select class and date to manage attendance records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Class / Batch</label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId} disabled={loadingBatches}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select batch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>

              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
                disabled={saving || !selectedBatchId || students.length === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save / Update
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={students.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={students.length === 0}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4 text-sm">
          <Badge variant="outline" className="px-3 py-1 border-green-200 bg-green-50 text-green-700">
            Present: {presentCount}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 border-red-200 bg-red-50 text-red-700">
            Absent: {absentCount}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Total: {students.length}
          </Badge>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading students...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const status = attendanceMap[student.id]
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div>{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </TableCell>
                    <TableCell>
                      {status === "Present" && <Badge className="bg-green-600">Present</Badge>}
                      {status === "Absent" && <Badge variant="destructive">Absent</Badge>}
                      {status === "On Leave" && <Badge variant="warning" className="bg-yellow-500 hover:bg-yellow-600">On Leave</Badge>}
                      {!status && <span className="text-muted-foreground text-sm">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={status === "Present" ? "default" : "outline"}
                          className={status === "Present" ? "bg-green-600 hover:bg-green-700" : ""}
                          onClick={() => handleMark(student.id, "Present")}
                        >
                          P
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "Absent" ? "destructive" : "outline"}
                          onClick={() => handleMark(student.id, "Absent")}
                        >
                          A
                        </Button>
                        <Button
                          size="sm"
                          variant={status === "On Leave" ? "secondary" : "outline"}
                          className={status === "On Leave" ? "bg-yellow-100 text-yellow-900 border-yellow-200" : ""}
                          onClick={() => handleMark(student.id, "On Leave")}
                        >
                          L
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>


    </div>
  )
}

