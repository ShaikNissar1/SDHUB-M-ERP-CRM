"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CheckCircle2, Circle, Plus, Search, Users, AlertCircle, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  due_date: string
  priority: "low" | "medium" | "high"
  status: string
  assignment_type: "batch" | "individual"
  batch_id: string | null
  created_by: string
  created_at: string
}

interface StudentTask {
  id: string
  task_id: string
  student_id: string
  student_name: string
  student_email: string
  completed: boolean
  completed_at: string | null
  notes: string | null
}

interface Batch {
  id: string
  name: string
  course_name: string
  total_students: number
}

interface Student {
  id: string
  name: string
  email: string
  batch_id: string
  batch_number: string
  status: string
  course_name: string
}

interface Course {
  id: string
  name: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [studentTasks, setStudentTasks] = useState<StudentTask[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBatch, setFilterBatch] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium" as "low" | "medium" | "high",
    assignment_type: "batch" as "batch" | "individual",
    course_id: "",
    batch_id: "",
    student_ids: [] as string[],
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      console.log("[v0] Fetching tasks, batches, courses, and students...")

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })

      if (tasksError) {
        console.error("[v0] Error fetching tasks:", tasksError)
        throw tasksError
      }
      console.log("[v0] Tasks fetched:", tasksData?.length || 0)
      setTasks(tasksData || [])

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, name")
        .eq("is_active", true)
        .order("name")

      if (coursesError) {
        console.error("[v0] Error fetching courses:", coursesError)
        throw coursesError
      }
      console.log("[v0] Courses fetched:", coursesData?.length || 0, coursesData)
      setCourses(coursesData || [])

      // Fetch batches
      const { data: batchesData, error: batchesError } = await supabase
        .from("batches")
        .select("id, name, course_name, total_students, course_id")
        .order("name")

      if (batchesError) {
        console.error("[v0] Error fetching batches:", batchesError)
        throw batchesError
      }
      console.log("[v0] Batches fetched:", batchesData?.length || 0, batchesData)
      setBatches(batchesData || [])

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, name, email, batch_id, batch_number, status, course_name")
        .order("name")

      if (studentsError) {
        console.error("[v0] Error fetching students:", studentsError)
        throw studentsError
      }
      console.log("[v0] Students fetched:", studentsData?.length || 0)
      console.log(
        "[v0] Student statuses:",
        studentsData?.map((s) => s.status),
      )
      setStudents(studentsData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      toast.error("Failed to load tasks data")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTask() {
    try {
      if (!formData.title.trim()) {
        toast.error("Please enter a task title")
        return
      }

      if (formData.assignment_type === "batch" && !formData.batch_id) {
        toast.error("Please select a batch")
        return
      }

      if (formData.assignment_type === "individual" && formData.student_ids.length === 0) {
        toast.error("Please select at least one student")
        return
      }

      console.log("[v0] Creating task with data:", formData)

      // Insert task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date || null,
          priority: formData.priority,
          assignment_type: formData.assignment_type,
          batch_id: formData.assignment_type === "batch" ? formData.batch_id : null,
          status: "active",
          created_by: "Admin",
        })
        .select()
        .single()

      if (taskError) throw taskError
      console.log("[v0] Task created:", task)

      // Create student task assignments
      if (formData.assignment_type === "batch") {
        // Get students from the selected batch
        const batchStudents = students.filter((s) => s.batch_id === formData.batch_id)
        console.log("[v0] Assigning task to batch students:", batchStudents.length)

        const studentTasksData = batchStudents.map((student) => ({
          task_id: task.id,
          student_id: student.id,
          student_name: student.name,
          student_email: student.email,
          completed: false,
        }))

        const { error: studentTasksError } = await supabase.from("student_tasks").insert(studentTasksData)

        if (studentTasksError) throw studentTasksError
      } else {
        // Individual assignment
        const selectedStudents = students.filter((s) => formData.student_ids.includes(s.id))
        console.log("[v0] Assigning task to individual students:", selectedStudents.length)

        const studentTasksData = selectedStudents.map((student) => ({
          task_id: task.id,
          student_id: student.id,
          student_name: student.name,
          student_email: student.email,
          completed: false,
        }))

        const { error: studentTasksError } = await supabase.from("student_tasks").insert(studentTasksData)

        if (studentTasksError) throw studentTasksError
      }

      toast.success("Task created successfully")
      setCreateDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        assignment_type: "batch",
        course_id: "",
        batch_id: "",
        student_ids: [],
      })
      fetchData()
    } catch (error) {
      console.error("[v0] Error creating task:", error)
      toast.error("Failed to create task")
    }
  }

  async function handleViewTask(task: Task) {
    setSelectedTask(task)
    try {
      const { data, error } = await supabase
        .from("student_tasks")
        .select("*")
        .eq("task_id", task.id)
        .order("student_name")

      if (error) throw error
      setStudentTasks(data || [])
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Error fetching task details:", error)
      toast.error("Failed to load task details")
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      toast.success("Task deleted successfully")
      fetchData()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      priority: "medium",
      assignment_type: "batch",
      course_id: "",
      batch_id: "",
      student_ids: [],
    })
  }

  const filteredBatches = formData.course_id ? batches.filter((b) => b.course_id === formData.course_id) : batches

  const filteredStudents = formData.batch_id ? students.filter((s) => s.batch_id === formData.batch_id) : students

  // Compute filtered students for individual selection
  console.log("[v0] Total students:", students.length)
  console.log(
    "[v0] Students with batch info:",
    students.map((s) => ({ name: s.name, batch_id: s.batch_id, batch_number: s.batch_number })),
  )
  console.log("[v0] Selected batch_id for filtering:", formData.batch_id)
  console.log("[v0] Filtered students count:", filteredStudents.length)
  console.log(
    "[v0] Filtered students:",
    filteredStudents.map((s) => ({ name: s.name, batch_id: s.batch_id })),
  )

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => t.status === "active").length,
    highPriority: tasks.filter((t) => t.priority === "high" && t.status === "active").length,
    batches: new Set(tasks.map((t) => t.batch_id).filter(Boolean)).size,
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBatch = filterBatch === "all" || task.batch_id === filterBatch
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    return matchesSearch && matchesBatch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks Management</h1>
          <p className="text-muted-foreground">Assign and track tasks for students</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriority}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Batches</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.batches}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>Click on a task to view details and completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  setSelectedTask(task)
                  setViewDialogOpen(true)
                  fetchTaskDetails(task.id, supabase).then(setStudentTasks)
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.assignment_type === "batch" ? "Batch" : "Individual"}</Badge>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(task.due_date), "MMM dd, yyyy")}
                      </div>
                    )}
                    {task.batch_id && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {batches.find((b) => b.id === task.batch_id)?.name || "Unknown Batch"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Circle className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p>No tasks found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Assign a new task to students batch-wise or individually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignment Type</Label>
              <Tabs
                value={formData.assignment_type}
                onValueChange={(value: "batch" | "individual") =>
                  setFormData({ ...formData, assignment_type: value, course_id: "", batch_id: "", student_ids: [] })
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="batch">Batch</TabsTrigger>
                  <TabsTrigger value="individual">Individual Students</TabsTrigger>
                </TabsList>
                <TabsContent value="batch" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Select Course *</Label>
                    <Select
                      value={formData.course_id}
                      onValueChange={(value) => setFormData({ ...formData, course_id: value, batch_id: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course first" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No active courses found</div>
                        ) : (
                          courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.course_id && (
                    <div className="space-y-2">
                      <Label htmlFor="batch">Select Batch *</Label>
                      <Select
                        value={formData.batch_id}
                        onValueChange={(value) => setFormData({ ...formData, batch_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBatches.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No active batches for this course</div>
                          ) : (
                            filteredBatches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name} - {batch.course_name} ({batch.total_students || 0} students)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="individual" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch-filter">Filter by Batch (Optional)</Label>
                    <Select
                      value={formData.batch_id || "all"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, batch_id: value === "all" ? "" : value, student_ids: [] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All students" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Students * (Click to select multiple)</Label>
                    <div className="max-h-60 overflow-y-auto rounded-md border p-2">
                      {filteredStudents.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No students found</div>
                      ) : (
                        <div className="space-y-1">
                          {filteredStudents.map((student) => (
                            <label
                              key={student.id}
                              className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.student_ids.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      student_ids: [...formData.student_ids, student.id],
                                    })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      student_ids: formData.student_ids.filter((id) => id !== student.id),
                                    })
                                  }
                                }}
                                className="h-4 w-4 rounded"
                              />
                              <span className="text-sm">
                                {student.name}
                                {student.batch_number && (
                                  <span className="ml-2 text-muted-foreground">({student.batch_number})</span>
                                )}
                                {student.course_name && (
                                  <span className="ml-1 text-xs text-muted-foreground">- {student.course_name}</span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {formData.student_ids.length > 0 && (
                      <p className="text-sm text-muted-foreground">{formData.student_ids.length} student(s) selected</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Task Details Dialog */}
      {selectedTask && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTask.title}
                <Badge
                  variant={
                    selectedTask.priority === "high"
                      ? "destructive"
                      : selectedTask.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {selectedTask.priority}
                </Badge>
              </DialogTitle>
              <DialogDescription>{selectedTask.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <p className="font-medium">
                    {selectedTask.due_date ? format(new Date(selectedTask.due_date), "MMM dd, yyyy") : "No due date"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assignment Type:</span>
                  <p className="font-medium capitalize">{selectedTask.assignment_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{format(new Date(selectedTask.created_at), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{selectedTask.status}</p>
                </div>
              </div>

              {/* Completion Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">{studentTasks.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {studentTasks.filter((st) => st.completed).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {studentTasks.filter((st) => !st.completed).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student List */}
              <div>
                <h4 className="mb-2 font-semibold">Student Status</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {studentTasks.map((st) => (
                    <div key={st.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        {st.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{st.student_name}</p>
                          <p className="text-sm text-muted-foreground">{st.student_email}</p>
                        </div>
                      </div>
                      {st.completed && st.completed_at && (
                        <Badge variant="secondary">Completed {format(new Date(st.completed_at), "MMM dd")}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Function to fetch task details moved outside of the component
async function fetchTaskDetails(taskId: string, supabase: any) {
  try {
    const { data, error } = await supabase.from("student_tasks").select("*").eq("task_id", taskId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching task details:", error)
    throw error
  }
}
