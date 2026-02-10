"use client"

import { useTeacher } from "@/lib/contexts/teacher-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

export function TeacherSelector() {
  const { selectedTeacher, setSelectedTeacher, teachers, isLoading } = useTeacher()

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
          <span className="text-sm font-medium text-gray-700">Testing as:</span>
        </div>

        <Select
          value={selectedTeacher?.id || ""}
          onValueChange={(value) => {
            const teacher = teachers.find((t) => t.id === value)
            if (teacher) {
              setSelectedTeacher(teacher)
              console.log("[v0] Switched to teacher:", teacher.name)
            }
          }}
        >
          <SelectTrigger className="w-[320px] bg-white">
            <SelectValue placeholder="Select a teacher..." />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={(teacher as any).photo_url || "/placeholder.svg"} alt={teacher.name} />
                    <AvatarFallback className="text-xs">{teacher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-xs text-muted-foreground">{(teacher as any).subject || teacher.email || teacher.contact || ""}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTeacher && (
          <div className="ml-auto text-sm text-muted-foreground">{(selectedTeacher as any).email || (selectedTeacher as any).contact}</div>
        )}
      </div>
    </Card>
  )
}
