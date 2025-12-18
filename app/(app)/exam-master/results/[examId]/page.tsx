"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from "lucide-react"

interface ExamResult {
  id: string
  name: string
  email: string
  phone: string
  score: number
  total_marks?: number
  submitted_at: string
}

export default function ExamResultsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const examId = params.examId as string
  const examType = (searchParams.get("type") as string) || "main_exam"

  const [results, setResults] = useState<ExamResult[]>([])
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        let endpoint = ""
        if (examType === "entrance_exam") {
          endpoint = "/api/exam-results/entrance"
        } else if (examType === "main_exam") {
          endpoint = `/api/exam-results/main?examId=${examId}`
        } else if (examType === "internal_exam") {
          endpoint = `/api/exam-results/internal?examId=${examId}`
        }

        const response = await fetch(endpoint)
        if (!response.ok) throw new Error("Failed to fetch results")

        const data = await response.json()
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

  useEffect(() => {
    let filtered = results

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.phone.includes(searchTerm),
      )
    }

    setFilteredResults(filtered)
    setCurrentPage(1) // Reset to first page on search
  }, [results, searchTerm])

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage)

  const downloadCSV = () => {
    const headers = ["S.No", "Name", "Email", "Phone", "Score", "Submitted Date"]
    const rows = filteredResults.map((r, index) => [
      index + 1,
      r.name,
      r.email,
      r.phone,
      r.total_marks ? `${r.score}/${r.total_marks}` : r.score,
      new Date(r.submitted_at).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `exam-results-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const examTypeLabel =
    {
      entrance_exam: "Entrance Exam",
      main_exam: "Main Exam",
      internal_exam: "Internal Exam",
    }[examType] || "Exam"

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{examTypeLabel} Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Total submissions: {filteredResults.length}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search by Name, Email, or Phone</label>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={downloadCSV} variant="outline" className="h-9 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Loading results...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center text-red-600">{error}</CardContent>
        </Card>
      ) : filteredResults.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">No results found.</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">S.No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result, index) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium text-muted-foreground">{startIndex + index + 1}</TableCell>
                        <TableCell className="font-medium">{result.name}</TableCell>
                        <TableCell>{result.email}</TableCell>
                        <TableCell>{result.phone}</TableCell>
                        <TableCell className="text-right">
                          {result.total_marks ? `${result.score}/${result.total_marks}` : result.score}
                        </TableCell>
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

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
