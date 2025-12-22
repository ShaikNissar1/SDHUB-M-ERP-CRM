"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Users } from "lucide-react"

type AttendanceData = {
  course: string
  totalSessions: number
  presentCount: number
  attendanceRate: number
}

export function AttendancePerCourseBar() {
  const [data, setData] = useState<AttendanceData[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchAttendanceData = async () => {
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

      const attendanceStats: AttendanceData[] = []

      for (const course of courses) {
        // Get total attendance records for this course
        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from("attendance")
          .select("status")
          .eq("course_id", course.id)

        if (attendanceError) {
          console.error(`[v0] Error fetching attendance for ${course.name}:`, attendanceError)
          continue
        }

        const totalSessions = attendanceRecords?.length || 0
        const presentCount = attendanceRecords?.filter((r) => r.status === "present").length || 0
        const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0

        attendanceStats.push({
          course: course.name,
          totalSessions,
          presentCount,
          attendanceRate: Math.round(attendanceRate),
        })
      }

      setData(attendanceStats.sort((a, b) => b.attendanceRate - a.attendanceRate))
      setLoading(false)
    }

    fetchAttendanceData()

    const channel = supabase
      .channel("attendance_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => {
        fetchAttendanceData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const averageAttendance =
    data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.attendanceRate, 0) / data.length) : 0

  const getBarColor = (rate: number) => {
    if (rate >= 85) return "hsl(142, 76%, 45%)" // Green
    if (rate >= 70) return "hsl(45, 93%, 47%)" // Amber
    return "hsl(0, 84%, 60%)" // Red
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-center space-y-2">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">No attendance data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">{averageAttendance}%</h3>
            <span
              className={`text-sm font-medium ${
                averageAttendance >= 85
                  ? "text-emerald-600"
                  : averageAttendance >= 70
                    ? "text-amber-600"
                    : "text-rose-600"
              }`}
            >
              Average
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Across all active courses</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Best Performer</p>
          <p className="text-sm font-medium">{data[0]?.course}</p>
        </div>
      </div>

      <ChartContainer
        className="h-[320px] w-full"
        config={{
          attendanceRate: {
            label: "Attendance Rate",
            color: "hsl(142, 76%, 45%)",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 80, left: 10 }}>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getBarColor(entry.attendanceRate)} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={getBarColor(entry.attendanceRate)} stopOpacity={0.7} />
                </linearGradient>
              ))}
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
              domain={[0, 100]}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
            <Bar dataKey="attendanceRate" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="text-muted-foreground">≥85% Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-amber-500" />
          <span className="text-muted-foreground">70-84% Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-rose-500" />
          <span className="text-muted-foreground">&lt;70% Needs Attention</span>
        </div>
      </div>
    </div>
  )
}
