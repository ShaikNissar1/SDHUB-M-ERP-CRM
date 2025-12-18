"use client"

import * as React from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"

type StudentRecord = {
  id: string
  name: string
  email: string
  phone: string
  course?: string
  batchNumber?: string
  batchStart?: string
  submittedAt?: string
  status?: "Active" | "Completed"
}

const STORAGE_KEY = "sdhub:student-records"

function readRecords(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as StudentRecord[]
    // Ensure each record has an id for linking to documents page
    return list.map((r, i) => ({ id: r.id || String(i), ...r }))
  } catch {
    return []
  }
}

function removeRecord(id: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? (JSON.parse(raw) as StudentRecord[]) : []
    const next = list.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent("student-records:changed"))
  } catch {
    // no-op
  }
}

function reactivateStudent(id: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? (JSON.parse(raw) as StudentRecord[]) : []
    const updated = list.map((r) => (r.id === id ? { ...r, status: "Active" } : r))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("student-records:changed"))
  } catch {
    // no-op
  }
}

export function StudentsTable({ courseFilter, showCompleted }: { courseFilter?: string; showCompleted?: boolean }) {
  const [rows, setRows] = React.useState<StudentRecord[]>([])

  React.useEffect(() => {
    const sync = () => setRows(readRecords())
    sync()
    window.addEventListener("student-records:changed" as any, sync as any)
    return () => window.removeEventListener("student-records:changed" as any, sync as any)
  }, [])

  const filtered = React.useMemo(() => {
    let base = rows

    if (!showCompleted) {
      base = base.filter((r) => r.status !== "Completed")
    }

    if (!courseFilter) return base
    return base.filter((r) => (r.course || "").toLowerCase().includes(courseFilter.toLowerCase()))
  }, [rows, courseFilter, showCompleted])

  return (
    <div className="space-y-2">
      {courseFilter && (
        <div className="text-sm">
          <span className="font-medium">Currently viewing:</span>{" "}
          <span className="px-2 py-0.5 rounded-full border text-xs">{courseFilter} Students</span>{" "}
          <Button asChild variant="link" size="sm" className="px-1 h-auto">
            <Link href="/students">Clear filter</Link>
          </Button>
        </div>
      )}
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
              <TableHead>Batch Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, idx) => (
              <TableRow key={r.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{idx + 1}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.course}</TableCell>
                <TableCell>{r.batchNumber}</TableCell>
                <TableCell>{r.batchStart}</TableCell>
                <TableCell>
                  <Badge variant={r.status === "Completed" ? "secondary" : "default"}>{r.status || "Active"}</Badge>
                </TableCell>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/documents/${encodeURIComponent(r.id)}`}>View</Link>
                      </DropdownMenuItem>
                      {r.status === "Completed" && (
                        <DropdownMenuItem onClick={() => reactivateStudent(r.id)}>Reactivate</DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm("Delete this student record?")) removeRecord(r.id)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                  No student records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
