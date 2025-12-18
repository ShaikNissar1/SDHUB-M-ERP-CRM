"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const data = [
  { m: "Jun", score: 72 },
  { m: "Jul", score: 78 },
  { m: "Aug", score: 79 },
  { m: "Sep", score: 83 },
  { m: "Oct", score: 81 },
]

export default function PerformanceChart() {
  return (
    <ChartContainer className="h-[240px]" config={{ score: { label: "Score", color: "hsl(var(--chart-2))" } }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="m" />
          <YAxis domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
