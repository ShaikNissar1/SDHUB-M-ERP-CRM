"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Eye } from "lucide-react"

interface Submission {
    id: string
    studentName: string
    submittedAt: string
    status: "Submitted" | "Graded" | "Pending"
    marks?: number
    maxMarks?: number
    remarks?: string
}

interface SubmissionsTableProps {
    submissions: Submission[]
    assignmentTitle: string
    onGradeSubmission?: (submissionId: string, marks: number, remarks: string) => void
}

export function SubmissionsTable({ submissions, assignmentTitle, onGradeSubmission }: SubmissionsTableProps) {
    const [editingSubmission, setEditingSubmission] = useState<string | null>(null)
    const [marks, setMarks] = useState("")
    const [remarks, setRemarks] = useState("")

    const handleEdit = (submission: Submission) => {
        setEditingSubmission(submission.id)
        setMarks(submission.marks?.toString() || "")
        setRemarks(submission.remarks || "")
    }

    const handleSave = (submissionId: string) => {
        if (onGradeSubmission) {
            onGradeSubmission(submissionId, parseInt(marks), remarks)
        }
        setEditingSubmission(null)
        setMarks("")
        setRemarks("")
    }

    const handleCancel = () => {
        setEditingSubmission(null)
        setMarks("")
        setRemarks("")
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            "Submitted": "default",
            "Graded": "secondary",
            "Pending": "outline",
        } as const

        return (
            <Badge variant={variants[status as keyof typeof variants] || "outline"}>
                {status}
            </Badge>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Submissions for: {assignmentTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                </p>
            </CardHeader>
            <CardContent>
                {submissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No submissions yet</p>
                        <p className="text-sm">Students haven't submitted this assignment yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell className="font-medium">{submission.studentName}</TableCell>
                                    <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                    <TableCell>
                                        {editingSubmission === submission.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={marks}
                                                    onChange={(e) => setMarks(e.target.value)}
                                                    placeholder="Marks"
                                                    className="w-20"
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="text-sm text-muted-foreground">/ 100</span>
                                            </div>
                                        ) : (
                                            <span className="font-medium">
                                                {submission.marks !== undefined ? `${submission.marks}/100` : "-"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingSubmission === submission.id ? (
                                            <Textarea
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="Add remarks..."
                                                rows={2}
                                                className="min-w-[200px]"
                                            />
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {submission.remarks || "-"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {editingSubmission === submission.id ? (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(submission.id)}
                                                    className="gap-1"
                                                >
                                                    <Save className="h-3 w-3" />
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(submission)}
                                                className="gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Grade
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}