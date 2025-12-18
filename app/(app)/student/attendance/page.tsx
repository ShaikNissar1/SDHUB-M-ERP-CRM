"use client"

import AttendanceCalendar from "@/components/student/attendance-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentAttendancePage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Attendance</h1>
        <p className="text-muted-foreground">View your daily attendance records.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceCalendar />
        </CardContent>
      </Card>
    </main>
  )
}
