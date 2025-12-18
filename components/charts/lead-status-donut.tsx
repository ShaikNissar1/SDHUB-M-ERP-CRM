"use client"

import React from "react"
import { Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRouter } from "next/navigation"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"

type Slice = { name: string; value: number; fill: string }

const STATUS_META: Array<{ name: string; var: string }> = [
  { name: "New Enquiry", var: "--status-new" },
  { name: "HR Called", var: "--status-called" },
  { name: "Visited", var: "--status-visited" },
  { name: "Admitted", var: "--status-admitted" },
  { name: "Rejected", var: "--status-rejected" },
]

function computeFromLeads(leads: any[]): { data: Slice[]; total: number } {
  const counts = new Map(STATUS_META.map((s) => [s.name, 0]))
  for (const l of leads) {
    const s = (l.status as string) || "New Enquiry"
    if (counts.has(s)) counts.set(s, (counts.get(s) || 0) + 1)
  }
  const data = STATUS_META.map((m) => ({
    name: m.name,
    value: counts.get(m.name) || 0,
    fill: `oklch(var(${m.var}))`,
  }))
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return { data, total }
}

export function LeadStatusDonut() {
  const router = useRouter()
  const { leads, loading } = useSupabaseLeads()
  const [{ data, total }, setState] = React.useState<{ data: Slice[]; total: number }>(() => computeFromLeads([]))

  React.useEffect(() => {
    setState(computeFromLeads(leads))
  }, [leads])

  return (
    <div className="relative">
      <ChartContainer
        className="h-[260px] sm:h-[320px] relative overflow-hidden px-2"
        config={{
          "New Enquiry": { label: "New Enquiry" },
          "HR Called": { label: "HR Called" },
          Visited: { label: "Visited" },
          Admitted: { label: "Admitted" },
          Rejected: { label: "Rejected" },
        }}
      >
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={92}
            stroke="hsl(var(--background))"
            strokeWidth={2}
            labelLine={false}
            onClick={(slice: any) => {
              const name = slice?.name || slice?.payload?.name
              if (name) router.push(`/enquiries?status=${encodeURIComponent(name)}`)
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>

      {/* center label overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-md border text-center">
          <div className="text-xs text-muted-foreground">{loading ? "Loading..." : "Total Leads"}</div>
          <div className="text-lg font-semibold tabular-nums">{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {data.map((d) => (
          <button
            key={d.name}
            type="button"
            onClick={() => router.push(`/enquiries?status=${encodeURIComponent(d.name)}`)}
            className="flex items-center justify-start gap-2 text-left hover:opacity-80 transition-opacity"
            aria-label={`Filter enquiries by ${d.name}`}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: d.fill as string }}
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">
              {d.name}
              <span className="ml-1 text-muted-foreground">({d.value})</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
