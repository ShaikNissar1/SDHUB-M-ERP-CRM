"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DayStatus = "present" | "absent" | "leave" | "unmarked"

type RecordsMap = {
  // ISO date (YYYY-MM-DD) -> status
  [isoDate: string]: DayStatus
}

function formatISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function monthLabel(date: Date) {
  return date.toLocaleString(undefined, { month: "long", year: "numeric" })
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function AttendanceCalendar({
  records,
}: {
  records?: RecordsMap
}) {
  const today = new Date()
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))

  // Sample records if none are provided (demo)
  const fallback: RecordsMap = useMemo(() => {
    const demo: RecordsMap = {}
    // Mark some random days for demo
    const base = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    for (let i = 1; i <= 28; i += 3) {
      const d = new Date(base.getFullYear(), base.getMonth(), i)
      demo[formatISO(d)] = "present"
    }
    for (let i = 2; i <= 26; i += 7) {
      const d = new Date(base.getFullYear(), base.getMonth(), i)
      demo[formatISO(d)] = "absent"
    }
    for (let i = 5; i <= 20; i += 10) {
      const d = new Date(base.getFullYear(), base.getMonth(), i)
      demo[formatISO(d)] = "leave"
    }
    return demo
  }, [viewDate])

  const data = records ?? fallback

  const firstDayIndex = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()

  const days: { date: Date; iso: string; status: DayStatus }[] = useMemo(() => {
    const arr: { date: Date; iso: string; status: DayStatus }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d)
      const iso = formatISO(date)
      const status = data[iso] ?? "unmarked"
      arr.push({ date, iso, status })
    }
    return arr
  }, [viewDate, daysInMonth, data])

  const totals = useMemo(() => {
    return days.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) as number
        acc[d.status]++
        return acc
      },
      { present: 0, absent: 0, leave: 0, unmarked: 0 } as Record<DayStatus, number>,
    )
  }, [days])

  const isTodayMonth = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()

  function gotoPrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  function gotoNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  function gotoToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">{monthLabel(viewDate)}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={gotoPrevMonth} aria-label="Previous month">
              {"<"}
            </Button>
            <Button variant="outline" size="sm" onClick={gotoToday} aria-label="Go to current month">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={gotoNextMonth} aria-label="Next month">
              {">"}
            </Button>
          </div>
        </div>

        {/* Legend and totals */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <LegendDot colorClass="bg-[hsl(var(--chart-1))]" label={`Present (${totals.present})`} />
          <LegendDot colorClass="bg-destructive" label={`Absent (${totals.absent})`} />
          <LegendDot colorClass="bg-amber-500" label={`On Leave (${totals.leave})`} />
          <LegendDot colorClass="bg-muted" label={`Unmarked (${totals.unmarked})`} />
          {isTodayMonth && <span className="ml-auto text-xs text-muted-foreground">Showing current month</span>}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
          {weekdayLabels.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`pad-${i}`} className="h-16 rounded-md border bg-background/50" aria-hidden />
          ))}
          {days.map(({ date, iso, status }) => {
            const isToday = formatISO(date) === formatISO(today)
            return (
              <div
                key={iso}
                className={cn(
                  "flex h-16 flex-col items-center justify-center rounded-md border",
                  isToday && "ring-2 ring-primary/50",
                )}
                aria-label={`${date.getDate()} ${monthLabel(viewDate)}: ${status}`}
              >
                <div className="text-sm">{date.getDate()}</div>
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 h-2.5 w-2.5 rounded-full",
                    status === "present"
                      ? "bg-[hsl(var(--chart-1))]"
                      : status === "absent"
                        ? "bg-destructive"
                        : status === "leave"
                          ? "bg-amber-500"
                          : "bg-muted",
                  )}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function LegendDot({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("inline-block h-2.5 w-2.5 rounded-full", colorClass)} />
      <span>{label}</span>
    </div>
  )
}
