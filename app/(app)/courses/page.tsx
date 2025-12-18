"use client"

import * as React from "react"
import { useSuperbaseCourses } from "@/hooks/use-supabase-courses"
import { deleteCourse as deleteCourseSupa } from "@/lib/supabase/courses"
import { useCourseDetails, type CourseDetails } from "@/lib/course-details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddCourseDialog } from "@/components/courses/add-course-dialog"
import Link from "next/link"
import type { Batch } from "@/lib/batches"
import { Badge } from "@/components/ui/badge"
import { BookOpen, PlayCircle, CalendarClock, Users, Search, ChevronDown, CheckCircle2Icon, Circle } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getBatches } from "@/lib/supabase/batches"

export default function CoursesPage() {
  const { courses: coursesData, loading: coursesLoading } = useSuperbaseCourses()
  const courses = React.useMemo(() => coursesData.map((c) => c.name), [coursesData])
  const details = useCourseDetails()
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [openAdd, setOpenAdd] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<string>("")
  const [deleting, setDeleting] = React.useState(false)

  const [editPayload, setEditPayload] = React.useState<{
    originalName: string
    detailsId?: string
    initialValues: {
      name: string
      description: string
      duration: string
      languages: string[]
      modules: { title: string; teacher?: string }[]
    }
  } | null>(null)

  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Active" | "Upcoming" | "Completed">("All")
  const [selectedForStatusToggle, setSelectedForStatusToggle] = React.useState<string | null>(null)
  const [togglingStatus, setTogglingStatus] = React.useState(false)

  const detailByName = React.useMemo(() => {
    const map = new Map<string, CourseDetails>()
    for (const d of details) map.set(d.name.toLowerCase(), d)
    return map
  }, [details])

  const [allBatches, setAllBatches] = React.useState<Batch[]>([])
  const [batchesLoading, setBatchesLoading] = React.useState(true)
  const [batchStudentCounts, setBatchStudentCounts] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    const fetchBatches = async () => {
      try {
        setBatchesLoading(true)

        const batchesData = await getBatches()

        // Convert to the format expected by the page
        const batches = batchesData.map((b: any) => ({
          id: b.id,
          course: b.course_name,
          name: b.batch_name || b.name,
          startDate: b.start_date,
          endDate: b.end_date,
          status: b.status, // Status is already calculated by getBatches()
          totalStudents: 0, // Will be updated by student count fetch
          trainer: b.trainer_name || "",
          maxStudents: b.max_students,
          description: b.description,
        }))

        setAllBatches(batches)

        // Fetch student counts for each batch
        const supabase = getSupabaseClient()
        const counts: Record<string, number> = {}
        for (const batch of batches) {
          try {
            const { count, error } = await supabase
              .from("students")
              .select("*", { count: "exact", head: true })
              .eq("batch_id", batch.id)

            counts[batch.id] = !error && count ? count : 0
          } catch {
            counts[batch.id] = 0
          }
        }

        setBatchStudentCounts(counts)
      } catch (err) {
        console.error("[v0] Error fetching batches:", err)
        setAllBatches([])
        setBatchStudentCounts({})
      } finally {
        setBatchesLoading(false)
      }
    }

    if (coursesLoading === false) {
      fetchBatches()
    }
  }, [coursesLoading])

  const activeBatches = React.useMemo(() => allBatches.filter((b) => b.status === "Active"), [allBatches])
  const upcomingBatches = React.useMemo(() => allBatches.filter((b) => b.status === "Upcoming"), [allBatches])

  const kpis = React.useMemo(() => {
    const totalCourses = courses.length
    const activeCoursesSet = new Set(activeBatches.map((b) => b.course))
    const activeCourses = activeCoursesSet.size
    // Use batchStudentCounts to get actual student counts
    const studentsAll = allBatches.reduce((sum, b) => sum + (batchStudentCounts[b.id] || 0), 0)
    const trainersAll = Array.from(new Set(allBatches.map((b) => b.trainer).filter(Boolean))).length
    return { totalCourses, activeCourses, studentsAll, trainersAll }
  }, [courses, activeBatches, allBatches, batchStudentCounts])

  type CourseCardData = {
    name: string
    status: "Active" | "Upcoming" | "Completed" | "Inactive"
    studentsNow: number
    trainers: string[]
    duration?: string
    description?: string
    languages?: string[]
    modules: { title: string; teacher?: string }[]
    totalStudentsEver: number
    totalBatches: number
    activeBatchesCount: number
    isActive?: boolean
    courseId: string
  }

  const courseCards: CourseCardData[] = React.useMemo(() => {
    const batchesByCourse = new Map<string, Batch[]>()
    for (const b of allBatches) {
      const arr = batchesByCourse.get(b.course) ?? []
      arr.push(b)
      batchesByCourse.set(b.course, arr)
    }
    return coursesData.map((c) => {
      const lower = c.name.toLowerCase()
      const d = detailByName.get(lower)
      const bs = batchesByCourse.get(c.name) ?? []
      const hasActive = bs.some((b) => b.status === "Active")
      const hasUpcoming = bs.some((b) => b.status === "Upcoming")
      const hasCompleted = bs.some((b) => b.status === "Completed")
      const status: CourseCardData["status"] = hasActive
        ? "Active"
        : hasUpcoming
          ? "Upcoming"
          : hasCompleted
            ? "Completed"
            : "Inactive"
      const studentsNow = bs
        .filter((b) => b.status === "Active")
        .reduce((sum, b) => sum + (batchStudentCounts[b.id] || 0), 0)
      const trainers = Array.from(new Set(bs.map((b) => b.trainer).filter(Boolean)))
      const totalStudentsEver = bs.reduce((sum, b) => sum + (batchStudentCounts[b.id] || 0), 0)
      const totalBatches = bs.length
      const activeBatchesCount = bs.filter((b) => b.status === "Active").length
      return {
        name: c.name,
        status,
        studentsNow,
        trainers,
        duration: d?.duration,
        description: d?.description,
        languages: d?.languages ?? [],
        modules: (d?.modules ?? []).map((m) => ({ title: m.title, teacher: m.teacher })),
        totalStudentsEver,
        totalBatches,
        activeBatchesCount,
        isActive: c.is_active ?? true,
        courseId: c.id,
      }
    })
  }, [allBatches, courses, detailByName, batchStudentCounts])

  const filteredCards = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return courseCards.filter((card) => {
      if (statusFilter !== "All" && card.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        card.name,
        card.duration ?? "",
        ...(card.languages ?? []),
        ...card.trainers,
        ...card.modules.map((m) => m.title),
        ...card.modules.map((m) => m.teacher ?? ""),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [courseCards, statusFilter, query])

  const activeSummaries = React.useMemo(() => {
    const map = new Map<
      string,
      {
        course: string
        batches: Batch[]
        totalStudents: number
        trainers: string[]
        startISO?: string
        endISO?: string
      }
    >()
    for (const b of activeBatches) {
      const key = b.course
      const curr = map.get(key) || {
        course: key,
        batches: [],
        totalStudents: 0,
        trainers: [],
        startISO: undefined,
        endISO: undefined,
      }
      curr.batches.push(b)
      curr.totalStudents += batchStudentCounts[b.id] || 0
      if (!curr.trainers.includes(b.trainer)) curr.trainers.push(b.trainer)
      curr.startISO = curr.startISO ? (b.startDate < curr.startISO ? b.startDate : curr.startISO) : b.startDate
      curr.endISO = curr.endISO ? (b.endDate > curr.endISO ? b.endDate : curr.endISO) : b.endDate
      map.set(key, curr)
    }
    return Array.from(map.values()).sort((a, b) => b.totalStudents - a.totalStudents)
  }, [activeBatches, batchStudentCounts])

  const search = useSearchParams() // initialize from URL once
  React.useEffect(() => {
    const s = (search.get("status") || "").trim()
    if (s === "Active" || s === "Upcoming" || s === "Completed" || s === "All") {
      setStatusFilter(s)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return

    // Find the actual course object to get its ID
    const courseToDelete = coursesData.find((c) => c.id === deleteTarget)
    if (!courseToDelete) {
      alert("Course not found")
      return
    }

    try {
      setDeleting(true)
      await deleteCourseSupa(courseToDelete.id) // Pass the ID, not the name
      setOpenDelete(false)
      setDeleteTarget("")
      router.refresh()
      // Refresh courses list
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      console.error("Error deleting course:", error)
      alert(`Error deleting course: ${error.message || "Unknown error"}`)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      setTogglingStatus(true)
      const { toggleCourseStatus } = await import("@/lib/supabase/courses")
      await toggleCourseStatus(courseId, !currentStatus)
      router.refresh()
      setSelectedForStatusToggle(null)
    } catch (error) {
      console.error("Error toggling course status:", error)
      alert("Failed to update course status")
    } finally {
      setTogglingStatus(false)
    }
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-pretty">Courses</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, language, or teacher"
                className="w-full sm:w-64 md:w-80 pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search courses"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(["All", "Active", "Upcoming", "Completed"] as const).map((opt) => (
                <Button
                  key={opt}
                  variant={statusFilter === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={() => setOpenAdd(true)}>
              <BookOpen className="h-4 w-4" />
              Add Course
            </Button>
            <Button variant="destructive" onClick={() => setOpenDelete(true)}>
              Delete Course
            </Button>
          </div>
        </div>
      </header>

      {coursesLoading && <div className="text-center py-8 text-muted-foreground">Loading courses...</div>}

      {!coursesLoading && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Courses</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-semibold">{kpis.totalCourses}</div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Active Courses</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-emerald-600">{kpis.activeCourses}</div>
                <PlayCircle className="h-5 w-5 text-emerald-600" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Students (All Courses)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-primary">{kpis.studentsAll}</div>
                <Users className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Trainers</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-semibold">{kpis.trainersAll}</div>
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((c) => {
              const statusColor =
                c.status === "Active"
                  ? "bg-emerald-600 text-white"
                  : c.status === "Upcoming"
                    ? "bg-amber-500 text-black"
                    : c.status === "Completed"
                      ? "bg-zinc-700 text-white"
                      : "bg-muted text-foreground"
              const d = detailByName.get(c.name.toLowerCase())

              return (
                <Card key={c.name} className="h-full overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{c.name}</CardTitle>
                      {d?.duration && <p className="text-sm text-muted-foreground mt-1">Duration: {d.duration}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-xs shrink-0 ${statusColor}`}>{c.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {c.description && <p className="text-muted-foreground line-clamp-3">{c.description}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground mb-1">Students Now</div>
                        <div className="text-lg font-semibold">{c.studentsNow}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Total Students (All time)</div>
                        <div className="text-lg font-semibold">{c.totalStudentsEver}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Total Batches</div>
                        <div className="text-lg font-semibold">{c.totalBatches}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Active Batches</div>
                        <div className="text-lg font-semibold">{c.activeBatchesCount}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground mb-1">Languages</div>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                          {(c.languages ?? []).length ? (
                            c.languages!.map((l) => (
                              <span key={l} className="inline-block rounded-full border px-2 py-0.5 text-xs">
                                {l}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <div className="text-muted-foreground mb-1">Teachers</div>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                          {c.trainers.length ? (
                            c.trainers.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <details className="group">
                          <summary className="flex items-center justify-between cursor-pointer select-none">
                            <span className="text-muted-foreground">Modules & Teachers</span>
                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="mt-2 max-h-32 overflow-y-auto pr-2 rounded-md border bg-muted/30">
                            <ul className="list-disc list-inside space-y-1 p-2">
                              {c.modules.length ? (
                                c.modules.map((m, idx) => (
                                  <li key={`${m.title}-${idx}`} className="truncate">
                                    <span className="font-medium">{m.title}</span>
                                    {m.teacher ? (
                                      <span className="text-muted-foreground">
                                        {" — "}
                                        {m.teacher}
                                      </span>
                                    ) : null}
                                  </li>
                                ))
                              ) : (
                                <span className="text-muted-foreground">No modules added yet.</span>
                              )}
                            </ul>
                          </div>
                        </details>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t">
                      <div className="flex flex-wrap gap-2 min-w-0">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/batches?filterCourse=${encodeURIComponent(c.name)}`}>View Batches</Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm" title="Create a new batch for this course">
                          <Link href={`/batches?prefillCourse=${encodeURIComponent(c.name)}&new=1`}>New Batch</Link>
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={c.isActive ? "default" : "outline"}
                          onClick={() => handleToggleStatus(c.courseId, c.isActive)}
                          disabled={togglingStatus}
                          className="gap-1"
                        >
                          {c.isActive ? (
                            <>
                              <CheckCircle2Icon className="h-4 w-4" />
                              Active
                            </>
                          ) : (
                            <>
                              <Circle className="h-4 w-4" />
                              Inactive
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditPayload({
                              originalName: c.name,
                              detailsId: c.courseId,
                              initialValues: {
                                name: c.name,
                                description: d?.description || "",
                                duration: d?.duration || "",
                                languages: d?.languages || [],
                                modules: (d?.modules || []).map((m) => ({ title: m.title, teacher: m.teacher })),
                              },
                            })
                            setOpenEdit(true)
                          }}
                        >
                          Edit Course
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {filteredCards.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No courses match your filters.
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}

      <AddCourseDialog open={openAdd} onOpenChange={setOpenAdd} />
      {editPayload && (
        <AddCourseDialog
          mode="edit"
          open={openEdit}
          onOpenChange={setOpenEdit}
          originalName={editPayload.originalName}
          detailsId={editPayload.detailsId}
          initialValues={editPayload.initialValues}
        />
      )}

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course to delete:</label>
              <Select value={deleteTarget} onValueChange={setDeleteTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesData.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {deleteTarget && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                <p className="font-medium mb-2">This will delete:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The course and all associated batches</li>
                  <li>All exams linked to this course</li>
                  <li>All course modules and materials</li>
                </ul>
                <p className="mt-2 text-xs text-yellow-700">This action cannot be undone.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!deleteTarget || deleting}>
              {deleting ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
