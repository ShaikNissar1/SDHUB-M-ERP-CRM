"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type CoursePerformance = {
  course: string
  enrollments: number
  completionRate: number
  avgAttendance: number
}

const generateTopPerformingData = (): CoursePerformance[] => {
  const courses = ["Web Development", "Tally ERP", "Digital Marketing", "Data Analytics", "Office Administration"]

  const data = courses.map((course) => ({
    course,
    enrollments: 20 + Math.floor(Math.random() * 60),
    completionRate: 60 + Math.floor(Math.random() * 35),
    avgAttendance: 65 + Math.floor(Math.random() * 30),
  }))

  // Sort by enrollments (primary metric for "top performing")
  return data.sort((a, b) => b.enrollments - a.enrollments)
}

export function TopPerformingCoursesBar() {
  const [data, setData] = useState<CoursePerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const performanceData = generateTopPerformingData()
      setData(performanceData)
      setLoading(false)
    }

    loadData()

    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        Loading performance data...
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        No performance data available
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <ChartContainer
        className="h-[280px] w-full"
        config={{
          enrollments: {
            label: "Enrollments",
            color: "hsl(220, 70%, 60%)",
          },
          completionRate: {
            label: "Completion Rate %",
            color: "hsl(142, 76%, 36%)",
          },
          avgAttendance: {
            label: "Avg Attendance %",
            color: "hsl(30, 85%, 60%)",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 60, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="course" interval={0} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="enrollments" fill="hsl(220, 70%, 60%)" />
            <Bar dataKey="completionRate" fill="hsl(142, 76%, 36%)" />
            <Bar dataKey="avgAttendance" fill="hsl(30, 85%, 60%)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="text-xs text-muted-foreground text-center">
        Courses ranked by total enrollments, completion rate, and attendance performance
      </p>
    </div>
  )
}
