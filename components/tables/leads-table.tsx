"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDownIcon, PhoneCallIcon, EyeIcon, SearchIcon, MoreVerticalIcon, DownloadIcon } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Lead } from "@/lib/supabase/types"
import { useSupabaseCourses } from "@/lib/courses"

type Status =
  | "New Enquiry"
  | "Contacted"
  | "Visited"
  | "Exam Written"
  | "Final Exam Written"
  | "Admit"
  | "Reject"
  | "Hold for Next Batch"
  | "HR Called"
  | "Pending"
  | "Pending Final Exam"
  | "Admitted"
  | "Rejected"
  | "Interested"
  | "Not Answered"
  | "Busy"
  | "Call Back Later"
  | "Not Interested"
  | "Wrong Number"

type TabType = "active" | "exam" | "closed"

function formatLocalYMD(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getFollowUpStatus(date: string | null | undefined) {
  if (!date) return null
  const today = new Date().toISOString().split("T")[0]
  if (date < today) return "overdue"
  if (date === today) return "today"
  return "upcoming"
}

const statusStyles: Record<Status, { bg: string; fg: string }> = {
  "New Enquiry": { bg: "oklch(var(--status-new))", fg: "oklch(var(--status-new-fg))" },
  Contacted: { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  Visited: { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  "Exam Written": { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  "Final Exam Written": { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  Admit: { bg: "oklch(var(--status-admitted))", fg: "oklch(var(--status-admitted-fg))" },
  Reject: { bg: "oklch(var(--status-rejected))", fg: "oklch(var(--status-rejected-fg))" },
  "Hold for Next Batch": { bg: "oklch(var(--status-pending))", fg: "oklch(var(--status-pending-fg))" },
  "HR Called": { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  Pending: { bg: "oklch(var(--status-visited))", fg: "oklch(var(--status-visited-fg))" },
  "Pending Final Exam": { bg: "oklch(var(--status-pending))", fg: "oklch(var(--status-pending-fg))" },
  Admitted: { bg: "oklch(var(--status-admitted))", fg: "oklch(var(--status-admitted-fg))" },
  Rejected: { bg: "oklch(var(--status-rejected))", fg: "oklch(var(--status-rejected-fg))" },
  Interested: { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  "Not Answered": { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  Busy: { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  "Call Back Later": { bg: "oklch(var(--status-called))", fg: "oklch(var(--status-called-fg))" },
  "Not Interested": { bg: "oklch(var(--status-rejected))", fg: "oklch(var(--status-rejected-fg))" },
  "Wrong Number": { bg: "oklch(var(--status-rejected))", fg: "oklch(var(--status-rejected-fg))" },
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
  
  // Extract unique courses from actual leads data (Google Forms)
  // Standard courses from the form
  const standardCourses = [
    "Digital Marketing",
    "Data Analytics",
    "Tally Prime",
    "Office Administration Assistant",
    "Web Development"
  ]
  
  const courseOptionsFromData = useMemo(() => {
    const coursesSet = new Set<string>(standardCourses)
    supabaseLeads.forEach((lead) => {
      if (lead.course && lead.course.trim()) {
        coursesSet.add(lead.course)
      }
    })
    return Array.from(coursesSet).sort()
  }, [supabaseLeads])

  // State
  const [rows, setRows] = useState<Lead[]>([])
  const [q, setQ] = useState("")
  const [tab, setTab] = useState<TabType>("active")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(30)
  const [scrollY, setScrollY] = useState<number>(0)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [addLeadForm, setAddLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    source: "Online",
  })

  const handleExportToExcel = () => {
    // Prepare data for export
    const headers = ["Name", "Email", "Phone", "Course", "Status", "Source", "Next Follow-Up", "Created At"]
    const rows = filtered.map((lead) => [
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      lead.course || "",
      lead.status || "New Enquiry",
      lead.source || "",
      lead.next_follow_up_date || "",
      lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ""
    ])
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `enquiries-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Modals
  const [logCallOpen, setLogCallOpen] = useState(false)
  const [logCallLeadId, setLogCallLeadId] = useState<string | null>(null)
  const [logCallNextDate, setLogCallNextDate] = useState(formatLocalYMD(new Date()))
  const [logCallOutcome, setLogCallOutcome] = useState("Interested")

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const router = useRouter()
  const search = useSearchParams()
  const pathname = usePathname()

  // Sync rows with supabase leads
  useEffect(() => {
    setRows(supabaseLeads)
  }, [supabaseLeads])

  // Load test results
  useEffect(() => {
    setTestResults(loadTestResults())
    const onStorage = (e: StorageEvent) => {
      if (e.key === TEST_RESULTS_STORAGE_KEY) setTestResults(loadTestResults())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Load page size
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sdhub:leads:pageSize")
      if (raw) setPageSize(Number(raw) || 30)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("sdhub:leads:pageSize", String(pageSize))
    } catch {
      /* ignore */
    }
  }, [pageSize])

  // Update functions
  const updateLeadInSupabase = async (leadId: string, updates: Partial<Lead>) => {
    const currentScrollY = window.scrollY
    setScrollY(currentScrollY)

    setRows((prevRows) =>
      prevRows.map((r) => (r.id === leadId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r))
    )

    const supabase = getSupabaseClient()
    
    // Filter out undefined values and ensure valid data types
    const cleanUpdates = Object.fromEntries(
      Object.entries({ ...updates, updated_at: new Date().toISOString() }).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    )

    const { error, data } = await supabase
      .from("leads")
      .update(cleanUpdates)
      .eq("id", leadId)
      .select()

    if (error) {
      console.error("[v0] Error updating lead:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      // Show user-friendly error message
      alert(`Failed to update lead: ${error.message || "Unknown error"}`)
      // Revert optimistic update
      window.location.reload()
      return
    }

    console.log("[v0] Lead updated successfully", data)
    const event = new CustomEvent("leads:updated", { detail: { skipLoading: true } })
    window.dispatchEvent(event)
    window.scrollTo(0, currentScrollY)
  }

  const markWithHistory = (leadId: string, status: Status, extra?: Partial<Lead>, note?: string) => {
    const updates = {
      status,
      ...extra,
      updated_at: new Date().toISOString(),
    }
    updateLeadInSupabase(leadId, updates)
  }

  const handleLogCall = async (leadId: string) => {
    const lead = rows.find((r) => r.id === leadId)
    if (!lead) return

    const callAttempts = (lead.call_attempts || 0) + 1
    // Use the actual selected outcome as the lead status so it appears in the Stage column
    const mappedStatus = (logCallOutcome as Status)

    // Append outcome to remarks with timestamp so we preserve call history on the lead
    const remarkLine = `${new Date().toISOString()} - ${logCallOutcome}`
    const newRemarks = lead.remarks ? `${remarkLine}\n${lead.remarks}` : remarkLine

    const updates = {
      call_attempts: callAttempts,
      last_call_at: new Date().toISOString(),
      next_follow_up_date: logCallNextDate || null,
      status: mappedStatus,
      remarks: newRemarks,
    }

    await updateLeadInSupabase(leadId, updates)
    setLogCallOpen(false)
    setLogCallLeadId(null)
    setLogCallNextDate(formatLocalYMD(new Date()))
    setLogCallOutcome("Interested")
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

  // Filter logic
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      // Text search
      const textMatch =
        (r.name || "").toLowerCase().includes(q.toLowerCase()) ||
        (r.email || "").toLowerCase().includes(q.toLowerCase()) ||
        (r.phone || "").includes(q)

      // Course filter
      let courseMatch = true
      if (courseFilter !== "all") {
        courseMatch = (r.course || "").toLowerCase() === courseFilter.toLowerCase()
      }

      // Tab filtering
      const status = r.status || "New Enquiry"
      let tabMatch = true
      if (tab === "active") {
        tabMatch = !["Admit", "Reject", "Admitted", "Rejected"].includes(status)
      } else if (tab === "exam") {
        tabMatch = ["Exam Written", "Final Exam Written"].includes(status)
      } else if (tab === "closed") {
        tabMatch = ["Admit", "Reject", "Admitted", "Rejected"].includes(status)
      }

      return textMatch && courseMatch && tabMatch
    })
  }, [rows, q, tab, courseFilter])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [q, tab, courseFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const pagesToRender = useMemo(() => {
    const pages: Array<number | string> = []
    const maxPages = 10
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 4) pages.push("...")
      for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i)
      if (page < totalPages - 3) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }, [page, totalPages])

  const sourcesFromData = Array.from(new Set(rows.map((r) => r.source || "").filter(Boolean)))
  const addLeadSourceOptions = Array.from(
    new Set(["Online", "Email", "Offline", "Whatsapp", "Instagram", "Referral", ...sourcesFromData]),
  )

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
  }

  return (
    <div className="grid gap-4">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="active">
            Active ({filtered.filter(r => !["Admit", "Reject", "Admitted", "Rejected"].includes(r.status || "New Enquiry")).length})
          </TabsTrigger>
          <TabsTrigger value="exam">
            Exam Stage ({filtered.filter(r => ["Exam Written", "Final Exam Written"].includes(r.status || "")).length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({filtered.filter(r => ["Admit", "Reject", "Admitted", "Rejected"].includes(r.status || "")).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-4">
          {/* Course Filter Indicator */}
          {courseFilter !== "all" && (
            <div className="text-sm">
              <span className="font-medium">Currently viewing:</span>{" "}
              <span className="px-2 py-0.5 rounded-full border text-xs">{courseFilter} Enquiries</span>{" "}
              <Button 
                variant="link" 
                size="sm" 
                className="px-1 h-auto" 
                onClick={() => setCourseFilter("all")}
              >
                Clear filter
              </Button>
            </div>
          )}
          
          {/* Search and Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Input
                placeholder="Search name, email, phone..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Course Filter */}
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courseOptionsFromData.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Items" />
              </SelectTrigger>
              <SelectContent>
                {[20, 30, 40, 50, 60].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            
            <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
              <DialogTrigger asChild>
                <Button>+ Add Lead</Button>
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
                      {courseOptionsFromData.length > 0 ? (
                        courseOptionsFromData.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))
                      ) : (
                        supabaseCourses.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Select value={addLeadForm.source} onValueChange={(v) => setAddLeadForm({ ...addLeadForm, source: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Source" />
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

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[130px]">Phone</TableHead>
                  <TableHead className="w-[160px]">Course</TableHead>
                  <TableHead className="w-[150px]">Stage</TableHead>
                  <TableHead className="w-[90px] text-center">Attempts</TableHead>
                  <TableHead className="w-[160px]">Next Follow-Up</TableHead>
                  <TableHead className="w-[110px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((r) => {
                  const followUpStatus = getFollowUpStatus(r.next_follow_up_date)
                  const callAttempts = r.call_attempts || 0

                  return (
                    <TableRow key={r.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>{r.course}</TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            background: statusStyles[(r.status as Status) || "New Enquiry"]?.bg || "oklch(var(--status-new))",
                            color: statusStyles[(r.status as Status) || "New Enquiry"]?.fg || "oklch(var(--status-new-fg))",
                          }}
                        >
                          {r.status || "New Enquiry"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={callAttempts >= 3 ? "text-red-600 font-medium" : ""}>
                          📞 {callAttempts}
                        </span>
                      </TableCell>
                      <TableCell>
                        {followUpStatus === "overdue" && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                        {followUpStatus === "today" && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-900">
                            Due Today
                          </Badge>
                        )}
                        {followUpStatus === "upcoming" && (
                          <span className="text-sm text-muted-foreground">{r.next_follow_up_date}</span>
                        )}
                        {!r.next_follow_up_date && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedLead(r)
                                setDetailsOpen(true)
                              }}
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setLogCallLeadId(r.id || null)
                                setLogCallOpen(true)
                              }}
                            >
                              <PhoneCallIcon className="h-4 w-4 mr-2" />
                              Log Call
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "New Enquiry")}>
                              New Enquiry
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "Contacted")}>
                              Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "Visited")}>
                              Visited
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "Exam Written")}>
                              Exam Written
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "Final Exam Written")}>
                              Final Exam Written
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "Admit")}>
                              Admit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markWithHistory(r.id || "", "Reject")} className="text-destructive">
                              Reject
                            </DropdownMenuItem>
                            {(r.status === "Exam Written" || r.status === "Final Exam Written") && (
                              <DropdownMenuItem
                                onClick={() => {
                                  router.push(
                                    `/test-results?email=${encodeURIComponent(r.email || "")}&name=${encodeURIComponent(r.name || "")}&phone=${encodeURIComponent(r.phone || "")}&course=${encodeURIComponent(r.course || "")}`
                                  )
                                }}
                              >
                                View Results
                              </DropdownMenuItem>
                            )}
                            {r.status === "Admit" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    name: r.name || "",
                                    email: r.email || "",
                                    phone: r.phone || "",
                                    course: r.course || "",
                                    open: "1",
                                  })
                                  router.push(`/documents?${params.toString()}`)
                                }}
                              >
                                Upload Documents
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e: any) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                />
              </PaginationItem>
              {pagesToRender.map((p, i) =>
                typeof p === "number" ? (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e: any) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={`e-${i}`}>
                    <span className="inline-flex items-center px-3">{p}</span>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e: any) => {
                    e.preventDefault()
                    setPage((p) => Math.min(totalPages, p + 1))
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </TabsContent>
      </Tabs>

      {/* Log Call Modal */}
      <Dialog open={logCallOpen} onOpenChange={setLogCallOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📞 Log Call</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Call Outcome</label>
              <Select value={logCallOutcome} onValueChange={setLogCallOutcome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Not Answered">Not Answered</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="Call Back Later">Call Back Later</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Wrong Number">Wrong Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Next Follow-Up Date</label>
              <Input
                type="date"
                value={logCallNextDate}
                onChange={(e) => setLogCallNextDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setLogCallOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (logCallLeadId) {
                  handleLogCall(logCallLeadId)
                }
              }}
            >
              Save Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="grid grid-cols-2 gap-4 text-sm max-h-[60vh] overflow-y-auto">
              <div>
                <span className="text-muted-foreground font-medium">Name</span>
                <div>{selectedLead.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Email</span>
                <div className="break-all">{selectedLead.email}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Phone</span>
                <div>{selectedLead.phone}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Course</span>
                <div>{selectedLead.course}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Qualification</span>
                <div>{selectedLead.qualification || "-"}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Source</span>
                <div>{selectedLead.source || "-"}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Status</span>
                <div>
                  <Badge
                    style={{
                      background: statusStyles[(selectedLead.status as Status) || "New Enquiry"]?.bg,
                      color: statusStyles[(selectedLead.status as Status) || "New Enquiry"]?.fg,
                    }}
                  >
                    {selectedLead.status || "New Enquiry"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Call Attempts</span>
                <div>📞 {selectedLead.call_attempts || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Entrance Score</span>
                <div>{selectedLead.entrance_score || "-"}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Final Score</span>
                <div>{selectedLead.final_score || "-"}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Last Called</span>
                <div>{selectedLead.last_call_at ? new Date(selectedLead.last_call_at).toLocaleDateString() : "-"}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Next Follow-Up</span>
                <div>{selectedLead.next_follow_up_date || "-"}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Created</span>
                <div>{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString() : "-"}</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground font-medium">Remarks</span>
                <div className="whitespace-pre-wrap mt-1">{selectedLead.remarks || "-"}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
