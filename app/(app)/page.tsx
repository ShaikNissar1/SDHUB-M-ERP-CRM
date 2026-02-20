"use client"

import { useEffect, useState } from "react"

import { KPICards } from "@/components/cards/kpi-cards"
import { LeadStatusDonut } from "@/components/charts/lead-status-donut"
import { EnquiriesByCourseBar } from "@/components/charts/enquiries-per-course-bar"
import { EnquiriesOverTimeLine } from "@/components/charts/enquiries-over-time-line"
import { AttendancePerCourseBar } from "@/components/charts/attendance-per-course-bar"
// import { EnrollmentPerCourseDonut } from "@/components/charts/enrollment-per-course-donut"
// import { TopPerformingCoursesBar } from "@/components/charts/top-performing-courses-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"
import { BatchHighlights } from "@/components/batches/batch-highlights"

export default function Page() {
  const [isMounted, setIsMounted] = useState(false)
  const [dueToday, setDueToday] = useState(0)
  const { leads } = useSupabaseLeads()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setDueToday(leads.filter((l) => l.next_follow_up_date === today).length)
  }, [leads])

  return (
    <main className="grid gap-6">
      <Link href="/enquiries?filter=due-today">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle>Follow-Ups Due Today</CardTitle>
            <p className="text-xs text-muted-foreground">Leads scheduled for contact today</p>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-semibold tabular-nums">{isMounted ? dueToday : "—"}</div>
            <span className="underline text-sm">View All</span>
          </CardContent>
        </Card>
      </Link>
      <KPICards />
      <BatchHighlights />
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <p className="text-xs text-muted-foreground">Distribution across pipeline for the current period</p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <LeadStatusDonut />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enquiries per Course</CardTitle>
            <p className="text-xs text-muted-foreground">Top-of-funnel volume by program</p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <EnquiriesByCourseBar />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enquiries Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">Trend of enquiries received over the past months</p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <EnquiriesOverTimeLine />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment per Course</CardTitle>
            <p className="text-xs text-muted-foreground">Student enrollment distribution across courses</p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {/* <EnrollmentPerCourseDonut /> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance per Course</CardTitle>
            <p className="text-xs text-muted-foreground">Average attendance rates by course</p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <AttendancePerCourseBar />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
            <p className="text-xs text-muted-foreground">Courses ranked by enrollment and completion metrics</p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {/* <TopPerformingCoursesBar /> */}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
