"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { loadLeads, saveLeads, todayYMDLocal } from "@/lib/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, AlertTriangle, RefreshCw, Download, Link2, ArrowLeft } from "lucide-react"
import { getTestResults } from "@/lib/supabase/test-results"
import type { TestResult } from "@/lib/supabase/types"

const STORAGE_KEY = "sdhub:test-results"

function loadResults(): TestResult[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TestResult[]) : []
  } catch {
    return []
  }
}

function saveResults(results: TestResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
  } catch {}
}

function isSameLocalDay(dateIso: string, day: Date) {
  const d = new Date(dateIso)
  return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
}

function isFinalExam(exam?: string) {
  const e = (exam || "").toLowerCase()
  return e.includes("final") || e.includes("admission")
}

function toNumberScore(s?: string | number) {
  const n = Number.parseFloat(String(s ?? ""))
  return Number.isFinite(n) ? n : Number.NaN
}

const PASS_SCORE = 60

function examTypeLabel(exam?: string) {
  return isFinalExam(exam) ? "Final Exam" : "Entrance Exam"
}

function isPass(score?: string | number) {
  const n = toNumberScore(score)
  return Number.isFinite(n) && n >= PASS_SCORE
}

function firstDayOfThisMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function lastDayOfThisMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function isWithinRange(iso?: string, start?: Date, end?: Date) {
  if (!iso) return false
  const d = new Date(iso)
  if (start && d < new Date(start.getFullYear(), start.getMonth(), start.getDate())) return false
  if (end && d > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)) return false
  return true
}

function mergeIncomingIntoLeads(incoming: TestResult, leads: ReturnType<typeof loadLeads>) {
  try {
    const isFinal = isFinalExam(incoming.exam)
    const scoreN = toNumberScore(incoming.score)
    // Pass/fail determination is now optional based on exam master's passing marks

    const updated = leads.map((l: any) => {
      const isMatch = (incoming.email && l.email === incoming.email) || (incoming.phone && l.phone === incoming.phone)
      if (!isMatch) return l

      const isTerminal = l.status === "Admitted" || l.status === "Rejected"
      if (isTerminal && !isFinal) return l

      const historyEntry = isFinal
        ? {
            at: todayYMDLocal(),
            action: `Final test submitted${incoming.exam ? ` (${incoming.exam})` : ""}${
              incoming.score ? ` — Score: ${incoming.score}` : ""
            }`,
          }
        : {
            at: todayYMDLocal(),
            action: `Entrance test submitted${incoming.exam ? ` (${incoming.exam})` : ""}${
              incoming.score ? ` — Score: ${incoming.score}` : ""
            }`,
          }

      if (isFinal) {
        const out: any = {
          ...l,
          finalScore: incoming.score,
          history: [...(l.history ?? []), historyEntry],
        }
        return out
      } else {
        return {
          ...l,
          entranceScore: incoming.score,
          history: [...(l.history ?? []), historyEntry],
        } as any
      }
    })
    return updated
  } catch {
    return leads
  }
}

