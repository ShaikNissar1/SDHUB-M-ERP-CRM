"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type StudentRecord = {
  id: string
  name: string
  email: string
  phone: string
  course?: string
  batchNumber?: string
  batchStart?: string
  batchEnd?: string
  status?: string
  admissionDate?: string
  dob?: string
  gender?: string
  address?: string
}

export default function StudentBasicInfo({ student }: { student: StudentRecord }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{student.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{student.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone Number</p>
            <p className="font-medium">{student.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium">{student.dob || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">{student.gender || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{student.address || "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enrollment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Student ID</p>
            <p className="font-medium">{student.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course Enrolled</p>
            <p className="font-medium">{student.course || "Not assigned"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Batch Name / ID</p>
            <p className="font-medium">{student.batchNumber || "Not assigned"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">
              {student.batchStart && student.batchEnd ? `${student.batchStart} – ${student.batchEnd}` : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Admission Date</p>
            <p className="font-medium">{student.admissionDate || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <Badge variant="default">{student.status || "Active"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
