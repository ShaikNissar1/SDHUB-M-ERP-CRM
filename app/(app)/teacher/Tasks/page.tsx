"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, MessageSquare } from "lucide-react"

const taskData = [
  {
    id: 1,
    module: "Module 1: Basics",
    task: "Create a marketing plan",
    dueDate: "2024-02-15",
    submitted: 18,
    total: 25,
    grade: "Pending",
  },
  {
    id: 2,
    module: "Module 2: Advanced",
    task: "Case study analysis",
    dueDate: "2024-02-20",
    submitted: 12,
    total: 25,
    grade: "Graded",
  },
  {
    id: 3,
    module: "Module 1: Basics",
    task: "Research project",
    dueDate: "2024-02-10",
    submitted: 25,
    total: 25,
    grade: "Graded",
  },
]

export default function TeacherTasksPage() {
  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2">Create and manage student tasks</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.module}</TableCell>
                    <TableCell>{row.task}</TableCell>
                    <TableCell>{new Date(row.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {row.submitted}/{row.total}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          row.grade === "Graded"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }
                      >
                        {row.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