export default function TestResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [examTab, setExamTab] = useState<"all" | "entrance" | "final">("all")
  const [resultFilter, setResultFilter] = useState<"all" | "pass" | "fail">("all")
  const [startDate, setStartDate] = useState<Date | undefined>(firstDayOfThisMonth())
  const [endDate, setEndDate] = useState<Date | undefined>(lastDayOfThisMonth())
  const [leadsSnapshot, setLeadsSnapshot] = useState(loadLeads())
  const [addOpen, setAddOpen] = useState(false)
  const [addDraft, setAddDraft] = useState<TestResult>({
    id: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    exam: "",
    score: undefined,
    submitted_at: new Date().toISOString(),
  })
  const [courseFilter, setCourseFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true)
        const data = await getTestResults()
        console.log("[v0] Fetched test results from Supabase:", data)
        setResults(data || [])
      } catch (error) {
        console.error("[v0] Error fetching test results:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  const linkedBy = useMemo(() => {
    const emails = new Set(leadsSnapshot.map((l: any) => l.email))
    const phones = new Set(leadsSnapshot.map((l: any) => l.phone))
    return { emails, phones }
  }, [leadsSnapshot])

  const courseOptions = useMemo(() => {
    const set = new Set(results.map((r) => (r.course || "").trim()).filter((v) => v.length > 0))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [results])

  const filtered = useMemo(() => {
    let data = results

    if (examTab !== "all") {
      data = data.filter((r) => (examTab === "final" ? isFinalExam(r.exam) : !isFinalExam(r.exam)))
    }

    if (courseFilter !== "all") {
      const needle = courseFilter.toLowerCase()
      data = data.filter((r) => (r.course || "").toLowerCase() === needle)
    }

    if (startDate || endDate) {
      data = data.filter((r) => isWithinRange(r.submitted_at, startDate, endDate))
    }

    if (resultFilter !== "all") {
      data = data.filter((r) => (resultFilter === "pass" ? isPass(r.score) : !isPass(r.score)))
    }

    const term = q.trim().toLowerCase()
    if (term) {
      data = data.filter((r) =>
        [r.name, r.email, r.phone, r.course, r.exam]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)),
      )
    }

    return data
  }, [results, q, examTab, startDate, endDate, resultFilter, courseFilter])

  function refreshResults() {
    async function fetch() {
      try {
        const data = await getTestResults()
        setResults(data || [])
      } catch (error) {
        console.error("[v0] Error refreshing:", error)
      }
    }
    fetch()
  }

  function syncWithEnquiries() {
    try {
      const leads = loadLeads()
      let updated = leads
      for (const r of results) {
        updated = mergeIncomingIntoLeads(
          {
            ...r,
            submitted_at: r.submitted_at || new Date().toISOString(),
          },
          updated,
        )
      }
      saveLeads(updated)
      setLeadsSnapshot(updated)
      alert("Synced test results with Enquiries. HR will review and decide pass/fail status.")
    } catch {
      alert("Failed to sync. Please try again.")
    }
  }

  function downloadCSV() {
    const header = ["Name", "Email", "Phone", "Course", "Exam Type", "Score", "Submitted", "Linked"].join(",")
    const lines = results.map((r) => {
      const type = examTypeLabel(r.exam)
      const linked =
        (r.email && linkedBy.emails.has(r.email)) || (r.phone && linkedBy.phones.has(r.phone)) ? "Yes" : "No"
      const cells = [
        r.name || "",
        r.email || "",
        r.phone || "",
        r.course || "",
        type,
        r.score || "",
        r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "",
        linked,
      ]
      return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    })
    const csv = [header, ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-results-${todayYMDLocal()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-pretty">Test Results</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all test results submitted through Google Forms. HR will review scores and decide pass/fail status.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </header>

      <section className="mb-4 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={examTab === "all" ? "default" : "outline"}
            onClick={() => setExamTab("all")}
            aria-pressed={examTab === "all"}
          >
            All Results
          </Button>
          <Button
            size="sm"
            variant={examTab === "entrance" ? "default" : "outline"}
            onClick={() => setExamTab("entrance")}
            aria-pressed={examTab === "entrance"}
          >
            Entrance Exams
          </Button>
          <Button
            size="sm"
            variant={examTab === "final" ? "default" : "outline"}
            onClick={() => setExamTab("final")}
            aria-pressed={examTab === "final"}
          >
            Final Exams
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={refreshResults}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={syncWithEnquiries}>
              <Link2 className="h-4 w-4 mr-1" />
              Sync with Enquiry
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-1" />
              Download Excel
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone, course"
            className="h-9 w-full max-w-sm"
            aria-label="Search results"
          />

          <Select value={courseFilter} onValueChange={(v) => setCourseFilter(v)}>
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {startDate || endDate
                  ? `From ${startDate?.toLocaleDateString() ?? "Any"} to ${endDate?.toLocaleDateString() ?? "Any"}`
                  : "Date: This Month"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs mb-2 text-muted-foreground">Start</div>
                  <Calendar mode="single" selected={startDate} onSelect={(d) => setStartDate(d ?? undefined)} />
                </div>
                <div>
                  <div className="text-xs mb-2 text-muted-foreground">End</div>
                  <Calendar mode="single" selected={endDate} onSelect={(d) => setEndDate(d ?? undefined)} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setStartDate(firstDayOfThisMonth())
                    setEndDate(lastDayOfThisMonth())
                  }}
                >
                  This Month
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setStartDate(undefined)
                    setEndDate(undefined)
                  }}
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Link
            href="/enquiries?tested=1"
            className="h-9 px-3 rounded-md border bg-background text-sm inline-flex items-center"
          >
            View tested leads
          </Link>
        </div>
      </section>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Course</th>
              <th className="p-3">Exam Type</th>
              <th className="p-3">Score</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Linked Enquiry</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-muted-foreground text-center" colSpan={9}>
                  Loading test results...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground text-center" colSpan={9}>
                  No test results found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const linked = (r.email && linkedBy.emails.has(r.email)) || (r.phone && linkedBy.phones.has(r.phone))
                return (
                  <tr
                    key={r.id}
                    className={[
                      "border-t cursor-pointer hover:bg-muted/50 transition-colors",
                      !linked ? "bg-yellow-50 dark:bg-yellow-900/20" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => router.push(`/test-results/${r.id}`)}
                  >
                    <td className="p-3">{r.name || "-"}</td>
                    <td className="p-3">{r.email || "-"}</td>
                    <td className="p-3">{r.phone || "-"}</td>
                    <td className="p-3">{r.course || "-"}</td>
                    <td className="p-3">{examTypeLabel(r.exam)}</td>
                    <td className="p-3 font-medium">{r.score || "-"}</td>
                    <td className="p-3">{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "-"}</td>
                    <td className="p-3">
                      {linked ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Linked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-4 w-4" />
                          Unlinked
                        </span>
                      )}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/test-results/${r.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
