"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  UsersIcon,
  PhoneCallIcon,
  CheckCircle2Icon,
  Layers3Icon,
  CalendarCheck2Icon,
  MoreVerticalIcon,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { AnyLead } from "@/lib/leads"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"
import { useSupabaseBatches } from "@/hooks/use-supabase-batches"
import { getSupabaseClient } from "@/lib/supabase/client"

type Range = "today" | "week" | "month"

const CONTACTED_STATUSES = new Set([
  "HR Called",
  "Visited",
  "Exam Written",
  "Pending Final Exam",
  "Final Exam Written",
  "Admitted",
  "Rejected",
])

function aggregate(leads: AnyLead[]) {
  const total = leads.length
  let contacted = 0
  let admitted = 0
  for (const l of leads) {
    const s = (l.status as string) || "New Enquiry"
    if (CONTACTED_STATUSES.has(s)) contacted++
    if (s === "Admitted") admitted++
  }
  const notContacted = Math.max(0, total - contacted)
  return { total, contacted, notContacted, admitted }
}

function aggregateLeads(leads: any[]) {
  const total = leads.length
  let contacted = 0
  let admitted = 0
  for (const l of leads) {
    const s = (l.status as string) || "New Enquiry"
    if (CONTACTED_STATUSES.has(s)) contacted++
    if (s === "Admitted") admitted++
  }
  const notContacted = Math.max(0, total - contacted)
  return { total, contacted, notContacted, admitted }
}

function getByRange(monthly: number, range: Range) {
  if (range === "today") return Math.max(0, Math.round(monthly / 30))
  if (range === "week") return Math.max(0, Math.round((monthly / 30) * 7))
  return monthly
}

// Attendance store: reuse key from attendance page
const ATTENDANCE_STORAGE_KEY = "sdhub:attendance"
type AttendanceRecord = { status?: "Present" | "Absent" | "On Leave" }
function readAttendanceToday() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY)
    if (!raw) return { present: 0, total: 0 }
    const store = JSON.parse(raw) as Record<string, AttendanceRecord>
    const today = new Date().toISOString().slice(0, 10)
    let present = 0
    let total = 0
    for (const [key, rec] of Object.entries(store)) {
      // key shape: type:id:YYYY-MM-DD
      const dateStr = key.split(":").pop()
      if (dateStr === today) {
        total++
        if (rec?.status === "Present") present++
      }
    }
    return { present, total }
  } catch {
    return { present: 0, total: 0 }
  }
}

function countActiveStudents(includeCompleted: boolean): number {
  try {
    const raw = localStorage.getItem("sdhub:student-records")
    if (!raw) return 0
    const records = JSON.parse(raw) as Array<{ status?: string }>
    return records.filter((r) => includeCompleted || r.status !== "Completed").length
  } catch {
    return 0
  }
}

function filterLeadsByDateRange(leads: any[], range: Range) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return leads.filter((lead) => {
    if (!lead.created_at) return false
    const leadDate = new Date(lead.created_at)

    if (range === "today") return leadDate >= startOfToday
    if (range === "week") return leadDate >= startOfWeek
    if (range === "month") return leadDate >= startOfMonth
    return true
  })
}

