"use client"

import TeacherKpiCards from "@/components/teacher/teacher-kpi-cards"
import { TeachersTable } from "@/components/tables/teachers-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeachersPage() {
  return (
    <main className="grid gap-6">
      <TeacherKpiCards />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Teachers & Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <TeachersTable />
        </CardContent>
      </Card>
    </main>
  )
}
