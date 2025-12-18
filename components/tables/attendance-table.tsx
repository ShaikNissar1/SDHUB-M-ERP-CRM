"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Row = { name: string; roleOrCourse: string; checkIn?: string; checkOut?: string; location: string; status: string }
type Status = "Present" | "Absent" | "Late" | "OL"

const students: Row[] = [
  {
    name: "Riya Singh",
    roleOrCourse: "Full Stack",
    checkIn: "09:10",
    checkOut: "17:45",
    location: "Campus A",
    status: "Present",
  },
  { name: "Aditya Verma", roleOrCourse: "Data Science", checkIn: "—", checkOut: "—", location: "—", status: "Absent" },
]

const teachers: Row[] = [
  {
    name: "Arun Sharma",
    roleOrCourse: "Instructor",
    checkIn: "08:55",
    checkOut: "17:40",
    location: "Campus B",
    status: "Present",
  },
  { name: "Vikas Nair", roleOrCourse: "TA", checkIn: "—", checkOut: "—", location: "—", status: "Absent" },
]

export function AttendanceTable({ type }: { type: "students" | "teachers" }) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const rows = type === "students" ? students : teachers
  const [attendance, setAttendance] = useState<Record<string, Status>>(() =>
    Object.fromEntries(rows.map((r) => [r.name, (r.status as Status) || "Absent"])),
  )

  useEffect(() => {
    setAttendance(Object.fromEntries(rows.map((r) => [r.name, (r.status as Status) || "Absent"])))
  }, [type])

  const mark = (name: string, s: Status) => {
    setAttendance((prev) => ({ ...prev, [name]: s }))
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[200px]" />
        <Button variant="outline">Refresh</Button>
      </div>
      <div className="md:hidden grid gap-2">
        {rows.map((r, idx) => {
          const current = attendance[r.name] || (r.status as Status) || "Absent"
          return (
            <div key={idx} className="rounded-lg border p-3 bg-background">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-pretty">{r.name}</div>
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                Status:{" "}
                <span aria-live="polite" aria-atomic="true">
                  {current}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={current === "Present" ? "default" : "outline"}
                  aria-pressed={current === "Present"}
                  aria-label={`Mark ${r.name} Present`}
                  onClick={() => mark(r.name, "Present")}
                >
                  Present
                </Button>

                <Button
                  size="sm"
                  variant={current === "Absent" ? "default" : "outline"}
                  aria-pressed={current === "Absent"}
                  aria-label={`Mark ${r.name} Absent`}
                  onClick={() => mark(r.name, "Absent")}
                >
                  Absent
                </Button>

                <Button
                  size="sm"
                  variant={current === "OL" ? "default" : "outline"}
                  aria-pressed={current === "OL"}
                  aria-label={`Mark ${r.name} On Leave`}
                  onClick={() => mark(r.name, "OL")}
                >
                  OL
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="rounded-lg border overflow-x-auto hidden md:block">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>{type === "students" ? "Course" : "Role"}</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => {
              const current = attendance[r.name] || (r.status as Status) || "Absent"
              return (
                <TableRow key={idx} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.roleOrCourse}</TableCell>
                  <TableCell>{r.checkIn || "—"}</TableCell>
                  <TableCell>{r.checkOut || "—"}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell>{current}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-pressed={current === "Present"}
                        onClick={() => mark(r.name, "Present")}
                      >
                        Mark Present
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-pressed={current === "Late"}
                        onClick={() => mark(r.name, "Late")}
                      >
                        Late
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-pressed={current === "Absent"}
                        onClick={() => mark(r.name, "Absent")}
                      >
                        Absent
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-pressed={current === "OL"}
                        onClick={() => mark(r.name, "OL")}
                      >
                        OL
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
