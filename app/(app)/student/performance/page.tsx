"use client"

import PerformanceChart from "@/components/student/performance-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const tests = [
  { name: "Algebra Test", score: 78, feedback: "Good effort, revise quadratics" },
  { name: "Mechanics Quiz", score: 85, feedback: "Strong fundamentals" },
  { name: "Organic Chem", score: 72, feedback: "Practice reaction mechanisms" },
]

export default function StudentPerformancePage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Performance</h1>
        <p className="text-muted-foreground">Track your scores and feedback over time.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.score}</TableCell>
                    <TableCell className="text-muted-foreground">{t.feedback}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
