"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, ClipboardList } from "lucide-react"
import { useTeacher } from "@/lib/contexts/teacher-context"
import { createBrowserClient } from "@/lib/supabase/client"

export default function TeacherDashboardKpiCards() {
  const { selectedTeacher } = useTeacher()
  const [myBatches, setMyBatches] = useState<number>(0)
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [todaysSessions, setTodaysSessions] = useState<number>(0)
  const [pendingAssignments, setPendingAssignments] = useState<number>(0)

  useEffect(() => {
    async function fetchKpis() {
      if (!selectedTeacher?.id) {
        setMyBatches(0)
        setTotalStudents(0)
        setTodaysSessions(0)
        setPendingAssignments(0)
        return
      }

      const supabase = createBrowserClient()

      try {
        // 1) find batches assigned to this teacher
        const { data: btData, error: btError } = await supabase
          .from("batch_teachers")
          .select("batch_id, batch: batches(id, name, start_date, end_date)")
          .eq("teacher_id", selectedTeacher.id)

        if (btError) {
          console.warn("[v0] Could not load teacher batches:", btError)
          setMyBatches(0)
        }

        const batchEntries = btData || []
        setMyBatches(batchEntries.length)

        const batchIds = batchEntries.map((b: any) => b.batch_id).filter(Boolean)

        // 2) total students across those batches
        if (batchIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("id, batch_id")
            .in("batch_id", batchIds)

          if (studentsError) {
            console.warn("[v0] Could not load students for teacher batches:", studentsError)
            setTotalStudents(0)
          } else {
            const uniqueStudents = new Set((studentsData || []).map((s: any) => s.id))
            setTotalStudents(uniqueStudents.size)
          }
        } else {
          setTotalStudents(0)
        }

        // 3) today's scheduled sessions for these batches
        if (batchIds.length > 0) {
          const todayName = new Date().toLocaleString("en-US", { weekday: "long" }) // e.g., "Monday"
          const { data: sched, error: schedError } = await supabase
            .from("batch_schedule")
            .select("id, batch_id, day_of_week, start_time, end_time")
            .in("batch_id", batchIds)
            .eq("day_of_week", todayName)

          if (schedError) {
            console.warn("[v0] Could not load batch schedules:", schedError)
            setTodaysSessions(0)
          } else {
            setTodaysSessions((sched || []).length)
          }
        } else {
          setTodaysSessions(0)
        }

        // 4) pending assignments (module assignments where this teacher is assigned)
        const { data: assignData, error: assignError } = await supabase
          .from("batch_module_assignments")
          .select("id")
          .contains("teacher_ids", [selectedTeacher.id])

        if (assignError) {
          console.warn("[v0] Could not load module assignments:", assignError)
          setPendingAssignments(0)
        } else {
          setPendingAssignments((assignData || []).length)
        }
      } catch (err) {
        console.error("[v0] Error fetching teacher KPIs:", err)
        setMyBatches(0)
        setTotalStudents(0)
        setTodaysSessions(0)
        setPendingAssignments(0)
      }
    }

    fetchKpis()
  }, [selectedTeacher?.id])

  const stats = [
    { label: "My Batches", value: myBatches, icon: BookOpen, hint: "Active batches assigned" },
    { label: "Total Students", value: totalStudents, icon: Users, hint: "Students under my guidance" },
    { label: "Today's Sessions", value: todaysSessions, icon: Calendar, hint: "Classes scheduled today" },
    { label: "Pending Assignments", value: pendingAssignments, icon: ClipboardList, hint: "Awaiting evaluation" },
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