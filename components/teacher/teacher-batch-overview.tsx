"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Eye } from "lucide-react"

const batchData = [
  {
    id: "B001",
    course: "Digital Marketing",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    students: 25,
    status: "Active",
  },
  {
    id: "B002",
    course: "Tally ERP",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    students: 18,
    status: "Active",
  },
  {
    id: "B003",
    course: "Advanced Excel",
    startDate: "2023-11-01",
    endDate: "2024-01-31",
    students: 22,
    status: "Completed",
  },
]

export default function TeacherBatchOverview() {
  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Batches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchData.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.id}</TableCell>
                  <TableCell>{batch.course}</TableCell>
                  <TableCell>{new Date(batch.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(batch.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{batch.students}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
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
