"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Search, Eye, MessageSquare, FileText, TrendingUp } from "lucide-react"

const studentData = [
  {
    id: 1,
    name: "Asha Verma",
    course: "Digital Marketing",
    batch: "B001",
    attendance: 94,
    lastTest: 82,
    avgScore: 85,
    performance: "Excellent",
    status: "Active",
  },
  {
    id: 2,
    name: "Rohit Kumar",
    course: "Tally ERP",
    batch: "B002",
    attendance: 87,
    lastTest: 74,
    avgScore: 78,
    performance: "Good",
    status: "Active",
  },
  {
    id: 3,
    name: "Sara Khan",
    course: "Advanced Excel",
    batch: "B003",
    attendance: 91,
    lastTest: 88,
    avgScore: 89,
    performance: "Excellent",
    status: "Active",
  },
  {
    id: 4,
    name: "Vikram Singh",
    course: "Digital Marketing",
    batch: "B001",
    attendance: 78,
    lastTest: 65,
    avgScore: 72,
    performance: "Average",
    status: "Active",
  },
  {
    id: 5,
    name: "Priya Sharma",
    course: "Tally ERP",
    batch: "B002",
    attendance: 96,
    lastTest: 92,
    avgScore: 93,
    performance: "Excellent",
    status: "Active",
  },
]

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [selectedPerformance, setSelectedPerformance] = useState("all")

  const filteredStudents = studentData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch
    const matchesPerformance = selectedPerformance === "all" || student.performance === selectedPerformance
    return matchesSearch && matchesBatch && matchesPerformance
  })

  const getPerformanceBadge = (performance: string) => {
    const colors = {
      Excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Average: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Needs Improvement": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[performance as keyof typeof colors] || colors.Average
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600 dark:text-green-400"
    if (attendance >= 75) return "text-blue-600 dark:text-blue-400"
    if (attendance >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Students</h1>
          <p className="text-muted-foreground mt-2">View and manage student performance across your batches</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(studentData.reduce((acc, s) => acc + s.attendance, 0) / studentData.length)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(studentData.reduce((acc, s) => acc + s.avgScore, 0) / studentData.length)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Test performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Excellent Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.filter((s) => s.performance === "Excellent").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Top students</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="B001">Batch B001</SelectItem>
                <SelectItem value="B002">Batch B002</SelectItem>
                <SelectItem value="B003">Batch B003</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPerformance} onValueChange={setSelectedPerformance}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Average">Average</SelectItem>
                <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Last Test</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No students found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${getAttendanceColor(student.attendance)}`}>
                          {student.attendance}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{student.lastTest}/100</TableCell>
                      <TableCell className="text-center">{student.avgScore}/100</TableCell>
                      <TableCell>
                        <Badge className={getPerformanceBadge(student.performance)}>{student.performance}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="View Performance">
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Send Message">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="View Reports">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
