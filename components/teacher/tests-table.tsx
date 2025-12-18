"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type TestRow = { id: number; student: string; test: string; score: number; feedback: string }

export default function TestsTable() {
  const [rows, setRows] = React.useState<TestRow[]>([
    { id: 1, student: "Asha Verma", test: "Algebra", score: 78, feedback: "Revise quadratics" },
    { id: 2, student: "Rohit Kumar", test: "Mechanics", score: 85, feedback: "Strong" },
  ])

  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ student: "", test: "", score: "", feedback: "" })

  const addRow = () => {
    if (!form.student || !form.test || !form.score) return
    setRows((r) => [
      ...r,
      { id: Date.now(), student: form.student, test: form.test, score: Number(form.score), feedback: form.feedback },
    ])
    setForm({ student: "", test: "", score: "", feedback: "" })
    setOpen(false)
  }

  const avg = rows.length > 0 ? Math.round(rows.reduce((acc, r) => acc + r.score, 0) / rows.length) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Average Score: <span className="font-medium text-foreground">{avg}%</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Test</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Test</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input
                placeholder="Student"
                value={form.student}
                onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}
              />
              <Input
                placeholder="Test Name"
                value={form.test}
                onChange={(e) => setForm((f) => ({ ...f, test: e.target.value }))}
              />
              <Input
                placeholder="Score"
                type="number"
                value={form.score}
                onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              />
              <Input
                placeholder="Feedback"
                value={form.feedback}
                onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
              />
              <Button onClick={addRow}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Test Name</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.student}</TableCell>
              <TableCell>{r.test}</TableCell>
              <TableCell>{r.score}</TableCell>
              <TableCell className="text-muted-foreground">{r.feedback}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
