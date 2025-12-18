"use client"

import ReportsPanel from "@/components/teacher/reports-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeacherReportsPage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">Generate attendance or performance reports for your batches.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsPanel />
        </CardContent>
      </Card>
    </main>
  )
}
