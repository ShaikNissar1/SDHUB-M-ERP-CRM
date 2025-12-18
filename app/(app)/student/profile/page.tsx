"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentBasicInfo from "@/components/student/student-basic-info"
import StudentAcademicDetails from "@/components/student/student-academic-details"
import StudentCourseProgress from "@/components/student/student-course-progress"
import StudentAttendanceOverview from "@/components/student/student-attendance-overview"
import StudentDocuments from "@/components/student/student-documents"

type StudentRecord = {
  id: string
  name: string
  email: string
  phone: string
  course?: string
  batchNumber?: string
  batchStart?: string
  batchEnd?: string
  status?: "Active" | "Completed" | "Dropped" | "On Hold"
  admissionDate?: string
  dob?: string
  gender?: string
  address?: string
  photo?: string
  entranceExamScore?: number
  mainExamScore?: number
  certificatesUploaded?: number
  attendancePercentage?: number
  remarks?: string
}

const STORAGE_KEY = "sdhub:student-records"

function readCurrentStudent(): StudentRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const list = JSON.parse(raw) as StudentRecord[]
    // For now, return the first student (in a real app, this would be the logged-in user)
    return list.length > 0 ? list[0] : null
  } catch {
    return null
  }
}

export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStudent = () => {
      const data = readCurrentStudent()
      setStudent(data)
      setLoading(false)
    }

    loadStudent()
    window.addEventListener("student-records:changed" as any, loadStudent as any)
    return () => window.removeEventListener("student-records:changed" as any, loadStudent as any)
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No student profile found. Please add a student record first.</p>
      </div>
    )
  }

  const calculateStatus = (batchEnd?: string, currentStatus?: string): string => {
    if (!batchEnd) return currentStatus || "Active"
    const endDate = new Date(batchEnd)
    const today = new Date()
    if (today > endDate && currentStatus !== "Dropped" && currentStatus !== "On Hold") {
      return "Completed"
    }
    return currentStatus || "Active"
  }

  const currentStatus = calculateStatus(student.batchEnd, student.status)

  return (
    <main className="flex flex-col gap-6">
      {/* Header with Student Name and Status */}
      <header className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {student.photo && (
            <img
              src={student.photo || "/placeholder.svg"}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{student.name}</h1>
            <p className="text-muted-foreground">Student ID: {student.id}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={
                  currentStatus === "Active" ? "default" : currentStatus === "Completed" ? "secondary" : "outline"
                }
              >
                {currentStatus}
              </Badge>
              <span className="text-sm text-muted-foreground">{student.course}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs for different sections */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <StudentBasicInfo student={student} />
        </TabsContent>

        {/* Academic & Exam Details Tab */}
        <TabsContent value="academic" className="space-y-4">
          <StudentAcademicDetails student={student} />
        </TabsContent>

        {/* Course Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <StudentCourseProgress student={student} />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <StudentAttendanceOverview student={student} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <StudentDocuments student={student} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
