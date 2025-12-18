"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeacherKpiCards from "@/components/teacher/teacher-kpi-cards"
import TeacherHeaderSection from "@/components/teacher/teacher-header-section"
import StudentPerformancePanel from "@/components/teacher/student-performance-panel"
import TeacherBatchOverview from "@/components/teacher/teacher-batch-overview"
import TeacherCommunicationPanel from "@/components/teacher/teacher-communication-panel"
import StudentsTable from "@/components/teacher/students-table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const attendanceTrend = [
  { day: "Mon", rate: 92 },
  { day: "Tue", rate: 88 },
  { day: "Wed", rate: 94 },
  { day: "Thu", rate: 90 },
  { day: "Fri", rate: 95 },
]

export default function TeacherDashboardPage() {
  return (
    <main className="flex flex-col gap-6">
      <TeacherHeaderSection />

      <TeacherKpiCards />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="communication">Messages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Attendance Trend (This Week)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[240px]"
                  config={{
                    rate: { label: "Attendance %", color: "hsl(var(--chart-1))" },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--color-rate)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: "09:00 AM", course: "Maths - Batch A", room: "Room 201" },
                  { time: "11:30 AM", course: "Physics - Batch B", room: "Room 105" },
                  { time: "02:00 PM", course: "Chemistry - Batch C", room: "Lab 2" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.course}</p>
                      <p className="text-muted-foreground text-sm">{c.room}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{c.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-balance">My Students</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentsTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <StudentPerformancePanel />
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          <TeacherBatchOverview />
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <TeacherCommunicationPanel />
        </TabsContent>
      </Tabs>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Link href="/(app)/teacher/attendance">
          <Button variant="secondary">Mark Attendance</Button>
        </Link>
        <Link href="/(app)/teacher/performance">
          <Button variant="secondary">Manage Tests</Button>
        </Link>
        <Link href="/(app)/teacher/assignments">
          <Button variant="secondary">Assignments</Button>
        </Link>
        <Link href="/(app)/teacher/reports">
          <Button>Generate Reports</Button>
        </Link>
      </div>
    </main>
  )
}
