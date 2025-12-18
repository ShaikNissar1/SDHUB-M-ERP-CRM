"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const rows = [
  { name: "Asha Verma", course: "Maths", attendance: 94, lastTest: 82, performance: "Good" },
  { name: "Rohit Kumar", course: "Physics", attendance: 87, lastTest: 74, performance: "Average" },
  { name: "Sara Khan", course: "Chemistry", attendance: 91, lastTest: 88, performance: "Excellent" },
]

export default function StudentsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Attendance %</TableHead>
          <TableHead>Last Test Score</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>{r.course}</TableCell>
            <TableCell>{r.attendance}%</TableCell>
            <TableCell>{r.lastTest}</TableCell>
            <TableCell>{r.performance}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                View Student
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
