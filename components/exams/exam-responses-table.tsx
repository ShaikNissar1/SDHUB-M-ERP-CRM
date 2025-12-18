"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Download, RefreshCw } from "lucide-react"

type TestResult = {
  id: string
  name: string
  email: string
  phone: string
  course: string
  exam: string
  score: number | null
  submitted_at: string
  lead_id: string | null
  created_at: string
}

type Props = {
  examId: string
  examTitle: string
}

export function ExamResponsesTable({ examId, examTitle }: Props) {
  const [responses, setResponses] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")

  useEffect(() => {
    fetchResponses()
  }, [examId])

  async function fetchResponses() {
    try {
      setLoading(true)
      const response = await fetch(`/api/exam-master/responses?exam_id=${examId}`)
      if (response.ok) {
        const data = await response.json()
        setResponses(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching responses:", error)
    } finally {
      setLoading(false)
    }
  }

  const courseOptions = Array.from(new Set(responses.map((r) => r.course).filter(Boolean)))

  const filtered = responses.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      [r.name, r.email, r.phone, r.course]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCourse = courseFilter === "all" || r.course === courseFilter

    return matchesSearch && matchesCourse
  })

  function downloadCSV() {
    const headers = ["Name", "Email", "Phone", "Course", "Exam", "Score", "Submitted"]
    const rows = filtered.map((r) => [
      r.name || "",
      r.email || "",
      r.phone || "",
      r.course || "",
      r.exam || "",
      r.score !== null ? String(r.score) : "",
      r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "",
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${examTitle}-responses-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by name, email, phone, course"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 w-full max-w-sm"
        />

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Course: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Course: All</SelectItem>
            {courseOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" variant="outline" onClick={fetchResponses}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>

        <Button size="sm" variant="outline" onClick={downloadCSV}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Course</th>
              <th className="p-3">Score</th>
              <th className="p-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-muted-foreground text-center" colSpan={6}>
                  Loading responses...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground text-center" colSpan={6}>
                  No responses found
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="p-3">{r.name || "-"}</td>
                  <td className="p-3">{r.email || "-"}</td>
                  <td className="p-3">{r.phone || "-"}</td>
                  <td className="p-3">{r.course || "-"}</td>
                  <td className="p-3 font-medium">{r.score !== null ? r.score : "-"}</td>
                  <td className="p-3">{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {responses.length} responses
      </div>
    </div>
  )
}
