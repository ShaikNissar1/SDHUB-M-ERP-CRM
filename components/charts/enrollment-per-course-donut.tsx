"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AttendanceData = {
  course: string
  totalStudents: number
  presentStudents: number
  engagementRate: number
}

type TimeFilter = "weeks" | "months"

// 🔹 Dummy data generator
const generateDummyData = (): AttendanceData[] => {
  const courses = ["Web Development", "Tally ERP", "Digital Msrketing", "Data Analytics", "Office Administration"]

  return courses.map((course) => {
    const totalStudents = 40 + Math.floor(Math.random() * 20)
    const presentStudents = Math.floor(totalStudents * (0.5 + Math.random() * 0.4))

    return {
      course,
      totalStudents,
      presentStudents,
      engagementRate: (presentStudents / totalStudents) * 100,
    }
  })
}

export function EnrollmentPerCourseDonut() {
  const [data, setData] = useState<AttendanceData[]>([])
  const [timeFilter, setTimeFilter] = useState("weeks")
  const [leastEngagedCourse, setLeastEngagedCourse] = useState("")

  useEffect(() => {
    const loadDummyData = () => {
      const dummyData = generateDummyData()

      const leastEngaged = dummyData.reduce((min, current) =>
        current.engagementRate < min.engagementRate ? current : min,
      )

      setLeastEngagedCourse(leastEngaged.course)
      setData(dummyData)
    }

    // Initial load
    loadDummyData()

    // 🔁 Simulate realtime updates every 60s
    const interval = setInterval(loadDummyData, 60000)

    return () => clearInterval(interval)
  }, [timeFilter])

  if (data.length === 0) {
    return <div className="text-center">No attendance data available</div>
  }
  return (
    <div>
      <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
        <SelectTrigger>
          <SelectValue placeholder="Select time filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weeks">Weeks</SelectItem>
          <SelectItem value="months">Months</SelectItem>
        </SelectContent>
      </Select>

      <ChartContainer
        className="h-[280px] w-full"
        config={{
          totalStudents: {
            label: "Total Students",
            color: "hsl(var(--muted-foreground))",
          },
          presentStudents: {
            label: "Present Students",
            color: "hsl(142 76% 36%)",
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
            <Bar dataKey="totalStudents" fill="hsl(var(--muted-foreground))" />
            <Bar dataKey="presentStudents" fill="hsl(142 76% 36%)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <p className="text-xs text-muted-foreground text-center">
        Course with least engagement: <span className="font-medium text-foreground">{leastEngagedCourse}</span>
      </p>
    </div>
  )
}
