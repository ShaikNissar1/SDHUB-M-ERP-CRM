"use client"

import { useTeacher } from "@/lib/contexts/teacher-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

export function TeacherSelector() {
  const { selectedTeacher, setSelectedTeacher, teachers, isLoading } = useTeacher()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading teachers...</span>
      </div>
    )
  }

  if (teachers.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-sm text-muted-foreground">No teachers available</span>
      </div>
    )
  }

  return (
    <Select
      value={selectedTeacher?.id || ""}
      onValueChange={(value) => {
        const teacher = teachers.find((t) => t.id === value)
        if (teacher) {
          setSelectedTeacher(teacher)
          console.log("[v0] Selected teacher:", teacher.name)
        }
      }}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a teacher" />
      </SelectTrigger>
      <SelectContent>
        {teachers.map((teacher) => (
          <SelectItem key={teacher.id} value={teacher.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={teacher.photo_url || "/placeholder.svg"} alt={teacher.name} />
                <AvatarFallback className="text-xs">{teacher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{teacher.name}</span>
                <span className="text-xs text-muted-foreground">{teacher.subject}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
