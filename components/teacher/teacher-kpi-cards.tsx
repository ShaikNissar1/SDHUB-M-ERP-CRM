"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, Gauge, Layers3, BookOpen } from "lucide-react"
import { getTeachers, type Teacher } from "@/lib/teachers"
import { getBatches } from "@/lib/batches"
import { useEffect, useMemo, useState } from "react"

export default function TeacherKpiCards() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [batchesHandled, setBatchesHandled] = useState<number>(0)
  const [coursesAssigned, setCoursesAssigned] = useState<number>(0)

  useEffect(() => {
    const load = () => {
      const t = getTeachers()
      setTeachers(t)
      const bs = getBatches?.() || []

      const activeBatchesWithTeachers = bs.filter(
        (b: any) =>
          (b.status === "Active" || b.isActive) &&
          (b.moduleAssignments || []).some((m: any) => (m.teachers || []).length > 0),
      )
      setBatchesHandled(activeBatchesWithTeachers.length)

      const assignedCourses = new Set(
        bs
          .filter((b: any) => (b.moduleAssignments || []).some((m: any) => (m.teachers || []).length > 0))
          .map((b: any) => b.course),
      )
      setCoursesAssigned(assignedCourses.size)
    }
    load()
    const onChange = () => load()
    window.addEventListener("teachers:changed", onChange)
    window.addEventListener("batches:changed" as any, onChange as any) // refresh when batches change
    return () => {
      window.removeEventListener("teachers:changed", onChange)
      window.removeEventListener("batches:changed" as any, onChange as any)
    }
  }, [])

  const total = teachers.length
  const active = teachers.filter((t) => (t.status ?? "active") === "active").length
  const avgRating = useMemo(() => {
    const ratings = teachers.map((t) => t.rating ?? 0).filter((n) => n > 0)
    if (!ratings.length) return "—"
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
    return `${avg.toFixed(1)} / 5`
  }, [teachers])

  const stats = [
    { label: "Total Teachers", value: total, icon: Users, hint: "All staff" },
    { label: "Active Trainers", value: active, icon: BookOpen, hint: "Status: Active" },
    { label: "Average Rating", value: avgRating, icon: Gauge, hint: "Across staff" },
    { label: "Batches Handled", value: batchesHandled, icon: Layers3, hint: "Ongoing" },
    { label: "Courses Assigned", value: coursesAssigned, icon: BookOpen, hint: "Distinct" },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((s) => (
        <Card key={s.label} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-foreground/60" />
            </div>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.hint}</div>
            </div>
            <Separator className="h-10 w-[2px] bg-(--border)" />
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
