"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, BookOpen, Eye, CheckCircle, Calendar } from "lucide-react"

interface Batch {
    id: string
    name: string
    course: string
    timings: string
    studentCount: number
    status: "Active" | "Completed"
}

interface TeacherBatchesListProps {
    batches: Batch[]
}

export default function TeacherBatchesList({ batches }: TeacherBatchesListProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
                <Card key={batch.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-lg font-semibold truncate">{batch.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1 truncate">{batch.course}</p>
                            </div>
                            <Badge
                                variant={batch.status === "Active" ? "default" : "secondary"}
                                className="ml-2 shrink-0"
                            >
                                {batch.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Batch Details */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Timings:</span>
                                <span className="font-medium">{batch.timings}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Students:</span>
                                <span className="font-medium">{batch.studentCount}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Link href={`/teacher/batches/${batch.id}/students`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-1">
                                    <Eye className="h-3 w-3" />
                                    View Students
                                </Button>
                            </Link>
                            <Link href={`/teacher/batches/${batch.id}/attendance`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Mark Attendance
                                </Button>
                            </Link>
                            <Link href={`/teacher/batches/${batch.id}/assignments`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Assignments
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}