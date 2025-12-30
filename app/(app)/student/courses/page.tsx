"use client"

import { useEffect, useState } from "react"
import { useStudent } from "@/lib/contexts/student-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Users, GraduationCap, Award, CheckCircle2, Circle } from "lucide-react"

interface CourseData {
  id: string
  name: string
  description: string
  duration: string
  languages: string[]
  is_active: boolean
}

interface BatchData {
  id: string
  name: string
  start_date: string
  end_date: string
  trainer_name: string
  total_students: number
  status: string
}

interface ModuleData {
  id: string
  title: string
  teacher_id: string
}

interface AttendanceStats {
  totalClasses: number
  attendedClasses: number
  percentage: number
}

export default function StudentCoursesPage() {
  const { selectedStudent } = useStudent()
  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [batchData, setBatchData] = useState<BatchData | null>(null)
  const [modules, setModules] = useState<ModuleData[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalClasses: 0,
    attendedClasses: 0,
    percentage: 0,
  })

  useEffect(() => {
    async function fetchCourseDetails() {
      if (!selectedStudent) {
        setLoading(false)
        return
      }

      if (!selectedStudent.course_id || selectedStudent.course_id === "null") {
        console.log("[v0] Student has no course_id, showing not enrolled message")
        setLoading(false)
        return
      }

      console.log("[v0] Fetching course details for student:", selectedStudent.name)

      const supabase = createBrowserClient()

      try {
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", selectedStudent.course_id)
          .single()

        if (courseError) throw courseError
        setCourseData(course)
        console.log("[v0] Course data:", course)

        if (selectedStudent.batch_id) {
          const { data: batch, error: batchError } = await supabase
            .from("batches")
            .select("*")
            .eq("id", selectedStudent.batch_id)
            .single()

          if (batchError) throw batchError
          setBatchData(batch)
          console.log("[v0] Batch data:", batch)
        }

        const { data: modulesList, error: modulesError } = await supabase
          .from("course_modules")
          .select("*")
          .eq("course_id", selectedStudent.course_id)

        if (!modulesError && modulesList) {
          setModules(modulesList)
          console.log("[v0] Modules:", modulesList)
        }

        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("person_id", selectedStudent.id)
          .eq("type", "student")

        if (!attendanceError && attendanceRecords) {
          const total = attendanceRecords.length
          const present = attendanceRecords.filter((record) => record.status?.toLowerCase() === "present").length
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0

          setAttendanceStats({
            totalClasses: total,
            attendedClasses: present,
            percentage,
          })
          console.log("[v0] Attendance stats:", { total, present, percentage })
        }
      } catch (error) {
        console.error("[v0] Error fetching course details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [selectedStudent])

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Student Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select a student from the dropdown to view course details
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!courseData || !batchData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Course Enrolled</h3>
          <p className="text-sm text-muted-foreground">This student is not enrolled in any course yet</p>
        </div>
      </div>
    )
  }

  const daysElapsed = batchData.start_date
    ? Math.floor((Date.now() - new Date(batchData.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const totalDays =
    batchData.start_date && batchData.end_date
      ? Math.floor(
          (new Date(batchData.end_date).getTime() - new Date(batchData.start_date).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0
  const courseProgress = totalDays > 0 ? Math.min(Math.round((daysElapsed / totalDays) * 100), 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{courseData.name}</h1>
        <p className="text-muted-foreground mt-2">{courseData.description || "Course details and progress tracking"}</p>
      </div>

      {/* Course Overview Card */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Course Overview
              </CardTitle>
              <CardDescription>Your learning journey at a glance</CardDescription>
            </div>
            <Badge variant={courseData.is_active ? "default" : "secondary"} className="text-sm">
              {courseData.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-muted-foreground">{courseProgress}% Complete</span>
            </div>
            <Progress value={courseProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {daysElapsed} of {totalDays} days completed
            </p>
          </div>

          {/* Course Info Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold">{courseData.duration || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Batch Size</p>
                <p className="text-sm font-semibold">{batchData.total_students || 0} Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="text-sm font-semibold">{modules.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="text-sm font-semibold">{attendanceStats.percentage}%</p>
              </div>
            </div>
          </div>

          {/* Languages */}
          {courseData.languages && courseData.languages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {courseData.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="batch" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch">Batch Details</TabsTrigger>
          <TabsTrigger value="modules">Course Modules</TabsTrigger>
          <TabsTrigger value="performance">My Performance</TabsTrigger>
        </TabsList>

        {/* Batch Details Tab */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Batch Information
              </CardTitle>
              <CardDescription>Details about your enrolled batch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch Name</p>
                  <p className="text-lg font-semibold">{batchData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={batchData.status === "Active" ? "default" : "secondary"}>{batchData.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-lg font-semibold">
                    {batchData.start_date ? new Date(batchData.start_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-lg font-semibold">
                    {batchData.end_date ? new Date(batchData.end_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trainer</p>
                  <p className="text-lg font-semibold">{batchData.trainer_name || "TBD"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-lg font-semibold">{batchData.total_students || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Modules
              </CardTitle>
              <CardDescription>
                {modules.length > 0 ? `${modules.length} modules in this course` : "No modules configured yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{module.title}</h4>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No modules available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Overall Attendance</span>
                    <span className="text-sm font-semibold">{attendanceStats.percentage}%</span>
                  </div>
                  <Progress value={attendanceStats.percentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {attendanceStats.attendedClasses}
                    </p>
                    <p className="text-xs text-muted-foreground">Classes Attended</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {attendanceStats.totalClasses}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Classes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Days Completed</span>
                    <span className="text-sm font-semibold">{courseProgress}%</span>
                  </div>
                  <Progress value={courseProgress} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{daysElapsed}</p>
                    <p className="text-xs text-muted-foreground">Days Elapsed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalDays}</p>
                    <p className="text-xs text-muted-foreground">Total Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
