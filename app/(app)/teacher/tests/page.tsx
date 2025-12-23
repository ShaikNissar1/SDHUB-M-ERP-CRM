"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Edit2, Eye, FileText, TrendingUp, Calendar } from "lucide-react"

const upcomingTests = [
  {
    id: 1,
    name: "Module 1 - Final Assessment",
    course: "Digital Marketing",
    batch: "B001",
    date: "2024-03-15",
    duration: "2 hours",
    maxMarks: 100,
    status: "Scheduled",
  },
  {
    id: 2,
    name: "Mid-Term Practical",
    course: "Tally ERP",
    batch: "B002",
    date: "2024-03-18",
    duration: "3 hours",
    maxMarks: 100,
    status: "Scheduled",
  },
]

const completedTests = [
  {
    id: 3,
    name: "Module 1 - Quiz",
    course: "Digital Marketing",
    batch: "B001",
    date: "2024-02-28",
    totalStudents: 25,
    submitted: 25,
    graded: 25,
    avgScore: 82,
    maxMarks: 100,
  },
  {
    id: 4,
    name: "Theory Test",
    course: "Tally ERP",
    batch: "B002",
    date: "2024-02-25",
    totalStudents: 18,
    submitted: 18,
    graded: 18,
    avgScore: 76,
    maxMarks: 100,
  },
  {
    id: 5,
    name: "Practical Assessment",
    course: "Advanced Excel",
    batch: "B003",
    date: "2024-02-20",
    totalStudents: 22,
    submitted: 22,
    graded: 20,
    avgScore: 88,
    maxMarks: 100,
  },
]

const studentResults = [
  { id: 1, name: "Asha Verma", batch: "B001", score: 82, maxMarks: 100, grade: "A", remarks: "Good work" },
  { id: 2, name: "Rohit Kumar", batch: "B002", score: 74, maxMarks: 100, grade: "B", remarks: "Needs improvement" },
  { id: 3, name: "Sara Khan", batch: "B003", score: 88, maxMarks: 100, grade: "A+", remarks: "Excellent" },
  { id: 4, name: "Vikram Singh", batch: "B001", score: 65, maxMarks: 100, grade: "C", remarks: "Practice more" },
  { id: 5, name: "Priya Sharma", batch: "B002", score: 92, maxMarks: 100, grade: "A+", remarks: "Outstanding" },
]

export default function TeacherTestsPage() {
  const [selectedTest, setSelectedTest] = useState<number | null>(null)
  const [openMarksDialog, setOpenMarksDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)

  const getGradeBadge = (grade: string) => {
    const colors = {
      "A+": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      D: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      F: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[grade as keyof typeof colors] || colors.C
  }

  const handleEditMarks = (student: any) => {
    setEditingStudent(student)
    setOpenMarksDialog(true)
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Tests & Results</h1>
          <p className="text-muted-foreground mt-2">View upcoming tests, enter marks, and analyze performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tests Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Grading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTests.reduce((acc, t) => acc + (t.submitted - t.graded), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(completedTests.reduce((acc, t) => acc + t.avgScore, 0) / completedTests.length)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed Tests</TabsTrigger>
          <TabsTrigger value="marks">Enter Marks</TabsTrigger>
        </TabsList>

        {/* Upcoming Tests Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.course}</TableCell>
                      <TableCell>{test.batch}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(test.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{test.duration}</TableCell>
                      <TableCell>{test.maxMarks}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="View Syllabus">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tests Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Submissions</TableHead>
                    <TableHead className="text-center">Graded</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.course}</TableCell>
                      <TableCell>{test.batch}</TableCell>
                      <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        {test.submitted}/{test.totalStudents}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            test.graded === test.submitted
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }
                        >
                          {test.graded}/{test.submitted}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">{test.avgScore}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" title="View Analytics">
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="View Results">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Download Report">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enter Marks Tab */}
        <TabsContent value="marks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Results</CardTitle>
                <Select>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select test" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedTests.map((test) => (
                      <SelectItem key={test.id} value={String(test.id)}>
                        {test.name} - {test.batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResults.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell className="text-center">
                        {student.score}/{student.maxMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeBadge(student.grade)}>{student.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.remarks}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleEditMarks(student)} title="Edit Marks">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Marks Dialog */}
      <Dialog open={openMarksDialog} onOpenChange={setOpenMarksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Marks - {editingStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Score (out of {editingStudent?.maxMarks})</Label>
              <Input type="number" defaultValue={editingStudent?.score} placeholder="Enter score" />
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select defaultValue={editingStudent?.grade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remarks / Feedback</Label>
              <Input defaultValue={editingStudent?.remarks} placeholder="Add remarks" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMarksDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpenMarksDialog(false)
                // Handle save logic here
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
