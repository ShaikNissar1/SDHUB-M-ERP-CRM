"use client"
import Link from "next/link"
import { type ExamRecord, updateExam } from "@/lib/exams"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExamSetupGuide } from "@/components/exams/exam-setup-guide"
import { HelpCircle } from "lucide-react"
import { useState } from "react"

type Props = {
  rows: ExamRecord[]
}

export function ExamsTable({ rows }: Props) {
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null)

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left">
            <th className="p-3 w-[64px]">S.No</th>
            <th className="p-3">Exam Title</th>
            <th className="p-3">Course</th>
            <th className="p-3">Type</th>
            <th className="p-3">Batch</th>
            <th className="p-3">Total</th>
            <th className="p-3">Pass</th>
            <th className="p-3">Form Link</th>
            <th className="p-3">Sheet Link</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="p-3 text-muted-foreground" colSpan={12}>
                No exams yet.
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.course || "-"}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.batch || "-"}</td>
                <td className="p-3">{r.totalMarks ?? "-"}</td>
                <td className="p-3">{r.passingMarks ?? "-"}</td>
                <td className="p-3">
                  {r.formLink ? (
                    <Link href={r.formLink} target="_blank" className="underline underline-offset-2">
                      Open Form
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3">
                  {r.sheetLink ? (
                    <Link href={r.sheetLink} target="_blank" className="underline underline-offset-2">
                      Open Sheet
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3">
                  <Badge variant={r.status === "Active" ? "default" : "secondary"}>{r.status}</Badge>
                </td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateExam(r.id, { status: r.status === "Active" ? "Inactive" : "Active" })}
                    >
                      {r.status === "Active" ? "Close" : "Activate"}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedExam(r)}
                          title="View setup instructions"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Setup Guide: {r.title}</DialogTitle>
                        </DialogHeader>
                        <ExamSetupGuide examTitle={r.title} formLink={r.formLink} sheetLink={r.sheetLink} />
                      </DialogContent>
                    </Dialog>
                    <Link className="text-xs underline underline-offset-2" href="/test-results">
                      Test Results
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
