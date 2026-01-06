"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AttendanceTable } from "@/components/teacher/attendance-table"
import { Save, Calendar } from "lucide-react"

interface Student {
  id: string
  name: string
  rollNumber: string
}

interface AttendanceRecord {
  studentId: string
  status: "Present" | "Absent" | "Leave"
}

interface Batch {
  id: string
  name: string
  course: string
}

export default function TeacherAttendancePage() {
  // Mock data - replace with actual data fetching logic
  const batches: Batch[] = [
    { id: "batch-1", name: "CS-2024-A", course: "Computer Science Fundamentals" },
    { id: "batch-2", name: "CS-2024-B", course: "Data Structures & Algorithms" },
    { id: "batch-3", name: "CS-2024-C", course: "Web Development" },
    { id: "batch-4", name: "CS-2024-D", course: "Database Management" },
  ]

  const mockStudents: Student[] = [
    { id: "1", name: "John Doe", rollNumber: "CS001" },
    { id: "2", name: "Jane Smith", rollNumber: "CS002" },
    { id: "3", name: "Mike Johnson", rollNumber: "CS003" },
    { id: "4", name: "Sarah Wilson", rollNumber: "CS004" },
    { id: "5", name: "David Brown", rollNumber: "CS005" },
    { id: "6", name: "Emma Davis", rollNumber: "CS006" },
    { id: "7", name: "Chris Miller", rollNumber: "CS007" },
    { id: "8", name: "Lisa Garcia", rollNumber: "CS008" },
  ]

  const [selectedBatchId, setSelectedBatchId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])

  const selectedBatch = batches.find(b => b.id === selectedBatchId)

  const handleAttendanceChange = (studentId: string, status: "Present" | "Absent" | "Leave") => {
    setAttendance(prev => {
      const existing = prev.find(a => a.studentId === studentId)
      if (existing) {
        return prev.map(a => a.studentId === studentId ? { ...a, status } : a)
      } else {
        return [...prev, { studentId, status }]
      }
    })
  }

  const handleSave = () => {
    // UI only - no actual save logic
    console.log("Saving attendance:", { batchId: selectedBatchId, date: selectedDate, attendance })
  }

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">
          Mark attendance for your assigned batches
        </p>
      </header>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Batch</label>
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} - {batch.course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="relative">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {selectedBatch && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Selected:</span> {selectedBatch.name} - {selectedBatch.course}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      {selectedBatchId ? (
        <>
          <AttendanceTable
            students={mockStudents}
            attendance={attendance}
            onAttendanceChange={handleAttendanceChange}
          />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a batch to mark attendance</p>
              <p className="text-sm">Choose a batch from the dropdown above to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
