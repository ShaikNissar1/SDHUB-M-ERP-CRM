"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { useCourses } from "@/lib/courses"
import { useRouter } from "next/navigation"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"

type BarRow = { course: string; enquiries: number }

export function EnquiriesByCourseBar() {
  const router = useRouter()
  const courses = useCourses()
  const { leads, loading } = useSupabaseLeads()
  const [rows, setRows] = useState<BarRow[]>([])

  const palette = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const recompute = () => {
    const counts = new Map<string, number>()
    courses.forEach((c) => counts.set(c, 0))
    for (const l of leads) {
      const c = l.course
      if (!c) continue
      if (!counts.has(c)) continue
      counts.set(c, (counts.get(c) || 0) + 1)
    }
    const data: BarRow[] = Array.from(counts.entries())
      .map(([course, enquiries]) => ({ course, enquiries }))
      .sort((a, b) => b.enquiries - a.enquiries)
    setRows(data)
  }

  useEffect(() => {
    recompute()
  }, [leads, courses])

  const data = rows

  return (
    <ChartContainer
      className="h-[280px] sm:h-[320px] w-full overflow-hidden"
      config={{
        enquiries: { label: "Enquiries", color: "hsl(var(--chart-2))" },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 60, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="course"
            interval={0}
            tick={{ fontSize: 12, fill: "currentColor" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="enquiries" radius={[8, 8, 0, 0]} fill="hsl(var(--chart-2))">
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${entry.course}`}
                fill={palette[idx % palette.length]}
                onClick={() => router.push(`/enquiries?course=${encodeURIComponent(entry.course)}`)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
