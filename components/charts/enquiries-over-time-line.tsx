"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TimeInterval = "days" | "weeks" | "months"
type DataPoint = { date: string; count: number }

// 🔹 Smooth wave-like trend generator (THIS is the key)
const generateSmoothTrendData = (days: number): DataPoint[] => {
  const today = new Date()
  const data: DataPoint[] = []

  const base = 15 // baseline enquiries
  const amplitude = 10 // height of waves
  const frequency = 2.5 // number of waves across range

  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))

    // Smooth sine-wave trend
    const wave = Math.sin((i / days) * Math.PI * frequency) * amplitude

    // Small natural variation
    const noise = Math.random() * 2 - 1

    const value = Math.max(5, Math.min(35, base + wave + noise))

    data.push({
      date: d.toISOString().split("T")[0],
      count: Math.round(value),
    })
  }

  return data
}

export function EnquiriesOverTimeLine() {
  const [interval, setInterval] = useState("days")
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    const raw = generateSmoothTrendData(30)

    if (interval === "days") {
      setData(raw)
      return
    }

    const map = new Map<string, number>()

    raw.forEach((d) => {
      const date = new Date(d.date)
      let key: string

      if (interval === "weeks") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split("T")[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }

      map.set(key, (map.get(key) || 0) + d.count)
    })

    setData(
      Array.from(map.entries()).map(([date, count]) => ({
        date,
        count,
      })),
    )
  }, [interval])

  const formatXAxis = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

  return (
    <div>
      {/* Interval Selector */}
      <Select value={interval} onValueChange={(v) => setInterval(v as TimeInterval)}>
        <SelectTrigger>
          <SelectValue placeholder="Select interval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="days">Days</SelectItem>
          <SelectItem value="weeks">Weeks</SelectItem>
          <SelectItem value="months">Months</SelectItem>
        </SelectContent>
      </Select>

      {/* Chart */}
      <ChartContainer
        className="h-[280px] sm:h-[320px] w-full"
        config={{
          count: {
            label: "Enquiries",
            color: "hsl(168 76% 36%)", // teal like your image
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.25} />
            <XAxis dataKey="date" tickFormatter={formatXAxis} angle={0} height={40} tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 40]} tick={{ fontSize: 12 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} labelFormatter={formatXAxis} />
            <Line
              type="natural"
              dataKey="count"
              stroke="hsl(168 76% 36%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
