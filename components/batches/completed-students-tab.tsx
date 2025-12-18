"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Download } from "lucide-react"
import { getCompletedBatches, reactivateBatch, formatDate } from "@/lib/batches"
import { useCourses } from "@/lib/courses"

type StudentRecord = {
  id: string
  name: string
  email: string
  phone: string
  course?: string
  batchNumber?: string
  batchStart?: string
  status?: string
}

function loadCompletedStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem("sdhub:student-records")
    if (!raw) return []
    const records = JSON.parse(raw) as StudentRecord[]
    return records.filter((r) => r.status === "Completed")
  } catch {
    return []
  }
}

function downloadExcel(data: StudentRecord[]) {
  const headers = ["Name", "Email", "Phone", "Course", "Batch Number", "Batch Start Date"]
  const rows = data.map((r) => [r.name, r.email, r.phone, r.course || "", r.batchNumber || "", r.batchStart || ""])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `completed-students-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function reactivateStudent(studentId: string) {
  try {
    const raw = localStorage.getItem("sdhub:student-records")
    const records = raw ? (JSON.parse(raw) as StudentRecord[]) : []
    const updated = records.map((r) => (r.id === studentId ? { ...r, status: "Active" } : r))
    localStorage.setItem("sdhub:student-records", JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("student-records:changed"))
  } catch {
    // ignore
  }
}

export function CompletedStudentsTab() {
  const [completedStudents, setCompletedStudents] = React.useState<StudentRecord[]>(loadCompletedStudents)
  const [courseFilter, setCourseFilter] = React.useState<string>("all")
  const [dateFilter, setDateFilter] = React.useState<string>("")
  const [searchTerm, setSearchTerm] = React.useState<string>("")

  const courses = useCourses()
  const completedBatches = getCompletedBatches()

  React.useEffect(() => {
    const sync = () => setCompletedStudents(loadCompletedStudents())
    sync()
    window.addEventListener("student-records:changed" as any, sync as any)
    return () => window.removeEventListener("student-records:changed" as any, sync as any)
  }, [])

  const filtered = React.useMemo(() => {
    let result = completedStudents

    if (courseFilter !== "all") {
      result = result.filter((r) => r.course?.toLowerCase() === courseFilter.toLowerCase())
    }

    if (dateFilter) {
      result = result.filter((r) => r.batchStart?.startsWith(dateFilter))
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (r) => r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term) || r.phone.includes(term),
      )
    }

    return result
  }, [completedStudents, courseFilter, dateFilter, searchTerm])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completed Students Archive</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            View and manage students from completed batches. You can reactivate students or export data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm"
              placeholder="Filter by batch start date"
            />

            <Button variant="outline" size="sm" onClick={() => downloadExcel(filtered)} className="gap-2">
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[60px]">S.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Batch Start</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((r, idx) => (
                    <TableRow key={r.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell>{r.course}</TableCell>
                      <TableCell>{r.batchNumber}</TableCell>
                      <TableCell>{r.batchStart}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open row actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => reactivateStudent(r.id)}>
                              Reactivate Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No completed students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Completed Batches Summary */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-sm mb-3">Completed Batches</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedBatches.length > 0 ? (
                completedBatches.map((batch) => (
                  <Card key={batch.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{batch.name}</p>
                        <p className="text-xs text-muted-foreground">{batch.course}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(batch.startDate)} → {formatDate(batch.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Students: <span className="font-medium">{batch.totalStudents}</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          reactivateBatch(batch.id)
                          window.dispatchEvent(new CustomEvent("student-records:changed"))
                        }}
                      >
                        Reactivate
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">No completed batches yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
