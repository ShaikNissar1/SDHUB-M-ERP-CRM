"use client"

import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import React from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Download, Printer } from "lucide-react"
import { getAttendanceByPerson } from "@/lib/supabase/attendance"
import type { Attendance } from "@/lib/supabase/types"

type AttendanceDay = {
  date: string
  status: "present" | "absent" | "late" | "leave"
  check_in?: string
  check_out?: string
  notes?: string
}

const STORAGE_KEY = "sdhub:attendance"

async function fetchAttendanceFromSupabase(personId: string, type: "student" | "teacher") {
  try {
    const records = await getAttendanceByPerson(personId, type)
    const entries: Record<string, Attendance> = {}
    records.forEach((rec) => {
      entries[rec.date] = rec
    })
    return entries
  } catch (error) {
    console.error("Error fetching attendance from Supabase:", error)
    return {}
  }
}

// helper to detect 'late' when present and check-in after threshold or notes mention late
function deriveStatusForDay(rec?: Attendance): AttendanceDay | undefined {
  if (!rec || !rec.status) return undefined

  let status: "present" | "absent" | "late" | "leave"

  if (rec.status === "On Leave") {
    status = "leave"
  } else if (rec.status === "Absent") {
    status = "absent"
  } else if (rec.status === "Present") {
    // late if check-in after 09:15 or notes contain 'late'
    const isLateByNote = (rec.notes || "").toLowerCase().includes("late")
    const isLateByTime = (() => {
      if (!rec.check_in) return false
      const [hh, mm] = rec.check_in.split(":").map((n) => Number(n))
      return hh > 9 || (hh === 9 && mm > 15)
    })()
    status = isLateByNote || isLateByTime ? "late" : "present"
  } else {
    return undefined
  }

  return {
    date: rec.date,
    status,
    check_in: rec.check_in,
    check_out: rec.check_out,
    notes: rec.notes,
  }
}

type Props = {
  personId: string
  personName: string
  type: "student" | "teacher"
}

