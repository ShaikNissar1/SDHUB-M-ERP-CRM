"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExamResultsViewer } from "./exam-results-viewer"

interface ExamResultsDialogProps {
  examId: string
  examType: "entrance_exam" | "main_exam" | "internal_exam"
  trigger: ReactNode
}

export function ExamResultsDialog({ examId, examType, trigger }: ExamResultsDialogProps) {
  const typeMap = {
    entrance_exam: "entrance",
    main_exam: "main",
    internal_exam: "internal",
  } as const

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {examType === "entrance_exam" && "Entrance Exam Results"}
            {examType === "main_exam" && "Main Exam Results"}
            {examType === "internal_exam" && "Internal Exam Results"}
          </DialogTitle>
          <DialogDescription>View all submissions and results for this exam</DialogDescription>
        </DialogHeader>
        <ExamResultsViewer examId={examId} examType={typeMap[examType]} />
      </DialogContent>
    </Dialog>
  )
}
