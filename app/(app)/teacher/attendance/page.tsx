"use client"

import TeacherAttendanceMark from "@/components/teacher/attendance-mark"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeacherAttendancePage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Attendance</h1>
        <p className="text-muted-foreground">Mark attendance for your classes. Changes are local (no backend yet).</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherAttendanceMark />
        </CardContent>
      </Card>
    </main>
  )
}
