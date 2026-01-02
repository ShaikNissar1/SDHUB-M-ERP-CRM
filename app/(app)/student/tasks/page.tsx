"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@supabase/ssr"
import { formatDistanceToNow, isPast, parseISO } from "date-fns"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: string
  completed_at: string | null
  assigned_by_name: string | null
  task: {
    title: string
    description: string | null
    due_date: string | null
  }
}

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Get current student ID
      const { data: studentData } = await supabase.from("students").select("id").limit(1).single()

      if (!studentData) return

      const { data, error } = await supabase
        .from("student_tasks")
        .select(`
          id,
          status,
          completed_at,
          task:tasks (
            title,
            description,
            due_date
          )
        `)
        .eq("student_id", studentData.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTasks((data as any) || [])
    } catch (error) {
      console.error("[v0] Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTaskStatus(taskId: string, currentStatus: string) {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const newStatus = currentStatus === "pending" ? "completed" : "pending"
      const completed_at = newStatus === "completed" ? new Date().toISOString() : null

      const { error } = await supabase
        .from("student_tasks")
        .update({ status: newStatus, completed_at })
        .eq("id", taskId)

      if (error) throw error

      // Refresh tasks
      fetchTasks()
    } catch (error) {
      console.error("[v0] Error updating task:", error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "pending") return task.status === "pending"
    if (filter === "completed") return task.status === "completed"
    if (filter === "overdue") {
      return task.status === "pending" && task.task.due_date && isPast(parseISO(task.task.due_date))
    }
    return true
  })

  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const completedCount = tasks.filter((t) => t.status === "completed").length
  const overdueCount = tasks.filter(
    (t) => t.status === "pending" && t.task.due_date && isPast(parseISO(t.task.due_date)),
  ).length

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">My Tasks</h1>
        <p className="text-muted-foreground">Track and manage your assigned tasks</p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {filter === "completed"
                    ? "No completed tasks yet"
                    : filter === "overdue"
                      ? "No overdue tasks"
                      : "No tasks assigned yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.status === "pending" && task.task.due_date && isPast(parseISO(task.task.due_date))

              return (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold">{task.task.title}</CardTitle>
                        {task.task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.task.description}</p>
                        )}
                      </div>
                      {task.status === "completed" ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {task.task.due_date && (
                        <div>
                          Due:{" "}
                          {formatDistanceToNow(parseISO(task.task.due_date), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                      {task.completed_at && (
                        <div>
                          Completed:{" "}
                          {formatDistanceToNow(parseISO(task.completed_at), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
