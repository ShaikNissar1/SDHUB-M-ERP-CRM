"use client"

import { useCourses } from "@/lib/courses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentCoursesPage() {
  const courses = useCourses()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-2">View your enrolled courses</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course}>
            <CardHeader>
              <CardTitle className="text-lg">{course}</CardTitle>
              <CardDescription>Active course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Progress: 0%</p>
                <p className="mt-2">Instructor: TBD</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
