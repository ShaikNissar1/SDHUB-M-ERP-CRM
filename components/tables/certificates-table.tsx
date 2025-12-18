"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

const rows = [
  { student: "Meera Das", course: "UI/UX", date: "2025-09-30", status: "Issued" },
  { student: "Riya Singh", course: "Full Stack", date: "—", status: "Pending" },
]

export function CertificatesTable() {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Completion Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} className="hover:bg-muted/40">
              <TableCell className="font-medium">{r.student}</TableCell>
              <TableCell>{r.course}</TableCell>
              <TableCell>{r.date}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-2">
                  <Button variant="ghost" size="sm">
                    Generate Certificate
                  </Button>
                  <Button variant="ghost" size="sm">
                    Download PDF
                  </Button>
                  <Button variant="ghost" size="sm">
                    Mark as Issued
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
