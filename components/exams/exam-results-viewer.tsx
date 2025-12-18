"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getEntranceExamResults, getMainExamResults, getInternalExamResults } from "@/lib/supabase/exam-results"

interface ExamResultsViewerProps {
  examId?: string
  examType: "entrance" | "main" | "internal"
}

export function ExamResultsViewer({ examId, examType }: ExamResultsViewerProps) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        let data
        if (examType === "entrance") {
          data = await getEntranceExamResults()
        } else if (examType === "main" && examId) {
          data = await getMainExamResults(examId)
        } else if (examType === "internal" && examId) {
          data = await getInternalExamResults(examId)
        }

        setResults(data || [])
      } catch (err) {
        console.error("Error fetching results:", err)
        setError("Failed to load exam results")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [examId, examType])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-600">Passed</Badge>
      case "failed":
        return <Badge className="bg-red-600">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getPassPercentage = (score: number, total: number) => {
    return ((score / total) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">Loading results...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-red-600">{error}</CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">No results found yet.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {examType === "entrance" && "Entrance Exam Results"}
          {examType === "main" && "Main Exam Results"}
          {examType === "internal" && "Internal Exam Results"}
        </CardTitle>
        <CardDescription>Total submissions: {results.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell>{result.email}</TableCell>
                  <TableCell>{result.phone}</TableCell>
                  <TableCell className="text-right">
                    {result.score}/{result.total_marks}
                  </TableCell>
                  <TableCell className="text-right">{getPassPercentage(result.score, result.total_marks)}%</TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(result.submitted_at).toLocaleDateString()}
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
