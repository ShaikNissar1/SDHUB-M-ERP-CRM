"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateAssignmentDialog } from "@/components/teacher/create-assignment-dialog"
import { SubmissionsTable } from "@/components/teacher/submissions-table"
import { Eye, Calendar, Users } from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  batchName: string
  batchId: string
  dueDate: string
  totalStudents: number
  submittedCount: number
  status: "Active" | "Completed"
}

interface Submission {
  id: string
  studentName: string
  submittedAt: string
  status: "Submitted" | "Graded" | "Pending"
  marks?: number
  remarks?: string
}

export default function TeacherAssignmentsPage() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  // Mock assignments data - replace with actual data fetching
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Data Structures Implementation",
      description: "Implement basic data structures in your preferred programming language",
      batchName: "CS-2024-A",
      batchId: "batch-1",
      dueDate: "2024-01-15",
      totalStudents: 25,
      submittedCount: 18,
      status: "Active",
    },
    {
      id: "2",
      title: "Algorithm Analysis Report",
      description: "Analyze and compare different sorting algorithms",
      batchName: "CS-2024-B",
      batchId: "batch-2",
      dueDate: "2024-01-10",
      totalStudents: 22,
      submittedCount: 22,
      status: "Completed",
    },
    {
      id: "3",
      title: "Database Design Project",
      description: "Design a database schema for a library management system",
      batchName: "CS-2024-C",
      batchId: "batch-3",
      dueDate: "2024-01-20",
      totalStudents: 28,
      submittedCount: 15,
      status: "Active",
    },
  ])

  // Mock submissions data - replace with actual data fetching
  const mockSubmissions: Record<string, Submission[]> = {
    "1": [
      { id: "s1", studentName: "John Doe", submittedAt: "2024-01-12T10:30:00", status: "Submitted" },
      { id: "s2", studentName: "Jane Smith", submittedAt: "2024-01-11T14:20:00", status: "Graded", marks: 85, remarks: "Good implementation, could improve documentation" },
      { id: "s3", studentName: "Mike Johnson", submittedAt: "2024-01-13T09:15:00", status: "Submitted" },
    ],
    "2": [
      { id: "s4", studentName: "Sarah Wilson", submittedAt: "2024-01-08T16:45:00", status: "Graded", marks: 92, remarks: "Excellent analysis and comparison" },
      { id: "s5", studentName: "David Brown", submittedAt: "2024-01-09T11:30:00", status: "Graded", marks: 78, remarks: "Good work, needs more depth in complexity analysis" },
    ],
    "3": [
      { id: "s6", studentName: "Emma Davis", submittedAt: "2024-01-18T13:20:00", status: "Submitted" },
      { id: "s7", studentName: "Chris Miller", submittedAt: "2024-01-17T15:10:00", status: "Pending" },
    ],
  }

  const handleCreateAssignment = (newAssignment: {
    title: string
    description: string
    batchId: string
    dueDate: string
  }) => {
    // Mock batch lookup - replace with actual batch data
    const batchMap: Record<string, string> = {
      "batch-1": "CS-2024-A",
      "batch-2": "CS-2024-B",
      "batch-3": "CS-2024-C",
      "batch-4": "CS-2024-D",
    }

    const assignment: Assignment = {
      id: Date.now().toString(),
      title: newAssignment.title,
      description: newAssignment.description,
      batchName: batchMap[newAssignment.batchId] || "Unknown Batch",
      batchId: newAssignment.batchId,
      dueDate: newAssignment.dueDate,
      totalStudents: 25, // Mock value
      submittedCount: 0,
      status: "Active",
    }

    setAssignments(prev => [assignment, ...prev])
  }

  const handleGradeSubmission = (submissionId: string, marks: number, remarks: string) => {
    // UI only - no actual save logic
    console.log("Grading submission:", submissionId, { marks, remarks })
  }

  const getSubmissionStatus = (assignment: Assignment) => {
    const submissions = mockSubmissions[assignment.id] || []
    const submittedCount = submissions.length
    const gradedCount = submissions.filter(s => s.status === "Graded").length

    if (submittedCount === 0) return "No submissions"
    if (gradedCount === submittedCount) return "All graded"
    if (gradedCount > 0) return `${gradedCount}/${submittedCount} graded`
    return `${submittedCount} submitted`
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "Active": "default",
      "Completed": "secondary",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    )
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Create assignments and evaluate student submissions
          </p>
        </div>
        <CreateAssignmentDialog onSubmit={handleCreateAssignment} />
      </div>

      {selectedAssignment ? (
        // Submission View
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
              ← Back to Assignments
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedAssignment.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedAssignment.batchName}</p>
            </div>
          </div>

          <SubmissionsTable
            submissions={mockSubmissions[selectedAssignment.id] || []}
            assignmentTitle={selectedAssignment.title}
            onGradeSubmission={handleGradeSubmission}
          />
        </div>
      ) : (
        // Assignment List
        <Card>
          <CardHeader>
            <CardTitle>Your Assignments</CardTitle>
            <p className="text-sm text-muted-foreground">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No assignments created</p>
                <p className="text-sm">Create your first assignment to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submission Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div>
                          <p className="truncate">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {assignment.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.batchName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">
                            {assignment.submittedCount}/{assignment.totalStudents}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            submitted
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getSubmissionStatus(assignment)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAssignment(assignment)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View Submissions
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
