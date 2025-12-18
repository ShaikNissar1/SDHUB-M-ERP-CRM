"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type StudentRecord = {
  attendancePercentage?: number
}

export default function StudentAttendanceOverview({ student }: { student: StudentRecord }) {
  // Mock attendance data - in a real app, this would come from the database
  const attendanceData = [
    { date: "2024-01-15", status: "Present" },
    { date: "2024-01-16", status: "Present" },
    { date: "2024-01-17", status: "Absent" },
    { date: "2024-01-18", status: "Present" },
    { date: "2024-01-19", status: "Late" },
    { date: "2024-01-20", status: "Holiday" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge variant="default">Present</Badge>
      case "Absent":
        return <Badge variant="destructive">Absent</Badge>
      case "Late":
        return <Badge variant="secondary">Late</Badge>
      case "Holiday":
        return <Badge variant="outline">Holiday</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Attendance Percentage</span>
              <span className="text-2xl font-semibold">{student.attendancePercentage || 0}%</span>
            </div>
            <Progress value={student.attendancePercentage || 0} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceData.map((record, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                <span className="text-sm font-medium">{record.date}</span>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sundays and holidays are automatically marked off. Your attendance is synced daily from the calendar system.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
