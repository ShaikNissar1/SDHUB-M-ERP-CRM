"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCourse, updateCourse } from "@/lib/supabase/courses"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { addCourseDetails, type CourseModule, updateCourseDetails } from "@/lib/course-details"
import { getBatches, updateBatch } from "@/lib/batches"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { getTeachers } from "@/lib/teachers"
import { useRouter } from "next/navigation"

type Props = {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (o: boolean) => void
  initialValues?: Partial<{
    name: string
    description: string
    duration: string
    languages: string[]
    modules: { title: string; teacher?: string }[]
  }>
  mode?: "create" | "edit"
  originalName?: string
  detailsId?: string
}

export function AddCourseDialog({
  trigger,
  open,
  onOpenChange,
  initialValues,
  mode = "create",
  originalName,
  detailsId,
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const controlledOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const router = useRouter()

  const [name, setName] = React.useState(initialValues?.name ?? "")
  const [description, setDescription] = React.useState(initialValues?.description ?? "")
  const [duration, setDuration] = React.useState(initialValues?.duration ?? "")
  const [languages, setLanguages] = React.useState<string[]>(initialValues?.languages ?? [])
  const [languageInput, setLanguageInput] = React.useState("")
  const [modules, setModules] = React.useState<CourseModule[]>(
    (initialValues?.modules ?? [{ title: "", teacher: "" }]).map((m, i) => ({
      id: `${Date.now()}-${i}`,
      title: m.title,
      teacher: m.teacher,
    })),
  )

  const [teacherOptions, setTeacherOptions] = React.useState<string[]>([])
  React.useEffect(() => {
    if (controlledOpen) {
      try {
        const list = getTeachers()
        setTeacherOptions(Array.from(new Set(list.map((t) => (t.name || "").trim()).filter(Boolean))))
      } catch {
        setTeacherOptions([])
      }
    }
  }, [controlledOpen])

  React.useEffect(() => {
    if (controlledOpen) {
      setName((v) => initialValues?.name ?? v)
      setDescription((v) => initialValues?.description ?? v)
      setDuration((v) => initialValues?.duration ?? v)
      setLanguages(initialValues?.languages ?? languages)
      if (initialValues?.modules) {
        setModules(
          initialValues.modules.map((m, i) => ({
            id: `${Date.now()}-${i}`,
            title: m.title,
            teacher: m.teacher,
          })),
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledOpen])

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function addLanguage() {
    const v = languageInput.trim()
    if (!v) return
    if (!languages.some((l) => l.toLowerCase() === v.toLowerCase())) {
      setLanguages([...languages, v])
    }
    setLanguageInput("")
  }

  function removeLanguage(lang: string) {
    setLanguages(languages.filter((l) => l !== lang))
  }

  function addModule() {
    setModules((prev) => [...prev, { id: `${Date.now()}`, title: "", teacher: "" }])
  }

  function updateModule(id: string, patch: Partial<CourseModule>) {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function removeModule(id: string) {
    setModules((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const main = name.trim()
    if (!main) return

    setSaving(true)
    setError(null)

    try {
      const cleanModules = modules
        .map((m) => ({ title: m.title?.trim() || "", teacher: m.teacher?.trim() || "" }))
        .filter((m) => m.title.length > 0)

      const courseData = {
        name: main,
        description: description.trim() || undefined,
        duration: duration.trim() || undefined,
        languages: languages.length ? languages : undefined,
      }

      if (mode === "edit") {
        const targetId = detailsId

        if (targetId) {
          // Update existing course in Supabase
          await updateCourse(targetId, courseData)

          updateCourseDetails(targetId, {
            name: main,
            description: description.trim() || undefined,
            duration: duration.trim() || undefined,
            languages: languages.length ? languages : undefined,
            modules: cleanModules.map((m, i) => ({ id: `${Date.now()}-${i}`, ...m })),
          })
        } else {
          throw new Error("Course ID not found for editing")
        }

        if (originalName && originalName.trim().toLowerCase() !== main.toLowerCase()) {
          // Reflect rename in all batches
          const all = getBatches()
          for (const b of all) {
            if (b.course.toLowerCase() === originalName.trim().toLowerCase()) {
              updateBatch(b.id, { course: main })
            }
          }
        }

        setOpen(false)
        router.refresh()
        return
      }

      // Create mode - save to Supabase
      const result = await createCourse(courseData)

      if (result) {
        addCourseDetails({
          name: main,
          description: description.trim() || undefined,
          duration: duration.trim() || undefined,
          languages: languages.length ? languages : undefined,
          modules: cleanModules.map((m, i) => ({ id: `${Date.now()}-${i}`, ...m })),
        })

        setName("")
        setDescription("")
        setDuration("")
        setLanguages([])
        setModules([{ id: `${Date.now()}`, title: "", teacher: "" }])
        setOpen(false)
        router.refresh()
      } else {
        setError("Failed to create course. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Error saving course:", err)
      setError(err instanceof Error ? err.message : "Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={controlledOpen} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : open === undefined && mode === "create" ? (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <PlusIcon className="h-4 w-4" /> Add Course
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Course" : "Add Course"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}
          <form id="add-course-form" onSubmit={handleSubmit} className="grid gap-5">
            {/* Main Info */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Java Full Stack"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (optional)</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 6 months"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Briefly describe the course"
                />
              </div>
            </div>

            {/* Languages */}
            <div className="grid gap-2">
              <Label>Languages Covered (optional)</Label>
              <div className="flex flex-wrap items-center gap-2">
                {languages.map((lang) => (
                  <span key={lang} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                    {lang}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeLanguage(lang)}
                      aria-label={`Remove ${lang}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="e.g., English"
                  className="w-56"
                />
                <Button type="button" variant="secondary" onClick={addLanguage}>
                  Add Language
                </Button>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Suggestions:
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setLanguages(Array.from(new Set([...languages, "English"])))}
                  >
                    English
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setLanguages(Array.from(new Set([...languages, "Telugu"])))}
                  >
                    Telugu
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setLanguages(Array.from(new Set([...languages, "Hindi"])))}
                  >
                    Hindi
                  </button>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="grid gap-2">
              <Label>Modules / Topics</Label>
              <div className="grid gap-3">
                {modules.map((m) => (
                  <div key={m.id} className="grid gap-2 md:grid-cols-2 items-end">
                    <div className="grid gap-2">
                      <Label className="text-xs">Module / Topic</Label>
                      <Input
                        value={m.title}
                        onChange={(e) => updateModule(m.id, { title: e.target.value })}
                        placeholder="e.g., HTML"
                      />
                    </div>
                    <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                      <div className="grid gap-1">
                        <Label className="text-xs">Teacher (optional)</Label>
                        <Select
                          value={m.teacher ?? "Unassigned"}
                          onValueChange={(val) => updateModule(m.id, { teacher: val || "" })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unassigned">Unassigned</SelectItem>
                            {teacherOptions.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="md:ml-2"
                        onClick={() => removeModule(m.id)}
                        aria-label="Remove module"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div>
                  <Button type="button" variant="outline" className="gap-2 bg-transparent" onClick={addModule}>
                    <PlusIcon className="h-4 w-4" />
                    Add Module
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <DialogFooter>
          <Button type="submit" form="add-course-form" disabled={saving}>
            {saving ? "Saving..." : "Save Course"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
