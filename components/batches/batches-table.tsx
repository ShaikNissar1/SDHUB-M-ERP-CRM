"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, EyeIcon, PencilIcon, Trash2Icon, ClipboardList, BarChart2 } from "lucide-react"
import { AddBatchDialog } from "./add-batch-dialog"
import type { Batch } from "@/lib/batches"

type Props = {
  rows: Batch[]
  onEdit: (id: string, payload: Partial<Batch>) => void
  onDelete: (id: string) => void
}

export default function BatchesTable({ rows, onEdit, onDelete }: Props) {
  const [openMT, setOpenMT] = React.useState(false)
  const [activeMT, setActiveMT] = React.useState<{
    id: string
    name: string
    items: { title: string; teachers: string[] }[]
  } | null>(null)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-balance">Batch List</CardTitle>
        {/* Add button removed from here; now lives in page header */}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch ID</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Batch Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Students</TableHead>
              <TableHead>Modules & Teachers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const moduleTeachers = Array.from(new Set((row.moduleAssignments || []).flatMap((m) => m.teachers || [])))
              const teachersLabel = moduleTeachers.length > 0 ? moduleTeachers.join(", ") : "-"

              const formatDateFromISO = (dateStr: string | undefined) => {
                if (!dateStr) return "-"
                try {
                  const date = new Date(dateStr)
                  if (isNaN(date.getTime())) return dateStr
                  return date.toLocaleDateString()
                } catch {
                  return dateStr
                }
              }

              const durationDays = (startStr: string | undefined, endStr: string | undefined) => {
                if (!startStr || !endStr) return "-"
                try {
                  const start = new Date(startStr).getTime()
                  const end = new Date(endStr).getTime()
                  if (isNaN(start) || isNaN(end)) return "-"
                  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
                  return `${days} days`
                } catch {
                  return "-"
                }
              }

              return (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{row.id}</TableCell>
                  <TableCell className="whitespace-nowrap">{row.course_name || row.course}</TableCell>
                  <TableCell className="whitespace-nowrap">{row.name}</TableCell>
                  <TableCell>{formatDateFromISO(row.start_date || row.startDate)}</TableCell>
                  <TableCell>{formatDateFromISO(row.end_date || row.endDate)}</TableCell>
                  <TableCell>{durationDays(row.start_date || row.startDate, row.end_date || row.endDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "Active" ? "default" : row.status === "Upcoming" ? "secondary" : "outline"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.total_students || row.totalStudents || 0}</TableCell>
                  <TableCell className="max-w-[260px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveMT({
                          id: row.id,
                          name: row.name,
                          items: (row.moduleAssignments || []).map((m) => ({
                            title: m.title,
                            teachers: m.teachers || [],
                          })),
                        })
                        setOpenMT(true)
                      }}
                      className="w-full justify-start bg-transparent"
                    >
                      <span className="truncate">{teachersLabel || "View"}</span>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions row={row} onDelete={() => onDelete(row.id)} onEdit={(p) => onEdit(row.id, p)} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Dialog open={openMT} onOpenChange={setOpenMT}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Modules & Teachers {activeMT ? `— ${activeMT.name}` : ""}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {(activeMT?.items || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No module-wise assignment found.</p>
              ) : (
                activeMT!.items.map((it, idx) => (
                  <div key={idx} className="rounded-md border p-3">
                    <div className="text-sm font-medium">{it.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {it.teachers && it.teachers.length ? it.teachers.join(", ") : "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function RowActions({
  row,
  onDelete,
  onEdit,
}: {
  row: Batch
  onDelete: () => void
  onEdit: (payload: Partial<Batch>) => void
}) {
  // local state for edit dialog
  const [openEdit, setOpenEdit] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* removed Users icon import since "View Students" action is removed */}
          <DropdownMenuItem asChild>
            <Link href={`/attendance?batchId=${encodeURIComponent(row.id)}`} className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              View Attendance
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/test-results?batchId=${encodeURIComponent(row.id)}`} className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              View Results
            </Link>
          </DropdownMenuItem>
          {/* keep existing details/edit/delete */}
          <DropdownMenuItem asChild>
            <Link href={`/batches/${encodeURIComponent(row.id)}`} className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Batch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
            <Trash2Icon className="h-4 w-4 mr-2" />
            Delete Batch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Controlled dialog to edit the row */}
      <AddBatchDialog
        isEdit
        open={openEdit}
        onOpenChange={setOpenEdit}
        initialValues={{
          id: row.id,
          course: row.course_name || row.course,
          name: row.name,
          startDate: row.start_date || row.startDate,
          endDate: row.end_date || row.endDate,
          trainer: row.trainer_name || row.trainer,
          maxStudents: row.max_students || row.maxStudents,
          description: row.description,
          status: row.status,
          moduleAssignments: row.moduleAssignments,
          totalStudents: row.total_students || row.totalStudents,
        }}
        onSubmit={(payload) => {
          onEdit(payload)
          setOpenEdit(false)
        }}
        triggerClassName="hidden"
      />
    </>
  )
}
