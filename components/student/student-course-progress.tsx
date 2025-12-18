"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type StudentRecord = {
  course?: string
}

export default function StudentCourseProgress({ student }: { student: StudentRecord }) {
  // Mock course progress data - in a real app, this would come from the database
  const courseModules = [
    { name: "Module 1: Fundamentals", completed: 100 },
    { name: "Module 2: Advanced Concepts", completed: 75 },
    { name: "Module 3: Practical Applications", completed: 45 },
    { name: "Module 4: Capstone Project", completed: 0 },
  ]

  const totalCompleted = Math.round(courseModules.reduce((sum, m) => sum + m.completed, 0) / courseModules.length)

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{student.course || "Course"}</span>
              <span className="text-sm font-semibold">{totalCompleted}%</span>
            </div>
            <Progress value={totalCompleted} />
          </div>
        </CardContent>
      </Card>

      {/* Module-wise Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module-wise Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseModules.map((module, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">{module.name}</span>
                <span className="text-muted-foreground">{module.completed}%</span>
              </div>
              <Progress value={module.completed} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Next lesson: Advanced Concepts - Lesson 3</p>
            <p className="text-muted-foreground">Scheduled for: Tomorrow at 2:00 PM</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
