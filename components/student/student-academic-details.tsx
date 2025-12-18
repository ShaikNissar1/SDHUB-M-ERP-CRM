"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type StudentRecord = {
  entranceExamScore?: number
  mainExamScore?: number
  certificatesUploaded?: number
  attendancePercentage?: number
  remarks?: string
}

export default function StudentAcademicDetails({ student }: { student: StudentRecord }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Exam Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exam Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Entrance Exam Score</p>
            <p className="text-2xl font-semibold">{student.entranceExamScore || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Main Exam Score</p>
            <p className="text-2xl font-semibold">{student.mainExamScore || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Certificates Uploaded</p>
            <p className="text-2xl font-semibold">{student.certificatesUploaded || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Remarks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance & Remarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Attendance Percentage</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={student.attendancePercentage || 0} className="flex-1" />
              <span className="text-sm font-medium">{student.attendancePercentage || 0}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remarks / Performance Notes</p>
            <p className="font-medium mt-2">{student.remarks || "No remarks yet"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
