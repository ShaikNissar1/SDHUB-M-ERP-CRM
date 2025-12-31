"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import StudentKpiCards from "@/components/student/student-kpi-cards"
import { createBrowserClient } from "@/lib/supabase/client"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  formatDistanceToNow,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns"
import { ArrowRight } from "lucide-react"
import { useStudent } from "@/lib/contexts/student-context"

interface Task {
  id: string
  status: string
  task: {
    title: string
    due_date: string | null
  }
}

interface AttendanceTrendData {
  month: string
  percentage: number
}

export default function StudentDashboardPage() {
  const { selectedStudent } = useStudent()
  const [tasks, setTasks] = useState<Task[]>([])
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedStudent) {
      fetchDashboardData()
    }
  }, [selectedStudent])

  async function fetchDashboardData() {
    if (!selectedStudent) return

    try {
      const supabase = createBrowserClient()

      const { data: tasksData } = await supabase
        .from("student_tasks")
        .select(`
          id,
          status,
          task:tasks (
            title,
            due_date
          )
        `)
        .eq("student_id", selectedStudent.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5)

      setTasks((tasksData as any) || [])
      console.log("[v0] Fetched tasks:", tasksData?.length || 0)

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("date, status")
        .eq("person_id", selectedStudent.id)
        .eq("type", "student")
        .gte("date", format(subMonths(new Date(), 6), "yyyy-MM-dd"))

      console.log("[v0] Fetched attendance records:", attendanceData?.length || 0)
      console.log(
        "[v0] Sample attendance statuses:",
        attendanceData?.slice(0, 3).map((r) => r.status),
      )

      if (attendanceData && attendanceData.length > 0) {
        // Calculate monthly attendance percentages
        const months = eachMonthOfInterval({
          start: subMonths(new Date(), 5),
          end: new Date(),
        })

        const trendData = months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)

          const monthRecords = attendanceData.filter((record) => {
            const recordDate = parseISO(record.date)
            return recordDate >= monthStart && recordDate <= monthEnd
          })

          const total = monthRecords.length
          const present = monthRecords.filter((r) => r.status === "Present").length
          const percentage = total > 0 ? (present / total) * 100 : 0

          return {
            month: format(month, "MMM"),
            percentage: Math.round(percentage),
          }
        })

        setAttendanceTrend(trendData)
        console.log("[v0] Attendance trend data:", trendData)
      }
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTask(taskId: string) {
    try {
      const supabase = createBrowserClient()

      await supabase
        .from("student_tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", taskId)

      // Refresh tasks
      fetchDashboardData()
    } catch (error) {
      console.error("[v0] Error updating task:", error)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-col gap-6">
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!selectedStudent) {
    return (
      <main className="flex flex-col gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a student from the dropdown above</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Welcome Header */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Welcome back, {selectedStudent.name}!</h1>
        <p className="text-muted-foreground mt-1">
          {selectedStudent.course_name} • {selectedStudent.batch_number}
        </p>
      </header>

      {/* KPI Cards */}
      <StudentKpiCards />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months performance</p>
          </CardHeader>
          <CardContent>
            {attendanceTrend.length > 0 ? (
              <ChartContainer
                className="h-[240px]"
                config={{
                  percentage: {
                    label: "Attendance %",
                    color: "hsl(var(--primary))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="var(--color-percentage)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks Widget */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-lg">My Tasks</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {tasks.length} pending {tasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>
            <Link href="/student/tasks">
              <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary/10">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No pending tasks at the moment.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task, index) => {
                  const dueDate = task.task.due_date ? parseISO(task.task.due_date) : null
                  const isOverdue = dueDate && dueDate < new Date()

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                        isOverdue ? "border-red-200 bg-red-50/50" : "bg-background"
                      }`}
                    >
                      <Checkbox onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">{task.task.title}</p>
                          <span className="text-xs font-medium text-muted-foreground shrink-0">#{index + 1}</span>
                        </div>
                        {task.task.due_date && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <svg
                              className={`w-3.5 h-3.5 ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p
                              className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                            >
                              {isOverdue ? "Overdue • " : "Due "}
                              {formatDistanceToNow(dueDate, { addSuffix: true })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Link href="/student/attendance">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">View Attendance</p>
              <p className="text-sm text-muted-foreground mt-1">Check your attendance records</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/tasks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">My Tasks</p>
              <p className="text-sm text-muted-foreground mt-1">Manage assigned tasks</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/profile">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">My Profile</p>
              <p className="text-sm text-muted-foreground mt-1">Update your information</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/certificates">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">Certificates</p>
              <p className="text-sm text-muted-foreground mt-1">View & download certificates</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
