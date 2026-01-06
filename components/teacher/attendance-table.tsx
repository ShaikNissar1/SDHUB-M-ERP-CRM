"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Calendar } from "lucide-react"

interface Student {
  id: string
  name: string
  rollNumber: string
}

interface AttendanceRecord {
  studentId: string
  status: "Present" | "Absent" | "Leave"
}

interface AttendanceTableProps {
  students: Student[]
  attendance: AttendanceRecord[]
  onAttendanceChange: (studentId: string, status: "Present" | "Absent" | "Leave") => void
}

export function AttendanceTable({ students, attendance, onAttendanceChange }: AttendanceTableProps) {
  const getStatusBadge = (status: "Present" | "Absent" | "Leave") => {
    const variants = {
      Present: "default",
      Absent: "destructive",
      Leave: "secondary",
    } as const

    return (
      <Badge variant={variants[status]} className="w-20 justify-center">
        {status}
      </Badge>
    )
  }

  const getCurrentStatus = (studentId: string): "Present" | "Absent" | "Leave" => {
    const record = attendance.find(a => a.studentId === studentId)
    return record?.status || "Present"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Student Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-32">Roll No.</TableHead>
              <TableHead className="w-32 text-center">Status</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(getCurrentStatus(student.id))}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={getCurrentStatus(student.id) === "Present" ? "default" : "outline"}
                      onClick={() => onAttendanceChange(student.id, "Present")}
                      className="h-8 px-2 text-xs"
                    >
                      P
                    </Button>
                    <Button
                      size="sm"
                      variant={getCurrentStatus(student.id) === "Absent" ? "destructive" : "outline"}
                      onClick={() => onAttendanceChange(student.id, "Absent")}
                      className="h-8 px-2 text-xs"
                    >
                      A
                    </Button>
                    <Button
                      size="sm"
                      variant={getCurrentStatus(student.id) === "Leave" ? "secondary" : "outline"}
                      onClick={() => onAttendanceChange(student.id, "Leave")}
                      className="h-8 px-2 text-xs"
                    >
                      L
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}