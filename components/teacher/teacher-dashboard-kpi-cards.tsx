"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, ClipboardList } from "lucide-react"

export default function TeacherDashboardKpiCards() {
  // Mock data - replace with actual data fetching logic
  const kpiData = {
    myBatches: 3,
    totalStudents: 45,
    todaysSessions: 2,
    pendingAssignments: 8,
  }

  const stats = [
    {
      label: "My Batches",
      value: kpiData.myBatches,
      icon: BookOpen,
      hint: "Active batches assigned",
    },
    {
      label: "Total Students",
      value: kpiData.totalStudents,
      icon: Users,
      hint: "Students under my guidance",
    },
    {
      label: "Today's Sessions",
      value: kpiData.todaysSessions,
      icon: Calendar,
      hint: "Classes scheduled today",
    },
    {
      label: "Pending Assignments",
      value: kpiData.pendingAssignments,
      icon: ClipboardList,
      hint: "Awaiting evaluation",
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-2">{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}