export function AttendanceCalendarView({ personId, personName, type }: Props) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [statMode, setStatMode] = React.useState<"month" | "total">("month")
  const [loading, setLoading] = React.useState(false)
  const [allDays, setAllDays] = React.useState<AttendanceDay[]>([])

  React.useEffect(() => {
    async function loadAttendance() {
      setLoading(true)
      try {
        const entries = await fetchAttendanceFromSupabase(personId, type)

        const days: AttendanceDay[] = []
        Object.entries(entries).forEach(([date, rec]) => {
          const dayData = deriveStatusForDay(rec)
          if (dayData) {
            days.push(dayData)
          }
        })

        const sortedDays = days.sort((a, b) => (a.date < b.date ? -1 : 1))
        setAllDays(sortedDays)
      } catch (error) {
        console.error("Error loading attendance:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [personId, type])

  const { year, month } = React.useMemo(() => {
    const [y, m] = selectedMonth.split("-")
    const parsedYear = Number.parseInt(y)
    const parsedMonth = Number.parseInt(m)
    return { year: parsedYear, month: parsedMonth }
  }, [selectedMonth])

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const lastDayOfMonth = new Date(year, month - 1, daysInMonth).getDay()
  const trailingEmpty = (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7

  const attendanceMap = React.useMemo(() => {
    const map: Record<string, AttendanceDay> = {}
    allDays.forEach((d) => {
      map[d.date] = d
    })
    return map
  }, [allDays, selectedMonth])

  function countSundaysInMonth(y: number, m: number) {
    let count = 0
    for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) {
      const wd = new Date(y, m - 1, d).getDay()
      if (wd === 0) count++
    }
    return count
  }

  const monthStats = React.useMemo(() => {
    const filtered = allDays.filter((d) => d.date.startsWith(selectedMonth))
    const present = filtered.filter((d) => d.status === "present").length
    const late = filtered.filter((d) => d.status === "late").length
    const absent = filtered.filter((d) => d.status === "absent").length
    const leave = filtered.filter((d) => d.status === "leave").length
    const holidays = countSundaysInMonth(year, month)
    const totalMarked = filtered.length
    const effectivePresent = present + late
    const percentage = totalMarked > 0 ? ((effectivePresent / totalMarked) * 100).toFixed(1) : "0.0"
    return { present, late, absent, leave, holidays, percentage }
  }, [allDays, selectedMonth, year, month])

  const totalStats = React.useMemo(() => {
    const present = allDays.filter((d) => d.status === "present").length
    const late = allDays.filter((d) => d.status === "late").length
    const absent = allDays.filter((d) => d.status === "absent").length
    const leave = allDays.filter((d) => d.status === "leave").length
    return { present, late, absent, leave }
  }, [allDays])

  const displayStats = statMode === "month" ? monthStats : totalStats

  const monthOptions = React.useMemo(() => {
    const months = []
    const today = new Date()

    if (allDays.length > 0) {
      const earliestDate = new Date(allDays[0].date)
      const latestDate = new Date(allDays[allDays.length - 1].date)

      const startDate =
        earliestDate < new Date(today.getFullYear(), today.getMonth(), 1)
          ? earliestDate
          : new Date(today.getFullYear(), today.getMonth() - 11, 1)

      const endDate = latestDate > today ? latestDate : today

      const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      while (currentMonth <= endDate) {
        const value = currentMonth.toISOString().slice(0, 7)
        const label = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        months.push({ value, label })
        currentMonth.setMonth(currentMonth.getMonth() + 1)
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const value = d.toISOString().slice(0, 7)
        const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        months.push({ value, label })
      }
    }

    return months.reverse()
  }, [allDays])

  function getStatusColor(status?: string) {
    switch (status) {
      case "present":
        return "bg-emerald-500"
      case "late":
        return "bg-amber-500"
      case "absent":
        return "bg-red-500"
      case "leave":
        return "bg-blue-500"
      default:
        return "bg-muted"
    }
  }

  function goPrevMonth() {
    const d = new Date(year, month - 2, 1)
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    setSelectedMonth(newMonth)
  }
  function goNextMonth() {
    const d = new Date(year, month, 1)
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    setSelectedMonth(newMonth)
  }
  function goToday() {
    const today = new Date().toISOString().slice(0, 7)
    setSelectedMonth(today)
  }

  function downloadCSV() {
    const rows = [["Date", "Status", "Check-In", "Check-Out", "Notes"]]
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const day = attendanceMap[dateStr]

      rows.push([dateStr, day?.status ?? "", day?.check_in ?? "", day?.check_out ?? "", day?.notes ?? ""])
    }
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${personName}-${selectedMonth}-attendance.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadPDF() {
    window.print()
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const monthLabel = React.useMemo(
    () => new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    [year, month],
  )

  const handleMonthChange = React.useCallback(
    (newMonth: string) => {
      setSelectedMonth(newMonth)
    },
    [selectedMonth],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading attendance data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-pretty">
          {personName} — {monthLabel}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="KPI options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setStatMode("month")}>This Month Attendance</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatMode("total")}>Total Attendance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {statMode === "month" ? "Present (mo.)" : "Present (total)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-600">
            {(() => {
              const present = "present" in displayStats ? Number((displayStats as any).present || 0) : 0
              const late = "late" in displayStats ? Number((displayStats as any).late || 0) : 0
              return present + late
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Absent</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">{displayStats.absent}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Late</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-600">
            {"late" in displayStats ? (displayStats as any).late : 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">On Leave</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-blue-600">{displayStats.leave ?? 0}</CardContent>
        </Card>
        <Card className="hidden md:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Holidays (Sun)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {statMode === "month" ? ((displayStats as any).holidays ?? 0) : "-"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Attendance %</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{displayStats.percentage}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={goPrevMonth} variant="outline" size="sm" aria-label="Previous month">
            {"<"}
          </Button>
          <Button onClick={goToday} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={goNextMonth} variant="outline" size="sm" aria-label="Next month">
            {">"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-7 text-xs text-muted-foreground">
          <div className="text-center py-1">Sun</div>
          <div className="text-center py-1">Mon</div>
          <div className="text-center py-1">Tue</div>
          <div className="text-center py-1">Wed</div>
          <div className="text-center py-1">Thu</div>
          <div className="text-center py-1">Fri</div>
          <div className="text-center py-1">Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`lead-${idx}`} className="min-h-[110px] rounded-md border bg-muted/30" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const wd = new Date(year, month - 1, day).getDay()
            const isSunday = wd === 0
            const isToday = dateStr === todayStr
            const status = attendanceMap[dateStr]?.status
            const statusBg =
              status === "present"
                ? "bg-emerald-50"
                : status === "late"
                  ? "bg-amber-50"
                  : status === "absent"
                    ? "bg-red-50"
                    : status === "leave"
                      ? "bg-blue-50"
                      : isSunday
                        ? "bg-muted/40"
                        : "bg-background"

            return (
              <div
                key={dateStr}
                className={`min-h-[110px] rounded-md border p-2 flex flex-col justify-between ${statusBg} ${
                  isToday ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  {status ? <span className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} /> : null}
                </div>
                <div className="text-xs">
                  {status ? (
                    <span
                      className={
                        status === "present"
                          ? "text-emerald-700"
                          : status === "late"
                            ? "text-amber-700"
                            : status === "absent"
                              ? "text-red-700"
                              : "text-blue-700"
                      }
                    >
                      {status === "present"
                        ? "Present"
                        : status === "late"
                          ? "Late"
                          : status === "absent"
                            ? "Absent"
                            : "On Leave"}
                    </span>
                  ) : isSunday ? (
                    <span className="text-muted-foreground">Sunday</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            )
          })}
          {Array.from({ length: trailingEmpty }).map((_, idx) => (
            <div key={`trail-${idx}`} className="min-h-[110px] rounded-md border bg-muted/30" />
          ))}
        </div>
      </div>
    </div>
  )
}
