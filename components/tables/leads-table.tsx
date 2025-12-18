"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, PhoneCallIcon, EyeIcon, SearchIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Link from "next/link"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Lead } from "@/lib/supabase/types"
import { useSupabaseCourses } from "@/lib/courses"

type Status =
  | "New Enquiry"
  | "HR Called"
  | "Visited"
  | "Admitted"
  | "Rejected"
  | "Pending"
  | "Hold for Next Batch"
  | "Exam Written"
  | "Pending Final Exam"
  | "Final Exam Written"

function formatLocalYMD(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseYMDLocal(s: string) {
  const [y, m, d] = s.split("-").map((n) => Number.parseInt(n, 10))
  return new Date(y, (m || 1) - 1, d || 1)
}

const statusStyles: Record<Status, { bg: string; fg: string }> = {
  "New Enquiry": { bg: "oklch(var(--status-new))", fg: "oklch(var(--status-new-fg))" },
  "HR Called": { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  Visited: { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  Admitted: { bg: "oklch(var(--status-admitted))", fg: "oklch(var(--status-admitted-fg))" },
  Rejected: { bg: "oklch(var(--status-rejected))", fg: "oklch(var(--status-rejected-fg))" },
  Pending: { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  "Hold for Next Batch": { bg: "oklch(var(--status-pending))", fg: "oklch(var(--status-pending-fg))" },
  "Exam Written": { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  "Pending Final Exam": { bg: "oklch(var(--status-pending))", fg: "oklch(var(--status-pending-fg))" },
  "Final Exam Written": { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
}

const TEST_FORM_URL = process.env.NEXT_PUBLIC_TEST_FORM_URL

type TestResult = {
  email?: string
  name?: string
  phone?: string
  course?: string
  exam?: string
  score?: string
  submittedAt?: string
}
const TEST_RESULTS_STORAGE_KEY = "sdhub:test-results"

function loadTestResults(): TestResult[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(TEST_RESULTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TestResult[]) : []
  } catch {
    return []
  }
}

export function LeadsTable() {
  const { leads: supabaseLeads, loading, refreshLeads } = useSupabaseLeads()
  const { courses: supabaseCourses } = useSupabaseCourses()
  const courseOptions = supabaseCourses.map((c) => c.name)
  const courseOptionsSet = useMemo(() => new Set(courseOptions.map((c) => c.toLowerCase())), [courseOptions])

  const [rows, setRows] = useState<Lead[]>([])
  const [q, setQ] = useState("")
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All")
  const [filterCourse, setFilterCourse] = useState<"All" | "Others" | string>("All")
  const [filterSource, setFilterSource] = useState<string | "All">("All")
  const [filterDate, setFilterDate] = useState<string>("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [holdOpen, setHoldOpen] = useState(false)
  const [holdIdx, setHoldIdx] = useState<number | null>(null)
  const [holdDate, setHoldDate] = useState<string>(formatLocalYMD(new Date()))
  const [holdRemarks, setHoldRemarks] = useState<string>("")
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [addLeadForm, setAddLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    source: "Online",
  })
  const [studentsWithDocs, setStudentsWithDocs] = useState<Set<string>>(new Set())

  const router = useRouter()
  const search = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    setRows(supabaseLeads)
  }, [supabaseLeads])

  useEffect(() => {
    setTestResults(loadTestResults())
    const onStorage = (e: StorageEvent) => {
      if (e.key === TEST_RESULTS_STORAGE_KEY) setTestResults(loadTestResults())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    const s = search.get("status")
    const src = search.get("source")
    const d = search.get("date")
    const query = search.get("q")
    if (s) setFilterStatus((s as Status) || "All")
    if (src) setFilterSource(src || "All")
    if (d) setFilterDate(d)
    if (query) setQ(query)
    const course = search.get("course")
    if (course) setFilterCourse(course as any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncParams = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(search.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v.length > 0 && v !== "All") params.set(k, v)
      else params.delete(k)
    })
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`)
  }

  useEffect(() => {
    syncParams({
      status: filterStatus === "All" ? null : filterStatus,
      source: filterSource === "All" ? null : filterSource,
      date: filterDate || null,
      q: q || null,
      course: filterCourse === "All" ? null : (filterCourse as string),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterSource, filterDate, q, filterCourse])

  useEffect(() => {
    const fetchStudentsWithDocs = async () => {
      if (filterStatus !== "Admitted") {
        setStudentsWithDocs(new Set())
        return
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("students").select("email")

      if (error) {
        console.error("[v0] Error fetching students:", error)
        return
      }

      const emails = new Set(data.map((s) => s.email?.toLowerCase()).filter(Boolean))
      setStudentsWithDocs(emails)
      console.log("[v0] Fetched students with docs:", emails.size)
    }

    fetchStudentsWithDocs()
  }, [filterStatus, supabaseLeads])

  const sourcesFromData = Array.from(new Set(supabaseLeads.map((r) => r.source || "").filter(Boolean)))
  const sourceOptions = Array.from(new Set(["All", "Online", "Email", "Offline", ...sourcesFromData]))

  const addLeadSourceOptions = Array.from(
    new Set(["Online", "Email", "Offline", "Whatsapp", "Instagram", "Referral", ...sourcesFromData]),
  )

  const matchesSource = (rowSource: string | undefined, filter: string | "All") => {
    if (filter === "All") return true
    const online = ["Website", "Instagram", "Facebook", "Google", "Online"]
    const email = ["Email"]
    const offline = ["Walk-in", "Referral", "Offline"]
    if (filter === "Online") return online.includes(rowSource || "")
    if (filter === "Email") return email.includes(rowSource || "")
    if (filter === "Offline") return offline.includes(rowSource || "")
    return rowSource === filter
  }

  const isFinalExam = (exam?: string) => {
    const e = (exam || "").toLowerCase()
    return e.includes("final") || e.includes("admission")
  }

  const scoreByEmail = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of testResults) {
      if (r?.email) {
        if (!map.has(r.email)) map.set(r.email, r.score ?? "-")
      }
    }
    return map
  }, [testResults])

  const entranceScoreByEmail = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of testResults) {
      if (r?.email && !isFinalExam(r.exam)) {
        if (!map.has(r.email)) map.set(r.email, r.score ?? "-")
      }
    }
    return map
  }, [testResults])

  const finalScoreByEmail = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of testResults) {
      if (r?.email && isFinalExam(r.exam)) {
        if (!map.has(r.email)) map.set(r.email, r.score ?? "-")
      }
    }
    return map
  }, [testResults])

  const filtered = useMemo(() => {
    return supabaseLeads.filter((r) => {
      const textMatch =
        (r.name || "").toLowerCase().includes(q.toLowerCase()) ||
        (r.email || "").toLowerCase().includes(q.toLowerCase()) ||
        (r.phone || "").includes(q)

      const statusMatch =
        filterStatus === "All" ? (r.status || "New Enquiry") !== "Admitted" : r.status === filterStatus

      let courseMatch = true
      if (filterCourse === "All") {
        courseMatch = true
      } else if (filterCourse === "Others") {
        courseMatch = !courseOptionsSet.has((r.course || "").toLowerCase())
      } else {
        courseMatch = r.course === filterCourse
      }

      const sourceMatch = matchesSource(r.source, filterSource)
      const dateMatch = !filterDate || (r.created_at || "").startsWith(filterDate)
      return textMatch && statusMatch && courseMatch && sourceMatch && dateMatch
    })
  }, [supabaseLeads, q, filterStatus, filterCourse, filterSource, filterDate, courseOptionsSet])

  const updateLeadInSupabase = async (leadId: string, updates: Partial<Lead>) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", leadId)

    if (error) {
      console.error("[v0] Error updating lead:", error)
      return
    }

    console.log("[v0] Lead updated successfully, refreshing data")
    window.dispatchEvent(new Event("leads:updated"))
    await new Promise((resolve) => setTimeout(resolve, 500))
    refreshLeads()
  }

  const markWithHistory = (leadId: string, status: Status, extra?: Partial<Lead>, note?: string) => {
    const updates = {
      status,
      ...extra,
      updated_at: new Date().toISOString(),
    }
    updateLeadInSupabase(leadId, updates)
  }

  const addLeadToSupabase = async () => {
    if (
      !addLeadForm.name.trim() ||
      !addLeadForm.email.trim() ||
      !addLeadForm.phone.trim() ||
      !addLeadForm.course.trim()
    ) {
      alert("Please fill in all fields")
      return
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase.from("leads").insert([
      {
        name: addLeadForm.name,
        email: addLeadForm.email,
        phone: addLeadForm.phone,
        course: addLeadForm.course,
        source: addLeadForm.source,
        status: "New Enquiry",
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error adding lead:", error)
      alert("Failed to add lead")
      return
    }

    setAddLeadForm({ name: "", email: "", phone: "", course: "", source: "Online" })
    setAddLeadOpen(false)
    window.dispatchEvent(new Event("leads:updated"))
    refreshLeads()
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            placeholder="Search name, email, phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-[240px] pl-9"
          />
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status/Action" />
          </SelectTrigger>
          <SelectContent>
            {[
              "All",
              "New Enquiry",
              "HR Called",
              "Visited",
              "Exam Written",
              "Admitted",
              "Rejected",
              "Pending",
              "Hold for Next Batch",
              "Pending Final Exam",
              "Final Exam Written",
            ].map((s) => (
              <SelectItem key={s} value={s as any}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSource} onValueChange={(v: any) => setFilterSource(v)}>
          <SelectTrigger className="w-[180px]">
            <span className="truncate">{`Source: ${filterSource === "All" ? "All" : filterSource}`}</span>
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map((s) => (
              <SelectItem key={s} value={s as any}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCourse} onValueChange={(v: any) => setFilterCourse(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent className="z-[1000]">
            <SelectItem value="All">All Courses</SelectItem>
            {courseOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[120px] bg-transparent">
              {filterDate ? `Date: ${filterDate}` : "Pick Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <Calendar
              mode="single"
              selected={filterDate ? parseYMDLocal(filterDate) : undefined}
              onSelect={(d: any) => setFilterDate(d ? formatLocalYMD(d) : "")}
            />
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="secondary" onClick={() => setFilterDate(formatLocalYMD(new Date()))}>
                Today
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFilterDate("")}>
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">+ Add Lead</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input
                placeholder="Full Name"
                value={addLeadForm.name}
                onChange={(e) => setAddLeadForm({ ...addLeadForm, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={addLeadForm.email}
                onChange={(e) => setAddLeadForm({ ...addLeadForm, email: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={addLeadForm.phone}
                onChange={(e) => setAddLeadForm({ ...addLeadForm, phone: e.target.value })}
              />
              <Select value={addLeadForm.course} onValueChange={(v) => setAddLeadForm({ ...addLeadForm, course: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Course Interested" />
                </SelectTrigger>
                <SelectContent className="z-[1000]">
                  {courseOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={addLeadForm.source} onValueChange={(v) => setAddLeadForm({ ...addLeadForm, source: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Source (Online, Email, Offline, ...)" />
                </SelectTrigger>
                <SelectContent className="z-[1000]">
                  {addLeadSourceOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addLeadToSupabase}>Add Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[60px]">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Entrance Score</TableHead>
              <TableHead>Final Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Follow-Up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, idx) => {
              const entranceDisplay = r.entrance_score ?? entranceScoreByEmail.get(r.email || "") ?? "-"
              const finalDisplay = r.final_score ?? finalScoreByEmail.get(r.email || "") ?? "-"
              if ((r.entrance_score || r.final_score) && !r.email?.includes("example")) {
                console.log(`[v0] Lead ${r.name}: entrance_score=${r.entrance_score}, final_score=${r.final_score}`)
              }

              const isAdmitted = r.status === "Admitted"
              const hasDocuments = studentsWithDocs.has(r.email?.toLowerCase() || "")
              const needsDocuments = isAdmitted && !hasDocuments

              return (
                <TableRow
                  key={r.id}
                  className={`hover:bg-muted/40 ${needsDocuments ? "bg-red-50 hover:bg-red-100" : ""}`}
                >
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.course}</TableCell>
                  <TableCell>
                    <Link
                      href={`/test-results?q=${encodeURIComponent(r.email || "")}`}
                      className="underline underline-offset-2"
                      title="View Entrance test results"
                    >
                      {entranceDisplay}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/test-results?q=${encodeURIComponent(r.email || "")}`}
                      className="underline underline-offset-2"
                      title="View Final test results"
                    >
                      {finalDisplay}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        background:
                          statusStyles[(r.status as Status) || "New Enquiry"]?.bg || "oklch(var(--status-new))",
                        color: statusStyles[(r.status as Status) || "New Enquiry"]?.fg || "oklch(var(--status-new-fg))",
                      }}
                      className="font-medium"
                    >
                      {r.status || "New Enquiry"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.next_follow_up_date || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Lead Details</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name</span>
                              <div>{r.name}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email</span>
                              <div>{r.email}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone</span>
                              <div>{r.phone}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Course</span>
                              <div>{r.course}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qualification</span>
                              <div>{r.qualification || "-"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Source</span>
                              <div>{r.source || "-"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Entrance Score</span>
                              <div>{r.entrance_score ?? "-"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Final Score</span>
                              <div>{r.final_score ?? "-"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date</span>
                              <div>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Next Follow-Up</span>
                              <div>{r.next_follow_up_date || "-"}</div>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Remarks</span>
                              <div className="whitespace-pre-wrap">{r.remarks || "-"}</div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (r.id) {
                            markWithHistory(r.id, "HR Called", undefined, "Status → HR Called")
                          }
                        }}
                      >
                        <PhoneCallIcon className="h-4 w-4 mr-1" />
                        Call Lead
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                            Action
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              if (r.id) {
                                markWithHistory(r.id, "Admitted", undefined, "Status → Admitted")
                              }
                            }}
                          >
                            Admit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (r.id) {
                                markWithHistory(r.id, "Pending", undefined, "Status → Pending (test initiated)")
                              }
                              try {
                                if (TEST_FORM_URL) {
                                  const url = new URL(TEST_FORM_URL)
                                  url.searchParams.set("name", r.name || "")
                                  url.searchParams.set("email", r.email || "")
                                  url.searchParams.set("phone", r.phone || "")
                                  url.searchParams.set("course", r.course || "")
                                  window.open(url.toString(), "_blank", "noopener,noreferrer")
                                } else {
                                  alert(
                                    "Set NEXT_PUBLIC_TEST_FORM_URL to your Google Form prefill URL. We'll append name, email, phone, course.",
                                  )
                                }
                              } catch {
                                alert("Invalid NEXT_PUBLIC_TEST_FORM_URL. Please verify it in the Vars sidebar.")
                              }
                            }}
                          >
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setHoldIdx(filtered.indexOf(r))
                              setHoldDate(formatLocalYMD(new Date()))
                              setHoldRemarks("")
                              setHoldOpen(true)
                            }}
                          >
                            Hold for Next Batch
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => r.id && markWithHistory(r.id, "HR Called")}>
                            HR Called
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => r.id && markWithHistory(r.id, "Visited")}>
                            Visited
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => r.id && markWithHistory(r.id, "New Enquiry")}>
                            New Enquiry
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (r.id) {
                                markWithHistory(r.id, "Rejected")
                                window.dispatchEvent(new Event("leads:updated"))
                              }
                            }}
                          >
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (r.id) {
                                markWithHistory(
                                  r.id,
                                  "Exam Written",
                                  undefined,
                                  "Status → Exam Written (test submitted)",
                                )
                              }
                            }}
                          >
                            Exam Written
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (r.id) {
                                markWithHistory(
                                  r.id,
                                  "Final Exam Written",
                                  undefined,
                                  "Status → Final Exam Written (2nd stage submitted)",
                                )
                              }
                            }}
                          >
                            Final Exam Written
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Link
                        href={`/test-results?email=${encodeURIComponent(r.email || "")}&name=${encodeURIComponent(r.name || "")}&phone=${encodeURIComponent(r.phone || "")}&course=${encodeURIComponent(r.course || "")}`}
                        className="inline-flex items-center h-8 px-2 text-sm rounded-md hover:bg-muted"
                      >
                        View Results
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const params = new URLSearchParams({
                            name: r.name || "",
                            email: r.email || "",
                            phone: r.phone || "",
                            course: r.course || "",
                          })
                          params.set("open", "1")
                          router.push(`/documents?${params.toString()}`)
                        }}
                      >
                        Upload Docs
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Hold for Next Batch</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Follow-Up</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <span className="text-sm text-muted-foreground">Next Follow-Up Date</span>
              <Input type="date" value={holdDate} onChange={(e) => setHoldDate(e.target.value)} />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Remarks</span>
              <textarea
                className="min-h-[100px] rounded-md border p-2 w-full"
                value={holdRemarks}
                onChange={(e) => setHoldRemarks(e.target.value)}
                placeholder="Any notes for the next call..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setHoldOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (holdIdx == null) return setHoldOpen(false)
                const lead = filtered[holdIdx]
                if (lead?.id) {
                  markWithHistory(
                    lead.id,
                    "Hold for Next Batch",
                    { next_follow_up_date: holdDate, remarks: holdRemarks },
                    `Status → Hold for Next Batch; Next Follow-Up: ${holdDate}`,
                  )
                }
                setHoldOpen(false)
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
