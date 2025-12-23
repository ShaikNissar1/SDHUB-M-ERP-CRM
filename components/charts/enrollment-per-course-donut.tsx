"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { GraduationCap, Users } from "lucide-react"

type EnrollmentData = {
  course: string
  totalEnrolled: number
  activeStudents: number
}

export function EnrollmentPerCourseDonut() {
  const [data, setData] = useState<EnrollmentData[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchEnrollmentData = async () => {
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

      const enrollmentStats: EnrollmentData[] = []

      for (const course of courses) {
        // Count total students enrolled in this course
        const { count: totalCount, error: totalError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Count active students (status = 'active')
        const { count: activeCount, error: activeError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)
          .eq("status", "active")

        if (totalError || activeError) {
          console.error(`[v0] Error fetching enrollments for ${course.name}`)
          continue
        }

        enrollmentStats.push({
          course: course.name,
          totalEnrolled: totalCount || 0,
          activeStudents: activeCount || 0,
        })
      }

      setData(enrollmentStats.sort((a, b) => b.totalEnrolled - a.totalEnrolled))
      setLoading(false)
    }

    fetchEnrollmentData()

    const channel = supabase
      .channel("enrollment_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        fetchEnrollmentData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const COLORS = [
    "hsl(221, 83%, 53%)", // Blue
    "hsl(142, 76%, 45%)", // Green
    "hsl(262, 83%, 58%)", // Purple
    "hsl(45, 93%, 47%)", // Amber
    "hsl(335, 78%, 56%)", // Pink
    "hsl(173, 80%, 40%)", // Teal
    "hsl(24, 95%, 53%)", // Orange
    "hsl(199, 89%, 48%)", // Cyan
  ]

  const totalStudents = data.reduce((sum, d) => sum + d.totalEnrolled, 0)
  const totalActive = data.reduce((sum, d) => sum + d.activeStudents, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading enrollment data...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-center space-y-2">
          <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">No enrollment data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1 p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <p className="text-xs font-medium">Total Enrolled</p>
          </div>
          <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
        </div>
        <div className="space-y-1 p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <p className="text-xs font-medium">Active Students</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{totalActive.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative">
        <ChartContainer
          className="h-[240px] w-full"
          config={{
            totalEnrolled: {
              label: "Enrolled",
              color: "hsl(var(--primary))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={index} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={1} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="totalEnrolled"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#grad-${index % COLORS.length})`}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value, payload) => {
                      const item = payload[0]?.payload
                      return item
                        ? `${item.course}: ${item.totalEnrolled} enrolled, ${item.activeStudents} active`
                        : value
                    }}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Courses</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((course, index) => (
          <div key={course.course} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
            <div
              className="h-3 w-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{course.course}</p>
              <p className="text-muted-foreground">{course.totalEnrolled} students</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
