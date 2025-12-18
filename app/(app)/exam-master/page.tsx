"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Plus, Settings, Eye, Trash2 } from "lucide-react"
import { EnhancedAddExamDialog } from "@/components/exams/enhanced-add-exam-dialog"
import { useSuperbaseCourses } from "@/hooks/use-supabase-courses"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExamRecord {
  id: string
  title: string
  course_id: string | null
  form_link: string
  sheet_link: string
  type: "entrance_exam" | "main_exam" | "internal_exam"
  status: "active" | "inactive"
  created_at: string
}

export default function ExamMasterPage() {
  const router = useRouter()
  const { courses, loading: coursesLoading } = useSuperbaseCourses()
  const [exams, setExams] = React.useState<ExamRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "entrance_exam" | "main_exam" | "internal_exam">("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all")
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; examId: string; examTitle: string }>({
    open: false,
    examId: "",
    examTitle: "",
  })
  const [deleting, setDeleting] = React.useState(false)

  const fetchExams = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/exams")
      if (!response.ok) throw new Error("Failed to fetch exams")
      const data = await response.json()
      setExams(data as ExamRecord[])
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return "General"
    const course = courses.find((c) => c.id === courseId)
    return course?.name || courseId
  }

  const handleDeleteExam = async (examId: string) => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete exam")
      setDeleteDialog({ open: false, examId: "", examTitle: "" })
      fetchExams()
    } catch (error) {
      console.error("Error deleting exam:", error)
      alert("Failed to delete exam. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const filtered = React.useMemo(() => {
    return exams.filter((exam) => {
      const courseName = getCourseName(exam.course_id)
      const matchesSearch =
        !searchTerm ||
        [exam.title, courseName].filter(Boolean).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = typeFilter === "all" || exam.type === typeFilter
      const matchesStatus = statusFilter === "all" || exam.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [exams, searchTerm, typeFilter, statusFilter, courses])

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Exam Master</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Create and manage Entrance Exams, Main Exams, and Internal Exams with automatic Google Forms integration.
        </p>
      </header>

      <section className="mb-6 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exam title or course"
            className="h-9 w-full max-w-sm"
          />

          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Type: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Type: All</SelectItem>
              <SelectItem value="entrance_exam">Entrance Exam</SelectItem>
              <SelectItem value="main_exam">Main Exam</SelectItem>
              <SelectItem value="internal_exam">Internal Exam</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <EnhancedAddExamDialog
            trigger={
              <Button size="sm" className="ml-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            }
            onCreated={() => {
              fetchExams()
            }}
          />
        </div>
      </section>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">Loading exams...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No exams found. Create your first exam to get started.
            </CardContent>
          </Card>
        ) : (
          filtered.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant={exam.status === "active" ? "default" : "secondary"}>
                        {exam.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {exam.type === "entrance_exam" && "Entrance Exam"}
                        {exam.type === "main_exam" && "Main Exam"}
                        {exam.type === "internal_exam" && "Internal Exam"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Course: {getCourseName(exam.course_id)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/exam-master/results/${exam.id}?type=${exam.type}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Results
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/exam-master/${exam.id}`)}>
                      <Settings className="h-4 w-4 mr-1" />
                      Setup
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteDialog({ open: true, examId: exam.id, examTitle: exam.title })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Google Form</p>
                    <a
                      href={exam.form_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Open Form
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Google Sheet</p>
                    <a
                      href={exam.sheet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Open Sheet
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.examTitle}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteExam(deleteDialog.examId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
