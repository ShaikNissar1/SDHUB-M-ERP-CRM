"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CalendarDaysIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useSupabaseCourses } from "@/lib/courses"
import { getTeachers } from "@/lib/teachers"
import { createBatch as createBatchSupabase, updateBatch as updateBatchSupabase } from "@/lib/supabase/batches"
import { getCourses } from "@/lib/supabase/courses"
import { makeDefaultBatchName } from "@/lib/batches"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

type Props = {
  onSubmit?: (payload: {
    course: string
    name: string
    startDate: string
    endDate: string
    trainer: string
    maxStudents?: number
    description?: string
    status?: "Active" | "Upcoming" | "Completed"
    moduleAssignments?: { moduleId: string; title: string; teachers: string[] }[]
  }) => void
  triggerClassName?: string
  isEdit?: boolean
  initialValues?: Partial<{
    id?: string // Added id field for editing
    course: string
    name: string
    startDate: string
    endDate: string
    trainer: string
    maxStudents: number
    description: string
    status: "Active" | "Upcoming" | "Completed"
    moduleAssignments: { moduleId: string; title: string; teachers: string[] }[]
    totalStudents?: number // Added totalStudents field
  }>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function AddBatchDialog({
  onSubmit,
  triggerClassName,
  isEdit,
  initialValues,
  open: openProp,
  onOpenChange,
  trigger,
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const router = useRouter()

  const [course, setCourse] = React.useState(initialValues?.course ?? "")
  const [name, setName] = React.useState(initialValues?.name ?? "")
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    initialValues?.startDate ? new Date(initialValues.startDate) : undefined,
  )
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    initialValues?.endDate ? new Date(initialValues.endDate) : undefined,
  )
  const [trainer, setTrainer] = React.useState(initialValues?.trainer ?? "") // kept for payload compatibility
  const [maxStudents, setMaxStudents] = React.useState<number | undefined>(initialValues?.maxStudents)
  const [description, setDescription] = React.useState(initialValues?.description ?? "")
  const [status, setStatus] = React.useState<"Active" | "Upcoming" | "Completed">(initialValues?.status ?? "Upcoming")
  const [nameEdited, setNameEdited] = React.useState<boolean>(Boolean(initialValues?.name))

  const [moduleAssignments, setModuleAssignments] = React.useState<
    { moduleId: string; title: string; teachers: string[] }[]
  >(initialValues?.moduleAssignments ?? [])

  const { courses: supabaseCourses } = useSupabaseCourses()
  const courseNames = supabaseCourses.map((c) => c.name)
  const teachers = React.useMemo(() => getTeachers(), [])

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [coursesList, setCoursesList] = React.useState<Array<{ id: string; name: string }>>([])

  React.useEffect(() => {
    async function loadCourses() {
      const courses = await getCourses()
      setCoursesList(courses.map((c) => ({ id: c.id, name: c.name })))
    }
    if (open) {
      loadCourses()
    }
  }, [open])

  React.useEffect(() => {
    if (!nameEdited && course) {
      const iso = startDate ? formatLocalYMD(startDate) : undefined
      setName(makeDefaultBatchName(course, iso))
    }
  }, [course, startDate, nameEdited])

  function formatLocalYMD(d?: Date) {
    if (!d) return undefined as unknown as string
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  function toggleTeacher(modId: string, teacherName: string, checked: boolean) {
    setModuleAssignments((prev) =>
      prev.map((m) =>
        m.moduleId === modId
          ? {
              ...m,
              teachers: checked
                ? Array.from(new Set([...(m.teachers || []), teacherName]))
                : (m.teachers || []).filter((t) => t !== teacherName),
            }
          : m,
      ),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!startDate || !endDate) {
        setError("Please select both start and end dates")
        setSaving(false)
        return
      }

      const startISO = formatLocalYMD(startDate)
      const endISO = formatLocalYMD(endDate)

      const calculateStatus = (start: string, end: string): "Active" | "Upcoming" | "Completed" => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)

        if (today < startDate) return "Upcoming"
        if (today > endDate) return "Completed"
        return "Active"
      }

      // Find the course ID
      const selectedCourse = coursesList.find((c) => c.name === course)
      if (!selectedCourse) {
        setError("Please select a valid course")
        setSaving(false)
        return
      }

      const calculatedStatus = calculateStatus(startISO, endISO)

      const batchData = {
        course_id: selectedCourse.id,
        course_name: course,
        name: name?.trim() || (startDate ? makeDefaultBatchName(course, startISO) : name),
        start_date: startISO,
        end_date: endISO,
        trainer_name: trainer,
        max_students: maxStudents,
        description,
        status: calculatedStatus,
      }

      console.log("[v0] Submitting batch data:", batchData)

      if (isEdit && initialValues?.id) {
        // Update existing batch
        console.log("[v0] Updating batch:", initialValues.id, batchData)
        await updateBatchSupabase(initialValues.id, batchData)
        console.log("[v0] Batch updated successfully")
      } else {
        // Create new batch - createBatch will generate the proper ID
        const batchDataWithTempId = {
          id: `temp-${crypto.randomUUID()}`,
          ...batchData,
          total_students: 0,
        }
        console.log("[v0] Creating batch:", batchDataWithTempId)
        const result = await createBatchSupabase(batchDataWithTempId)
        console.log("[v0] Batch created:", result)
      }

      // Call the original onSubmit if provided (for backward compatibility)
      onSubmit?.({
        course,
        name: batchData.name,
        startDate: startISO,
        endDate: endISO,
        trainer,
        maxStudents,
        description,
        status: calculatedStatus,
        moduleAssignments,
      })

      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error("[v0] Error saving batch:", err)
      setError(err instanceof Error ? err.message : "Failed to save batch")
    } finally {
      setSaving(false)
    }
  }

  function addModule() {
    setModuleAssignments((prev) => [
      ...prev,
      { moduleId: `custom-${crypto.randomUUID()}`, title: "New Module", teachers: [] },
    ])
  }
  function renameModule(modId: string, title: string) {
    setModuleAssignments((prev) => prev.map((m) => (m.moduleId === modId ? { ...m, title } : m)))
  }
  function removeModule(modId: string) {
    setModuleAssignments((prev) => prev.filter((m) => m.moduleId !== modId))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className={cn("gap-2", triggerClassName)} size="sm">
            {!isEdit && <PlusIcon className="h-4 w-4" />}
            {isEdit ? "Edit Batch" : "Add Batch"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Batch" : "Add Batch"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[min(70vh,640px)] pr-1">
          {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}
          <form id="batch-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger className="w-full truncate">
                  <SelectValue placeholder="Choose course" />
                </SelectTrigger>
                <SelectContent>
                  {courseNames.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batch Name</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameEdited(true)
                }}
                placeholder="e.g., B4"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start bg-transparent w-full">
                    <CalendarDaysIcon className="mr-2 h-4 w-4" />
                    {startDate ? startDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 z-[1100]">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start bg-transparent w-full">
                    <CalendarDaysIcon className="mr-2 h-4 w-4" />
                    {endDate ? endDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 z-[1100]">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Max Students</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="e.g., 30"
                value={maxStudents ?? ""}
                onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label>Modules & Teachers</Label>
              <div className="flex flex-col gap-4">
                {moduleAssignments.length === 0 && (
                  <p className="text-sm text-muted-foreground">Select a course to load its modules, or add your own.</p>
                )}
                {moduleAssignments.map((m) => {
                  const selected = m.teachers || []
                  const selectedLabel = selected.length ? selected.join(", ") : "Select teachers"
                  return (
                    <div key={m.moduleId} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={m.title}
                          onChange={(e) => renameModule(m.moduleId, e.target.value)}
                          placeholder="Module title"
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeModule(m.moduleId)}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="justify-between bg-transparent w-full">
                              <span className="truncate">{selectedLabel}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-64 max-h-64 overflow-auto">
                            {teachers.map((t) => {
                              const isChecked = selected.includes(t.name)
                              return (
                                <DropdownMenuCheckboxItem
                                  key={`${m.moduleId}-${t.id}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => toggleTeacher(m.moduleId, t.name, Boolean(checked))}
                                  className="capitalize"
                                >
                                  {t.name}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}

                <div>
                  <Button type="button" variant="secondary" onClick={addModule} className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Module
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description / Notes</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>

            {/* Removed status selection from form */}
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button type="submit" form="batch-form" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Batch"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
