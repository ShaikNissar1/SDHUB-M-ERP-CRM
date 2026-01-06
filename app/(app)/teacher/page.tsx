"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TeacherDashboardKpiCards from "@/components/teacher/teacher-dashboard-kpi-cards"
import { Clock, Bell, ArrowRight } from "lucide-react"

export default function TeacherDashboardPage() {
  // Mock data - replace with actual data fetching logic
  const teacherName = "Dr. Sarah Johnson"
  const specialization = "Computer Science & Data Structures"

  const todaysClasses = [
    {
      batchName: "CS-2024-A",
      courseName: "Data Structures & Algorithms",
      timeSlot: "09:00 AM - 11:00 AM",
    },
    {
      batchName: "CS-2024-B",
      courseName: "Advanced Programming",
      timeSlot: "02:00 PM - 04:00 PM",
    },
  ]

  const pendingTasks = [
    {
      id: "1",
      studentName: "John Doe",
      assignment: "Binary Tree Implementation",
      submittedDate: "2024-01-02",
      dueDate: "2024-01-05",
    },
    {
      id: "2",
      studentName: "Jane Smith",
      assignment: "Sorting Algorithms Analysis",
      submittedDate: "2024-01-01",
      dueDate: "2024-01-04",
    },
    {
      id: "3",
      studentName: "Mike Johnson",
      assignment: "Graph Traversal Project",
      submittedDate: "2023-12-30",
      dueDate: "2024-01-03",
    },
  ]

  const notifications = [
    {
      id: "1",
      type: "admin",
      message: "New batch CS-2024-C has been assigned to you",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      type: "system",
      message: "Exam schedule for mid-term has been updated",
      timestamp: "1 day ago",
      unread: false,
    },
    {
      id: "3",
      type: "admin",
      message: "Please review the updated curriculum guidelines",
      timestamp: "3 days ago",
      unread: false,
    },
  ]

  return (
    <main className="flex flex-col gap-6">
      {/* Welcome Card */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Welcome back, {teacherName}!</h1>
        <p className="text-muted-foreground mt-1">{specialization}</p>
      </header>

      {/* KPI Cards */}
      <TeacherDashboardKpiCards />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No classes scheduled for today
              </div>
            ) : (
              <div className="space-y-3">
                {todaysClasses.map((classItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{classItem.batchName}</p>
                      <p className="text-sm text-muted-foreground truncate">{classItem.courseName}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {classItem.timeSlot}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Pending Tasks</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {pendingTasks.length} assignments awaiting evaluation
              </p>
            </div>
            <Link href="/teacher/assignments">
              <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary/10">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-foreground">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No pending assignments at the moment.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium line-clamp-1">{task.assignment}</p>
                        <p className="text-xs text-muted-foreground">by {task.studentName}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Submitted
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {task.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications at the moment
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    notification.unread ? "bg-primary/5 border-primary/20" : "bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                    </div>
                    <Badge
                      variant={notification.type === "admin" ? "default" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {notification.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Link href="/teacher/attendance">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">Mark Attendance</p>
              <p className="text-sm text-muted-foreground mt-1">Record student attendance</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/assignments">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">Assignments</p>
              <p className="text-sm text-muted-foreground mt-1">Review and grade submissions</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/students">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">My Students</p>
              <p className="text-sm text-muted-foreground mt-1">View student profiles</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/teacher/batches">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <p className="font-semibold">My Batches</p>
              <p className="text-sm text-muted-foreground mt-1">Manage assigned batches</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
