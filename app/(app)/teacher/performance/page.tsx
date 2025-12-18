"use client"

import TestsTable from "@/components/teacher/tests-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeacherPerformancePage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Performance & Tests</h1>
        <p className="text-muted-foreground">
          Create tests and record scores. Average performance is auto-calculated (local state).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <TestsTable />
        </CardContent>
      </Card>
    </main>
  )
}
