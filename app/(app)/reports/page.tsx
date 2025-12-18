"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnquiriesByCourseBar } from "@/components/charts/enquiries-per-course-bar"
import { LeadStatusDonut } from "@/components/charts/lead-status-donut"
import { DownloadIcon } from "lucide-react"

export default function ReportsPage() {
  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Student Attendance Report
        </Button>
        <Button variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Teacher Performance Report
        </Button>
        <Button variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" />
          Enquiries & Admissions Summary
        </Button>
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadStatusDonut />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enquiries per Course</CardTitle>
          </CardHeader>
          <CardContent>
            <EnquiriesByCourseBar />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
