"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Calendar, Users, Eye } from "lucide-react"

interface Test {
  id: string
  name: string
  batchName: string
  batchId: string
  date: string
  maxMarks: number
  status: "Scheduled" | "Completed" | "Grading"
  totalStudents: number
  gradedCount: number
}

interface StudentMark {
  id: string
  studentName: string
  rollNumber: string
  marks?: number
  isGraded: boolean
}

export default function TeacherTestsPage() {
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [studentMarks, setStudentMarks] = useState<Record<string, number>>({})

  // Mock tests data - replace with actual data fetching
  const tests: Test[] = [
    {
      id: "1",
      name: "Data Structures Mid-Term",
      batchName: "CS-2024-A",
      batchId: "batch-1",
      date: "2024-01-15",
      maxMarks: 100,
      status: "Completed",
      totalStudents: 25,
      gradedCount: 18,
    },
    {
      id: "2",
      name: "Algorithm Analysis Quiz",
      batchName: "CS-2024-B",
      batchId: "batch-2",
      date: "2024-01-18",
      maxMarks: 50,
      status: "Grading",
      totalStudents: 22,
      gradedCount: 15,
    },
    {
      id: "3",
      name: "Database Design Final",
      batchName: "CS-2024-C",
      batchId: "batch-3",
      date: "2024-01-20",
      maxMarks: 100,
      status: "Scheduled",
      totalStudents: 28,
      gradedCount: 0,
    },
    {
      id: "4",
      name: "Web Development Practical",
      batchName: "CS-2024-A",
      batchId: "batch-1",
      date: "2024-01-25",
      maxMarks: 75,
      status: "Scheduled",
      totalStudents: 25,
      gradedCount: 0,
    },
  ]

  // Mock student marks data - replace with actual data fetching
  const mockStudentMarks: Record<string, StudentMark[]> = {
    "1": [
      { id: "s1", studentName: "John Doe", rollNumber: "CS001", marks: 85, isGraded: true },
      { id: "s2", studentName: "Jane Smith", rollNumber: "CS002", marks: 78, isGraded: true },
      { id: "s3", studentName: "Mike Johnson", rollNumber: "CS003", marks: 92, isGraded: true },
      { id: "s4", studentName: "Sarah Wilson", rollNumber: "CS004", isGraded: false },
      { id: "s5", studentName: "David Brown", rollNumber: "CS005", marks: 88, isGraded: true },
    ],
    "2": [
      { id: "s6", studentName: "Emma Davis", rollNumber: "CS006", isGraded: false },
      { id: "s7", studentName: "Chris Miller", rollNumber: "CS007", marks: 42, isGraded: true },
      { id: "s8", studentName: "Lisa Garcia", rollNumber: "CS008", isGraded: false },
      { id: "s9", studentName: "Tom Anderson", rollNumber: "CS009", marks: 48, isGraded: true },
    ],
  }

  const handleMarksChange = (studentId: string, marks: string) => {
    const marksValue = marks === "" ? undefined : parseInt(marks)
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: marksValue || 0
    }))
  }

  const handleSaveMarks = (studentId: string) => {
    // UI only - no actual save logic
    const marks = studentMarks[studentId]
    console.log("Saving marks for student:", studentId, "marks:", marks)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "Scheduled": "outline",
      "Completed": "secondary",
      "Grading": "default",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    )
  }

  const currentStudents = selectedTest ? mockStudentMarks[selectedTest.id] || [] : []

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Tests & Results</h1>
        <p className="text-muted-foreground mt-1">
          Enter marks for completed tests
        </p>
      </div>

      {selectedTest ? (
        // Marks Entry View
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedTest(null)}>
              ← Back to Tests
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedTest.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTest.batchName} • {new Date(selectedTest.date).toLocaleDateString()} • Max Marks: {selectedTest.maxMarks}
              </p>
            </div>
          </div>

          {/* Student Marks Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enter Student Marks</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentStudents.length} student{currentStudents.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardContent>
              {currentStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No students found</p>
                  <p className="text-sm">This test has no assigned students.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-24">Roll No.</TableHead>
                      <TableHead className="w-32 text-center">Marks</TableHead>
                      <TableHead className="w-24 text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={studentMarks[student.id] ?? student.marks ?? ""}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            placeholder="0"
                            min="0"
                            max={selectedTest.maxMarks}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSaveMarks(student.id)}
                            className="gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Tests List View
        <Card>
          <CardHeader>
            <CardTitle>Available Tests</CardTitle>
            <p className="text-sm text-muted-foreground">
              {tests.length} test{tests.length !== 1 ? "s" : ""} • Click "Enter Marks" to grade student submissions
            </p>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No tests available</p>
                <p className="text-sm">Tests will be created by administrators.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div>
                          <p className="truncate">{test.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Max: {test.maxMarks} marks
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{test.batchName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(test.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          <span className="font-medium">
                            {test.gradedCount}/{test.totalStudents}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            graded
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTest(test)}
                          disabled={test.status === "Scheduled"}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Enter Marks
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
