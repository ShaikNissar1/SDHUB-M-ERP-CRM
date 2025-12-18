"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ExamMasterSetup } from "@/components/exams/exam-master-setup"
import { ExamResponsesTable } from "@/components/exams/exam-responses-table"
import type { ExamMasterRecord } from "@/lib/exam-master"

export default function ExamDetailPage() {
  const params = useParams()
  const examId = params.id as string
  const [exam, setExam] = useState<ExamMasterRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // In a real app, fetch from Supabase
    // For now, we'll show the setup guide
    setLoading(false)
  }, [examId])

  function copyExamId() {
    navigator.clipboard.writeText(examId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/exam-master"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exam Master
          </Link>
          <h1 className="text-2xl font-semibold">Exam Setup & Responses</h1>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-muted px-3 py-1 rounded text-sm font-mono">{examId}</code>
          <Button size="sm" variant="outline" onClick={copyExamId}>
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>Follow these steps to connect your Google Form to Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <ExamMasterSetup examId={examId} examTitle="Main Exam" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Responses</CardTitle>
            <CardDescription>All submissions from your Google Form appear here automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <ExamResponsesTable examId={examId} examTitle="Main Exam" />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
