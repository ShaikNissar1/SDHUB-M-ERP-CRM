"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@supabase/ssr"
import { TrendingUp, Calendar } from "lucide-react"

type TimeInterval = "days" | "weeks" | "months"
type DataPoint = { date: string; count: number }

export function EnquiriesOverTimeLine() {
  const [interval, setInterval] = useState<TimeInterval>("days")
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchEnquiriesData = async () => {
      setLoading(true)

      const { data: leads, error } = await supabase
        .from("leads")
        .select("created_at")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching enquiries:", error)
        setLoading(false)
        return
      }

      if (!leads || leads.length === 0) {
        setData([])
        setLoading(false)
        return
      }

      // Group by date
      const dateMap = new Map<string, number>()

      leads.forEach((lead) => {
        const date = new Date(lead.created_at)
        let key: string

        if (interval === "days") {
          key = date.toISOString().split("T")[0]
        } else if (interval === "weeks") {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split("T")[0]
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        }

        dateMap.set(key, (dateMap.get(key) || 0) + 1)
      })

      // Convert to array and sort
      const chartData = Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setData(chartData)
      setLoading(false)
    }

    fetchEnquiriesData()

    const channel = supabase
      .channel("enquiries_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        fetchEnquiriesData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [interval, supabase])

  const formatXAxis = (value: string) => {
    const date = new Date(value)
    if (interval === "months") {
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const trendPercentage =
    data.length >= 2
      ? Math.round(((data[data.length - 1].count - data[data.length - 2].count) / data[data.length - 2].count) * 100)
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading enquiries data...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <div className="text-center space-y-2">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">No enquiries data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              {data.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
            </h3>
            {trendPercentage !== 0 && (
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  trendPercentage > 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                <TrendingUp className={`h-4 w-4 ${trendPercentage < 0 ? "rotate-180" : ""}`} />
                {Math.abs(trendPercentage)}%
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Total enquiries over time</p>
        </div>

        <Select value={interval} onValueChange={(v) => setInterval(v as TimeInterval)}>
          <SelectTrigger className="w-[140px] h-9 border-border/50 hover:border-border transition-colors">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Daily</SelectItem>
            <SelectItem value="weeks">Weekly</SelectItem>
            <SelectItem value="months">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        className="h-[320px] w-full"
        config={{
          count: {
            label: "Enquiries",
            color: "hsl(142, 71%, 45%)",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={formatXAxis}
              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "5 5" }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "hsl(142, 71%, 45%)",
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
              }}
              activeDot={{
                r: 6,
                fill: "hsl(142, 71%, 45%)",
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
              }}
              fill="url(#colorEnquiries)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
