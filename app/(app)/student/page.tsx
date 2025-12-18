"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StudentKpiCards from "@/components/student/student-kpi-cards"
import PerformanceChart from "@/components/student/performance-chart"
import { Progress } from "@/components/ui/progress"

export default function StudentDashboardPage() {
  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your attendance, performance, and certificates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/(app)/student/attendance">
            <Button variant="secondary">Attendance</Button>
          </Link>
          <Link href="/(app)/student/performance">
            <Button variant="secondary">Performance</Button>
          </Link>
          <Link href="/(app)/student/resources">
            <Button variant="secondary">Resources</Button>
          </Link>
          <Link href="/(app)/student/certificates">
            <Button>Certificates</Button>
          </Link>
        </div>
      </header>

      <StudentKpiCards />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Maths</span>
                <span className="text-muted-foreground">72%</span>
              </div>
              <Progress value={72} className="mt-1" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Physics</span>
                <span className="text-muted-foreground">56%</span>
              </div>
              <Progress value={56} className="mt-1" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Chemistry</span>
                <span className="text-muted-foreground">81%</span>
              </div>
              <Progress value={81} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
