"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { CalendarCheck, BookOpen, ListTodo } from "lucide-react"
import { useStudent } from "@/lib/contexts/student-context"

interface StudentKPIData {
  attendancePercentage: number
  batchStatus: string
  pendingTasksCount: number
  batchName: string
  courseName: string
  totalDays: number // Track total attendance records
}

export default function StudentKpiCards() {
  const { selectedStudent } = useStudent()
  const [kpiData, setKpiData] = useState<StudentKPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedStudent) {
      fetchKPIData()
    }
  }, [selectedStudent])

  async function fetchKPIData() {
    if (!selectedStudent) return

    try {
      const supabase = createBrowserClient()

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("status, date")
        .eq("person_id", selectedStudent.id)
        .eq("type", "student")
        .order("date", { ascending: false })

      if (attendanceError) {
        console.error("[v0] Attendance query error:", attendanceError)
      }

      console.log("[v0] Selected student ID:", selectedStudent.id)
      console.log("[v0] Fetched attendance records:", attendanceData?.length || 0)
      console.log("[v0] All attendance records:", attendanceData)

      const totalDays = attendanceData?.length || 0
      const presentDays =
        attendanceData?.filter((a) => {
          const status = a.status?.trim()
          const isPresent = status === "Present" || status === "present"
          console.log("[v0] Status check:", status, "isPresent:", isPresent)
          return isPresent
        }).length || 0

      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      console.log("[v0] Attendance calculation:", {
        totalDays,
        presentDays,
        percentage: attendancePercentage,
        allStatuses: attendanceData?.map((a) => a.status),
      })

      const { data: batchData } = await supabase
        .from("batches")
        .select("name, status")
        .eq("id", selectedStudent.batch_id)
        .single()

      console.log("[v0] Batch data:", batchData)

      const { data: tasksData } = await supabase
        .from("student_tasks")
        .select("id")
        .eq("student_id", selectedStudent.id)
        .eq("status", "pending")

      console.log("[v0] Pending tasks count:", tasksData?.length || 0)

      setKpiData({
        attendancePercentage: Math.round(attendancePercentage * 10) / 10,
        batchStatus: batchData?.status || "Unknown",
        pendingTasksCount: tasksData?.length || 0,
        batchName: batchData?.name || selectedStudent.batch_number || "N/A",
        courseName: selectedStudent.course_name || "N/A",
        totalDays: totalDays,
      })
    } catch (error) {
      console.error("[v0] Error fetching KPI data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceColor = (percentage: number, totalDays: number) => {
    if (totalDays === 0) return "text-muted-foreground"
    if (totalDays === 1) return "text-blue-600"
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceStatus = (percentage: number, totalDays: number) => {
    if (totalDays === 0) return "Not started"
    if (totalDays === 1) return "Just started"
    if (percentage >= 90) return "Excellent"
    if (percentage >= 75) return "Good"
    return "Needs improvement"
  }

  if (loading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </section>
    )
  }

  if (!selectedStudent) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Please select a student from the dropdown above</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Attendance Percentage */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${getAttendanceColor(kpiData?.attendancePercentage || 0, kpiData?.totalDays || 0)}`}
          >
            {(kpiData?.totalDays || 0) === 0 ? "—" : `${kpiData?.attendancePercentage.toFixed(1)}%`}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {getAttendanceStatus(kpiData?.attendancePercentage || 0, kpiData?.totalDays || 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course & Batch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold line-clamp-1">{kpiData?.courseName}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={kpiData?.batchStatus === "Active" ? "default" : "secondary"} className="text-xs">
              {kpiData?.batchStatus || "Unknown"}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{kpiData?.batchName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{kpiData?.pendingTasksCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {kpiData?.pendingTasksCount === 0 ? "All caught up!" : "Tasks to complete"}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
