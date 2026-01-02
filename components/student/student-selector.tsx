"use client"

import { useStudent } from "@/lib/contexts/student-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { User, GraduationCap } from "lucide-react"

export function StudentSelector() {
  const { selectedStudent, setSelectedStudent, students, isLoading } = useStudent()

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-10 bg-muted rounded" />
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Testing as:</span>
        </div>

        <Select
          value={selectedStudent?.id || ""}
          onValueChange={(value) => {
            const student = students.find((s) => s.id === value)
            if (student) {
              setSelectedStudent(student)
              console.log("[v0] Switched to student:", student.name)
            }
          }}
        >
          <SelectTrigger className="w-[300px] bg-white">
            <SelectValue placeholder="Select a student..." />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.course_name} • {student.batch_id}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedStudent && <div className="ml-auto text-sm text-muted-foreground">{selectedStudent.email}</div>}
      </div>
    </Card>
  )
}
