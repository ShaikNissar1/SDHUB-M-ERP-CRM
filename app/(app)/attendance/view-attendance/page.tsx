"use client"

import { useState, useMemo } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Filter } from "lucide-react"
import { getFilteredAttendance } from "@/lib/supabase/attendance"
import { getCourses } from "@/lib/supabase/courses"
import { getBatches } from "@/lib/supabase/batches"
import type { Attendance } from "@/lib/supabase/types"

export default function ViewAttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])

  // Filter states
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Load courses and batches on mount
  React.useEffect(() => {
    const loadInitialData = async () => {
      const [coursesData, batchesData] = await Promise.all([getCourses(), getBatches()])
      setCourses(coursesData)
      setBatches(batchesData)
    }
    loadInitialData()
  }, [])

  const filteredBatches = useMemo(() => {
    if (selectedCourse === "all") {
      return batches
    }
    return batches.filter((batch) => batch.course_id === selectedCourse)
  }, [batches, selectedCourse])

  React.useEffect(() => {
    // When course changes, reset batch to "all"
    setSelectedBatch("all")
  }, [selectedCourse])

  // Apply filters and fetch attendance
  const handleApplyFilters = async () => {
    setLoading(true)
    try {
      console.log("[v0] Applying filters:", {
        dateFrom,
        dateTo,
        batchId: selectedBatch === "all" ? undefined : selectedBatch,
        courseId: selectedCourse === "all" ? undefined : selectedCourse,
      })

      const data = await getFilteredAttendance(
        dateFrom || undefined,
        dateTo || undefined,
        selectedBatch === "all" ? undefined : selectedBatch,
        selectedCourse === "all" ? undefined : selectedCourse,
        "student",
      )

      console.log("[v0] Raw attendance data returned:", {
        totalRecords: data.length,
        uniqueStudents: new Set(data.map((a) => a.person_id)).size,
        records: data,
      })

      setAttendance(data)
    } catch (error) {
      console.error("[v0] Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendance = useMemo(() => {
    let filtered = [...attendance]

    if (selectedStudent) {
      filtered = filtered.filter(
        (a) =>
          a.person_id?.toString().includes(selectedStudent) ||
          a.person_name?.toLowerCase().includes(selectedStudent.toLowerCase()),
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((a) => a.status === selectedStatus)
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    return filtered
  }, [attendance, selectedStudent, selectedStatus, sortOrder])

  const handleExportCSV = () => {
    if (filteredAttendance.length === 0) {
      alert("No data to export")
      return
    }

    const headers = [
      "Date",
      "Person Name",
      "Person ID",
      "Batch ID",
      "Course ID",
      "Status",
      "Check-In",
      "Check-Out",
      "Notes",
    ]
    const rows = filteredAttendance.map((a) => [
      a.date,
      a.person_name,
      a.person_id,
      a.batch_id,
      a.course_id,
      a.status,
      a.check_in || "-",
      a.check_out || "-",
      a.notes || "-",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `attendance-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const uniqueStudents = Array.from(new Map(filteredAttendance.map((a) => [a.person_id, a])).values())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">View Attendance</h1>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
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
                  <SelectItem value="all">All Batches</SelectItem>
                  {filteredBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <Label className="text-sm mb-2 block">To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Search Student</Label>
              <Input
                placeholder="Search by name or ID..."
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleApplyFilters} disabled={loading}>
              {loading ? "Loading..." : "Apply Filters"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBatch("all")
                setSelectedCourse("all")
                setDateFrom("")
                setDateTo("")
                setSelectedStudent("")
                setSelectedStatus("all")
                setAttendance([])
              }}
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={filteredAttendance.length === 0}
              className="gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Label className="text-sm">Sort by Date:</Label>
              <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as "asc" | "desc")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {attendance.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAttendance.length} of {attendance.length} attendance records | {uniqueStudents.length}{" "}
              unique student(s)
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          {attendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found. Select filters and click "Apply Filters" to view data.
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No records match the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Person Name</TableHead>
                    <TableHead>Person ID</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>{record.person_name || "-"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.person_id || "-"}</TableCell>
                      <TableCell>{record.batch_id || "-"}</TableCell>
                      <TableCell>{record.course_id || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "Present"
                              ? "default"
                              : record.status === "Absent"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.check_in || "-"}</TableCell>
                      <TableCell>{record.check_out || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
