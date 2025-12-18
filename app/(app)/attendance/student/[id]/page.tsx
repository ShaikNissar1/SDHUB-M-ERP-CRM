"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AttendanceCalendarView } from "@/components/attendance/attendance-calendar-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function StudentAttendanceDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const sp = useSearchParams()
  const personName = sp.get("name") || params.id

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/attendance">
            <Button variant="outline" size="sm" aria-label="Back to attendance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-pretty">Student Attendance</h1>
            <p className="text-sm text-muted-foreground">Detailed calendar view with full functionality</p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            {personName}
            {personName !== params.id && (
              <span className="text-xs font-normal text-muted-foreground ml-2">({params.id})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceCalendarView personId={params.id} personName={personName} type="student" />
        </CardContent>
      </Card>
    </main>
  )
}
