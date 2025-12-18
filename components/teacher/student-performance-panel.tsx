"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Edit2, MessageSquare } from "lucide-react"

const performanceData = [
  {
    id: 1,
    name: "Asha Verma",
    module: "Module 1: Basics",
    latestTest: "Test 1",
    score: 82,
    grade: "A",
    remarks: "Good progress",
  },
  {
    id: 2,
    name: "Rohit Kumar",
    module: "Module 2: Advanced",
    latestTest: "Test 2",
    score: 74,
    grade: "B",
    remarks: "Needs improvement",
  },
  {
    id: 3,
    name: "Sara Khan",
    module: "Module 1: Basics",
    latestTest: "Test 1",
    score: 88,
    grade: "A+",
    remarks: "Excellent performance",
  },
]

export default function StudentPerformancePanel() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>({})

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (grade.includes("B")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (grade.includes("C")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance & Marks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Latest Test</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.module}</TableCell>
                  <TableCell>{row.latestTest}</TableCell>
                  <TableCell>
                    {editingId === row.id ? (
                      <Input
                        type="number"
                        value={editData.score || row.score}
                        onChange={(e) => setEditData({ ...editData, score: e.target.value })}
                        className="w-16"
                      />
                    ) : (
                      `${row.score}/100`
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getGradeColor(row.grade)}>{row.grade}</Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === row.id ? (
                      <Input
                        value={editData.remarks || row.remarks}
                        onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                        className="w-32"
                      />
                    ) : (
                      row.remarks
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === row.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setEditingId(null)
                              setEditData({})
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditData({})
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(row.id)
                              setEditData(row)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
