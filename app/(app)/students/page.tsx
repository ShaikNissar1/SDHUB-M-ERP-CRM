"use client"

import { StudentsTable } from "@/components/tables/students-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddRecordsDialog } from "@/components/students/add-records-dialog"
import { useSearchParams } from "next/navigation"

export default function StudentsPage() {
  const search = useSearchParams()
  const courseFilter = search.get("course") ?? undefined

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Student Records</CardTitle>
            {courseFilter && (
              <p className="text-sm text-muted-foreground mt-1">Currently viewing: {courseFilter} Students</p>
            )}
          </div>
          <AddRecordsDialog />
        </CardHeader>
        <CardContent>
          <StudentsTable courseFilter={courseFilter} />
        </CardContent>
      </Card>
    </main>
  )
}
