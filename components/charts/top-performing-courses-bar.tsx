"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { createBrowserClient } from "@supabase/ssr"
import { Trophy } from "lucide-react"

type CoursePerformance = {
  course: string
  enrollments: number
  completionRate: number
  avgAttendance: number
}

export function TopPerformingCoursesBar() {
  const [data, setData] = useState<CoursePerformance[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true)

      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, name")
        .eq("is_active", true)

      if (coursesError) {
        console.error("[v0] Error fetching courses:", coursesError)
        setLoading(false)
        return
      }

      const performanceStats: CoursePerformance[] = []

      for (const course of courses) {
        // Get enrollments
        const { count: enrollments } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Get certificates issued (completion metric)
        const { count: completedStudents } = await supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Get attendance records
        const { data: attendanceRecords } = await supabase
          .from("attendance")
          .select("status")
          .eq("course_id", course.id)

        const totalAttendance = attendanceRecords?.length || 0
        const presentCount = attendanceRecords?.filter((r) => r.status === "present").length || 0

        const completionRate = enrollments ? Math.round(((completedStudents || 0) / enrollments) * 100) : 0
        const avgAttendance = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0

        performanceStats.push({
          course: course.name,
          enrollments: enrollments || 0,
          completionRate,
          avgAttendance,
        })
      }

      // Sort by overall performance (weighted average)
      const sorted = performanceStats.sort((a, b) => {
        const scoreA = a.enrollments * 0.4 + a.completionRate * 0.3 + a.avgAttendance * 0.3
        const scoreB = b.enrollments * 0.4 + b.completionRate * 0.3 + b.avgAttendance * 0.3
        return scoreB - scoreA
      })

      setData(sorted)
      setLoading(false)
    }

    fetchPerformanceData()

    const channels = [
      supabase
        .channel("students_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "students" }, fetchPerformanceData)
        .subscribe(),
      supabase
        .channel("certificates_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "certificates" }, fetchPerformanceData)
        .subscribe(),
      supabase
        .channel("attendance_changes_perf")
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, fetchPerformanceData)
        .subscribe(),
    ]

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [supabase])

  const getPerformanceColor = (index: number) => {
    if (index === 0) return "hsl(45, 93%, 47%)" // Gold for #1
    if (index === 1) return "hsl(240, 5%, 64%)" // Silver for #2
    if (index === 2) return "hsl(28, 80%, 52%)" // Bronze for #3
    return "hsl(221, 83%, 53%)" // Blue for others
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-center space-y-2">
          <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">No performance data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold tracking-tight">Top Performer</h3>
          </div>
          <p className="text-2xl font-bold text-amber-600">{data[0]?.course}</p>
          <p className="text-sm text-muted-foreground">
            {data[0]?.enrollments} enrollments • {data[0]?.completionRate}% completion • {data[0]?.avgAttendance}%
            attendance
          </p>
        </div>
      </div>

      <ChartContainer
        className="h-[320px] w-full"
        config={{
          enrollments: {
            label: "Enrollments",
            color: "hsl(221, 83%, 53%)",
          },
          completionRate: {
            label: "Completion %",
            color: "hsl(142, 76%, 45%)",
          },
          avgAttendance: {
            label: "Attendance %",
            color: "hsl(262, 83%, 58%)",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 5)} margin={{ top: 20, right: 20, bottom: 80, left: 10 }}>
            <defs>
              <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="course"
              interval={0}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="circle" />
            <Bar dataKey="enrollments" fill="url(#enrollmentGrad)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completionRate" fill="url(#completionGrad)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgAttendance" fill="url(#attendanceGrad)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Performance Ranking</p>
        <div className="space-y-1">
          {data.slice(0, 3).map((course, index) => (
            <div
              key={course.course}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                  index === 0
                    ? "bg-amber-500/20 text-amber-700"
                    : index === 1
                      ? "bg-gray-500/20 text-gray-700"
                      : "bg-orange-500/20 text-orange-700"
                }`}
              >
                {index + 1}
              </div>
              <p className="flex-1 font-medium text-sm">{course.course}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{course.enrollments} enrolled</span>
                <span className="text-emerald-600 font-medium">{course.completionRate}%</span>
                <span className="text-purple-600 font-medium">{course.avgAttendance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
