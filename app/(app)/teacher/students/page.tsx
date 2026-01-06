"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PerformanceBadge } from "@/components/teacher/performance-badge"
import { useState } from "react"
import { Eye, Users } from "lucide-react"

interface Student {
  id: string
  name: string
  attendance: number
  lastTestScore: number
  performanceStatus: "Good" | "Average" | "At Risk"
}

interface Batch {
  id: string
  name: string
  course: string
  studentCount: number
}

// Mock data - replace with actual data fetching logic
const mockBatches: Batch[] = [
  { id: "batch-1", name: "CS-2024-A", course: "Computer Science Fundamentals", studentCount: 25 },
  { id: "batch-2", name: "CS-2024-B", course: "Data Structures & Algorithms", studentCount: 22 },
  { id: "batch-3", name: "CS-2024-C", course: "Web Development", studentCount: 28 },
]

const mockStudentsData: Record<string, Student[]> = {
  "batch-1": [
    { id: "1", name: "John Doe", attendance: 95, lastTestScore: 88, performanceStatus: "Good" },
    { id: "2", name: "Jane Smith", attendance: 87, lastTestScore: 92, performanceStatus: "Good" },
    { id: "3", name: "Mike Johnson", attendance: 78, lastTestScore: 75, performanceStatus: "Average" },
    { id: "4", name: "Sarah Wilson", attendance: 82, lastTestScore: 68, performanceStatus: "At Risk" },
    { id: "5", name: "David Brown", attendance: 91, lastTestScore: 85, performanceStatus: "Good" },
  ],
  "batch-2": [
    { id: "6", name: "Emma Davis", attendance: 89, lastTestScore: 78, performanceStatus: "Average" },
    { id: "7", name: "Chris Miller", attendance: 94, lastTestScore: 91, performanceStatus: "Good" },
    { id: "8", name: "Lisa Garcia", attendance: 76, lastTestScore: 72, performanceStatus: "At Risk" },
    { id: "9", name: "Tom Anderson", attendance: 88, lastTestScore: 83, performanceStatus: "Good" },
  ],
  "batch-3": [
    { id: "10", name: "Anna Taylor", attendance: 92, lastTestScore: 87, performanceStatus: "Good" },
    { id: "11", name: "Robert Lee", attendance: 85, lastTestScore: 79, performanceStatus: "Average" },
    { id: "12", name: "Maria Rodriguez", attendance: 79, lastTestScore: 65, performanceStatus: "At Risk" },
    { id: "13", name: "James Wilson", attendance: 96, lastTestScore: 94, performanceStatus: "Good" },
  ],
}

export default function TeacherStudentsPage() {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("")

  const selectedBatch = mockBatches.find(b => b.id === selectedBatchId)
  const students = selectedBatchId ? mockStudentsData[selectedBatchId] || [] : []

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600"
    if (attendance >= 80) return "text-blue-600"
    if (attendance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Batch Students</h1>
        <p className="text-muted-foreground mt-1">
          View student performance and details for your assigned batches
        </p>
      </div>

      {/* Batch Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Choose a batch to view students" />
            </SelectTrigger>
            <SelectContent>
              {mockBatches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name} - {batch.course} ({batch.studentCount} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBatch && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Selected:</span>
                <span className="text-sm">{selectedBatch.name} - {selectedBatch.course}</span>
                <span className="text-sm text-muted-foreground">({selectedBatch.studentCount} students)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      {selectedBatchId ? (
        <Card>
          <CardHeader>
            <CardTitle>Students in {selectedBatch?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm">This batch doesn't have any students yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Attendance %</TableHead>
                    <TableHead className="text-center">Last Test Score</TableHead>
                    <TableHead className="text-center">Performance Status</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${getAttendanceColor(student.attendance)}`}>
                          {student.attendance}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {student.lastTestScore}/100
                      </TableCell>
                      <TableCell className="text-center">
                        <PerformanceBadge status={student.performanceStatus} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View Student
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a batch to view students</p>
              <p className="text-sm">Choose a batch from the dropdown above to see student details</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