export function KPICards() {
  // Track if component has mounted on client to avoid hydration mismatch
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // ranges for chips
  const [leadsView, setLeadsView] = React.useState<"contacted" | "notContacted">("contacted")
  const [enquiriesRange, setEnquiriesRange] = React.useState<Range>("month")
  const [leadsRange, setLeadsRange] = React.useState<Range>("month")
  const [includeCompleted, setIncludeCompleted] = React.useState(false)

  const { leads: supabaseLeads } = useSupabaseLeads()
  const { batches: supabaseBatches } = useSupabaseBatches()

  const [{ total, contacted, notContacted, admitted }, setAgg] = React.useState(() => ({
    total: 0,
    contacted: 0,
    notContacted: 0,
    admitted: 0,
  }))

  React.useEffect(() => {
    console.log("[v0] KPI: Updating aggregates with leads count:", supabaseLeads.length)
    const filteredByRange = filterLeadsByDateRange(supabaseLeads, leadsRange)
    setAgg(aggregateLeads(filteredByRange))
  }, [supabaseLeads, leadsRange])

  const [admittedFromSupabase, setAdmittedFromSupabase] = React.useState(0)
  React.useEffect(() => {
    const fetchAdmitted = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: students,
          error,
          count,
        } = await supabase.from("students").select("id", { count: "exact", head: false })

        if (!error && students) {
          console.log("[v0] Total admitted students from students table:", students.length)
          setAdmittedFromSupabase(students.length)
        } else if (error) {
          console.error("[v0] Error fetching admitted students:", error)
        }
      } catch (err) {
        console.error("[v0] Error fetching admitted students:", err)
      }
    }

    fetchAdmitted()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel("students-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => {
        console.log("[v0] Students table changed, refreshing admitted count")
        fetchAdmitted()
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[v0] Subscribed to students table changes")
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  // live active courses via batches
  const activeCoursesCount = React.useMemo(() => {
    console.log("[v0] Computing active courses from batches:", supabaseBatches.length)
    const set = new Set<string>()
    for (const b of supabaseBatches) {
      if (b.status === "Active") {
        console.log("[v0] Active batch found:", b.name, "Course ID:", b.course_id)
        set.add(b.course_id)
      }
    }
    console.log("[v0] Total active courses:", set.size)
    return set.size
  }, [supabaseBatches])

  // live attendance today
  const [{ present, total: attTotal }, setAtt] = React.useState(readAttendanceToday)
  React.useEffect(() => {
    const recompute = () => setAtt(readAttendanceToday())
    recompute()
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === ATTENDANCE_STORAGE_KEY) recompute()
    }
    const onCustom = () => recompute()
    window.addEventListener("storage", onStorage)
    window.addEventListener("attendance:updated" as any, onCustom as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("attendance:updated" as any, onCustom as any)
    }
  }, [])

  const [activeStudents, setActiveStudents] = React.useState(() => countActiveStudents(includeCompleted))
  React.useEffect(() => {
    const recompute = () => setActiveStudents(countActiveStudents(includeCompleted))
    recompute()
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "sdhub:student-records") recompute()
    }
    const onRecordsChanged = () => recompute()
    window.addEventListener("storage", onStorage)
    window.addEventListener("student-records:changed" as any, onRecordsChanged as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("student-records:changed" as any, onRecordsChanged as any)
    }
  }, [includeCompleted])

  const totalEnquiriesN = filterLeadsByDateRange(supabaseLeads, enquiriesRange).length

  const leadsContactedN = filterLeadsByDateRange(supabaseLeads, leadsRange).filter((lead: any) =>
    CONTACTED_STATUSES.has((lead.status as string) || "New Enquiry"),
  ).length
  const leadsNotContactedN = filterLeadsByDateRange(supabaseLeads, leadsRange).filter(
    (lead: any) => !CONTACTED_STATUSES.has((lead.status as string) || "New Enquiry"),
  ).length

  const finalAdmittedCount = admittedFromSupabase > 0 ? admittedFromSupabase : admitted

  // Use isMounted to render placeholder values during hydration, actual values after
  const displayTilesData = isMounted
    ? [
        { title: "Total Enquiries", value: totalEnquiriesN.toLocaleString(), delta: +0.0, icon: UsersIcon as any },
        {
          title: "Leads Contacted",
          value: (leadsView === "contacted" ? leadsContactedN : leadsNotContactedN).toLocaleString(),
          delta: +0.0,
          icon: PhoneCallIcon as any,
        },
        {
          title: "Students Admitted",
          value: finalAdmittedCount.toLocaleString(),
          delta: +0.0,
          icon: CheckCircle2Icon as any,
        },
        { title: "Active Courses", value: activeCoursesCount.toString(), delta: +0.0, icon: Layers3Icon as any },
        {
          title: "Attendance Today",
          value: attTotal > 0 ? `${present}/${attTotal}` : "0/0",
          delta: +0.0,
          icon: CalendarCheck2Icon as any,
        },
        { title: "Active Students", value: activeStudents.toString(), delta: +0.0, icon: UsersIcon as any },
      ]
    : [
        { title: "Total Enquiries", value: "—", delta: +0.0, icon: UsersIcon as any },
        {
          title: "Leads Contacted",
          value: "—",
          delta: +0.0,
          icon: PhoneCallIcon as any,
        },
        {
          title: "Students Admitted",
          value: "—",
          delta: +0.0,
          icon: CheckCircle2Icon as any,
        },
        { title: "Active Courses", value: "—", delta: +0.0, icon: Layers3Icon as any },
        {
          title: "Attendance Today",
          value: "—",
          delta: +0.0,
          icon: CalendarCheck2Icon as any,
        },
        { title: "Active Students", value: "—", delta: +0.0, icon: UsersIcon as any },
      ]

  const tiles = displayTilesData as const

  return (
    // ensure 2-up on mobile
    <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {tiles.map((t, i) => {
        const isLeads = t.title === "Leads Contacted"
        const isEnquiries = t.title === "Total Enquiries"
        const isActiveCourses = t.title === "Active Courses"
        const isAttendance = t.title === "Attendance Today"
        const isAdmitted = t.title === "Students Admitted"
        const isActiveStudents = t.title === "Active Students"

        return (
          <Card
            key={i}
            className="overflow-hidden border border-border/70 hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="pb-2 border-b bg-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CardTitle className="text-sm font-medium text-pretty truncate">
                    {isLeads && leadsView === "notContacted" ? "Leads Not Contacted" : t.title}
                  </CardTitle>

                  {isEnquiries && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm"
                          aria-label="Enquiries range options"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setEnquiriesRange("today")}>Today</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEnquiriesRange("week")}>This Week</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEnquiriesRange("month")}>This Month</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {isLeads && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm"
                          aria-label="Leads view and range"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[12rem]">
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">Type</div>
                        <DropdownMenuItem onClick={() => setLeadsView("contacted")}>Contacted</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLeadsView("notContacted")}>Not Contacted</DropdownMenuItem>
                        <div className="px-2 pt-2 pb-1.5 text-xs text-muted-foreground">Timeframe</div>
                        <DropdownMenuItem onClick={() => setLeadsRange("today")}>Today</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLeadsRange("week")}>This Week</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLeadsRange("month")}>This Month</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {isActiveStudents && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm"
                          aria-label="Student filter options"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setIncludeCompleted(false)}>Active Only</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIncludeCompleted(true)}>Include Completed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                  <t.icon className="h-4 w-4" />
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {isEnquiries && <span className="rounded px-1.5 py-0.5 bg-muted">{enquiriesRange}</span>}
                {isLeads && (
                  <>
                    <span className="rounded px-1.5 py-0.5 bg-muted">{leadsView}</span>
                    <span className="rounded px-1.5 py-0.5 bg-muted">{leadsRange}</span>
                  </>
                )}
                {isActiveStudents && (
                  <span className="rounded px-1.5 py-0.5 bg-muted">{includeCompleted ? "All" : "Active"}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="min-w-0 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="text-3xl font-semibold tracking-tight truncate tabular-nums">{t.value}</div>
                <div
                  className={
                    (t.delta >= 0 ? "text-emerald-600" : "text-red-600") +
                    " text-xs flex items-center font-medium whitespace-nowrap shrink-0 tabular-nums"
                  }
                >
                  {t.delta >= 0 ? (
                    <ArrowUpRightIcon className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ArrowDownRightIcon className="h-3.5 w-3.5 mr-1" />
                  )}
                  {Math.abs(t.delta)}%
                </div>
              </div>

              <div className="mt-2">
                {(isEnquiries || isLeads) && (
                  <Link
                    href={
                      isEnquiries
                        ? "/enquiries"
                        : leadsView === "contacted"
                          ? "/enquiries?status=HR%20Called"
                          : "/enquiries?status=New%20Enquiry"
                    }
                    className="text-xs underline underline-offset-2"
                  >
                    {isEnquiries
                      ? "Open Enquiries"
                      : leadsView === "contacted"
                        ? "View Contacted"
                        : "View Not Contacted"}
                  </Link>
                )}
                {isAdmitted && (
                  <Link href="/documents" className="text-xs underline underline-offset-2">
                    View Admitted Students
                  </Link>
                )}
                {isActiveCourses && (
                  <Link href="/courses?status=Active" className="text-xs underline underline-offset-2">
                    View Active Courses
                  </Link>
                )}
                {isAttendance && (
                  <Link href="/attendance" className="text-xs underline underline-offset-2">
                    Go to Attendance
                  </Link>
                )}
                {isActiveStudents && (
                  <Link href="/students" className="text-xs underline underline-offset-2">
                    View Students
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
