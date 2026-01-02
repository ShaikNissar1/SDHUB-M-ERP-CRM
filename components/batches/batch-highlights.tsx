"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getBatches, type Batch } from "@/lib/supabase/batches"
import { getFilteredAttendance } from "@/lib/supabase/attendance"
import { getTestResults } from "@/lib/supabase/test-results"
import { Trophy, TrendingUp, Users, Calendar, AlertTriangle } from "lucide-react"

export function BatchHighlights() {
    const [batches, setBatches] = useState<Batch[]>([])
    const [stats, setStats] = useState({
        avgPassRate: 0,
        avgAttendance: 0,
        topBatch: null as Batch | null,
        defaultersCount: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                setLoading(true)
                const batchData = await getBatches()
                const activeBatches = batchData.filter(b => b.status === "Active")
                setBatches(activeBatches)

                const supabase = getSupabaseClient()

                // Fetch global results for pass rate
                const results = await getTestResults()

                // Fetch all student attendance
                const attendance = await getFilteredAttendance(undefined, undefined, undefined, undefined, "student")

                // Calculate Pass Rate
                const passRate = results.length > 0
                    ? Math.round((results.filter(r => (r.score || 0) >= 40).length / results.length) * 100)
                    : 0

                // Calculate Global Avg Attendance
                const attTotal = attendance.length
                const attPresent = attendance.filter(r => r.status === "Present").length
                const globalAtt = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0

                // Calculate Batch Performance to find Top Batch
                // Group test results by student email
                const emailToScore = results.reduce((acc, r) => {
                    if (r.email) acc[r.email] = (acc[r.email] || 0) + (r.score || 0)
                    return acc
                }, {} as Record<string, number>)

                // Group students by batch
                const { data: allStudents } = await supabase.from("students").select("email, batch_id")
                const batchScores = (allStudents || []).reduce((acc, s) => {
                    if (s.batch_id && s.email && emailToScore[s.email]) {
                        if (!acc[s.batch_id]) acc[s.batch_id] = { total: 0, count: 0 }
                        acc[s.batch_id].total += emailToScore[s.email]
                        acc[s.batch_id].count += 1
                    }
                    return acc
                }, {} as Record<string, { total: number; count: number }>)

                let topBatchId = ""
                let maxAvg = -1
                Object.entries(batchScores).forEach(([id, data]) => {
                    const avg = (data as { total: number; count: number }).total / (data as { total: number; count: number }).count
                    if (avg > maxAvg) {
                        maxAvg = avg
                        topBatchId = id
                    }
                })

                const top = activeBatches.find(b => b.id === topBatchId) || activeBatches[0] || null

                // Defaulters Calculation
                const studentAttendance = attendance.reduce((acc, r) => {
                    if (!acc[r.person_id]) acc[r.person_id] = { present: 0, total: 0 }
                    if (r.status === "Present") acc[r.person_id].present++
                    acc[r.person_id].total++
                    return acc
                }, {} as any)

                const defaultersCount = Object.values(studentAttendance).filter((a: any) => (a.present / a.total) < 0.75).length

                setStats({
                    avgPassRate: passRate,
                    avgAttendance: globalAtt,
                    topBatch: top,
                    defaultersCount
                })
            } catch (err) {
                console.error("Error loading dashboard highlights:", err)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    if (loading) return null

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Overview */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Performance Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Avg Pass Rate</p>
                            <h2 className="text-4xl font-bold mt-1 text-green-600">{stats.avgPassRate}%</h2>
                        </div>
                        <Badge variant="outline" className="h-6">Institutional Avg</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Avg Attendance</span>
                                <span className="font-bold">{stats.avgAttendance}%</span>
                            </div>
                            <Progress value={stats.avgAttendance} className="h-2" />
                        </div>

                        {stats.defaultersCount > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-destructive/5 text-destructive rounded-md border border-destructive/20 text-xs">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-semibold">{stats.defaultersCount} students with low attendance!</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg flex items-center gap-4 border">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Top Performing Batch</p>
                            <p className="font-bold underline underline-offset-4">{stats.topBatch?.name || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Batch Progress Bars */}
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> Batch Completion Progress
                    </CardTitle>
                    <Badge variant="secondary">{batches.length} Active Batches</Badge>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {batches.slice(0, 4).map((b) => (
                            <div key={b.id} className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="truncate max-w-[150px]">{b.name}</span>
                                    <span className="text-primary">{b.syllabus_completion_percentage || 0}%</span>
                                </div>
                                <Progress value={b.syllabus_completion_percentage || 0} className="h-1.5" />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>{b.current_module || "No module"}</span>
                                    <span>{b.total_students || 0} Students</span>
                                </div>
                            </div>
                        ))}
                        {batches.length === 0 && <p className="text-sm text-muted-foreground py-4">No active batches found.</p>}
                    </div>
                    {batches.length > 4 && (
                        <div className="mt-6 pt-4 border-t text-center">
                            <Link href="/batches" className="text-primary text-xs font-semibold hover:underline">View All Batch Progress →</Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
