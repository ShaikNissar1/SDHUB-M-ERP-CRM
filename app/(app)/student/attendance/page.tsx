"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { Calendar } from "@/components/ui/calendar"
import { format, startOfMonth, endOfMonth, parseISO, isSameMonth } from "date-fns"
import { ChevronLeft, ChevronRight, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStudent } from "@/lib/contexts/student-context"

interface AttendanceRecord {
  date: string
  status: string
  check_in?: string
  check_out?: string
}

interface AttendanceStats {
  overall: number
  monthly: number
  present: number
  absent: number
  leave: number
  total: number
}

export default function StudentAttendancePage() {
  const { selectedStudent } = useStudent()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    overall: 0,
    monthly: 0,
    present: 0,
    absent: 0,
    leave: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedStudent) {
      fetchAttendance()
    }
  }, [currentMonth, selectedStudent])

  async function fetchAttendance() {
    if (!selectedStudent) return

    try {
      const supabase = createBrowserClient()

      const { data: allRecords } = await supabase
        .from("attendance")
        .select("date, status, check_in, check_out")
        .eq("person_id", selectedStudent.id)
        .eq("type", "student")
        .order("date", { ascending: false })

      console.log("[v0] Fetched attendance records:", allRecords?.length || 0)
      console.log(
        "[v0] Sample statuses:",
        allRecords?.slice(0, 3).map((r) => r.status),
      )

      if (allRecords) {
        setAttendance(allRecords)

        // Calculate stats
        const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd")
        const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd")

        const monthRecords = allRecords.filter((r) => r.date >= monthStart && r.date <= monthEnd)

        const totalAll = allRecords.length
        const presentAll = allRecords.filter((r) => r.status === "Present").length
        const overallPercentage = totalAll > 0 ? (presentAll / totalAll) * 100 : 0

        const totalMonth = monthRecords.length
        const presentMonth = monthRecords.filter((r) => r.status === "Present").length
        const absentMonth = monthRecords.filter((r) => r.status === "Absent").length
        const leaveMonth = monthRecords.filter((r) => r.status === "On Leave").length
        const monthlyPercentage = totalMonth > 0 ? (presentMonth / totalMonth) * 100 : 0

        setStats({
          overall: Math.round(overallPercentage * 10) / 10,
          monthly: Math.round(monthlyPercentage * 10) / 10,
          present: presentMonth,
          absent: absentMonth,
          leave: leaveMonth,
          total: totalMonth,
        })

        console.log("[v0] Attendance stats:", {
          overall: overallPercentage,
          monthly: monthlyPercentage,
          total: totalMonth,
          present: presentMonth,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  function getAttendanceForDate(date: Date): AttendanceRecord | undefined {
    const dateStr = format(date, "yyyy-MM-dd")
    return attendance.find((r) => r.date === dateStr)
  }

  function getStatusColor(percentage: number): string {
    if (percentage >= 85) return "text-green-600"
    if (percentage >= 75) return "text-amber-600"
    return "text-red-600"
  }

  function getAttendanceInsight(): { type: "success" | "warning" | "error"; message: string } | null {
    if (stats.total === 0) {
      return {
        type: "warning",
        message: "No attendance records yet. Attendance will appear once classes start.",
      }
    }
    if (stats.monthly >= 95) {
      return {
        type: "success",
        message: "Excellent! You have outstanding attendance this month.",
      }
    }
    if (stats.overall < 75) {
      return {
        type: "error",
        message: "Attendance below 75%. Please contact admin to discuss your attendance.",
      }
    }
    if (stats.monthly < 85) {
      return {
        type: "warning",
        message: "Your attendance this month needs improvement. Aim for 85% or higher.",
      }
    }
    return {
      type: "success",
      message: "Good attendance! Keep maintaining regular presence.",
    }
  }

  const insight = getAttendanceInsight()
  const selectedDateRecord = selectedDate ? getAttendanceForDate(selectedDate) : null

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  if (!selectedStudent) {
    return (
      <main className="flex flex-col gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a student from the dropdown above</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">My Attendance</h1>
        <p className="text-muted-foreground">Track your daily attendance and maintain regularity</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-semibold ${getStatusColor(stats.overall)}`}>
              {stats.overall > 0 ? `${stats.overall.toFixed(1)}%` : "Not Started"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${attendance.filter((r) => r.status === "Present").length} days present`
                : "No records yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-semibold ${getStatusColor(stats.monthly)}`}>
              {stats.total > 0 ? `${stats.monthly.toFixed(1)}%` : "0.0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${stats.present} / ${stats.total} days` : "No records this month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats.overall >= 85 ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-xl font-semibold text-green-600">On Track</span>
                </>
              ) : stats.overall >= 75 ? (
                <>
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                  <span className="text-xl font-semibold text-amber-600">Warning</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <span className="text-xl font-semibold text-red-600">Critical</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overall >= 85 ? "Keep it up!" : stats.overall >= 75 ? "Needs improvement" : "Action required"}
            </p>
          </CardContent>
        </Card>
      </section>

      {insight && (
        <Alert
          variant={insight.type === "error" ? "destructive" : "default"}
          className={
            insight.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : insight.type === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : ""
          }
        >
          <AlertDescription className="flex items-start gap-2">
            {insight.type === "success" && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
            {insight.type === "warning" && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            {insight.type === "error" && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            <span>{insight.message}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Compact Calendar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{format(currentMonth, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                present: (date) => {
                  const record = getAttendanceForDate(date)
                  return record?.status === "Present"
                },
                absent: (date) => {
                  const record = getAttendanceForDate(date)
                  return record?.status === "Absent"
                },
                leave: (date) => {
                  const record = getAttendanceForDate(date)
                  return record?.status === "On Leave"
                },
              }}
              modifiersStyles={{
                present: {
                  backgroundColor: "hsl(142, 71%, 88%)",
                  color: "hsl(142, 71%, 25%)",
                  fontWeight: 600,
                },
                absent: {
                  backgroundColor: "hsl(0, 71%, 88%)",
                  color: "hsl(0, 71%, 30%)",
                  fontWeight: 600,
                },
                leave: {
                  backgroundColor: "hsl(217, 71%, 88%)",
                  color: "hsl(217, 71%, 30%)",
                  fontWeight: 600,
                },
              }}
              className="w-full"
            />
            <div className="flex flex-col gap-1.5 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 88%)" }} />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(0, 71%, 88%)" }} />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(217, 71%, 88%)" }} />
                <span>On Leave</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Day Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateRecord ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-lg font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${selectedDateRecord.status === "Present" ? "bg-green-100 text-green-800" : ""}
                        ${selectedDateRecord.status === "Absent" ? "bg-red-100 text-red-800" : ""}
                        ${selectedDateRecord.status === "On Leave" ? "bg-blue-100 text-blue-800" : ""}
                      `}
                      >
                        {selectedDateRecord.status}
                      </div>
                    </div>
                  </div>
                  {selectedDateRecord.check_in && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in Time</p>
                      <p className="text-base font-medium">{selectedDateRecord.check_in}</p>
                    </div>
                  )}
                  {selectedDateRecord.check_out && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out Time</p>
                      <p className="text-base font-medium">{selectedDateRecord.check_out}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No attendance record for {format(selectedDate, "MMMM d, yyyy")}</p>
                  {selectedDate.getDay() === 0 && <p className="text-sm mt-1">This was a Sunday (Holiday)</p>}
                </div>
              )
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>Select a date to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary ({format(currentMonth, "MMMM yyyy")})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Present:</span>{" "}
                <span className="font-semibold text-green-600">{stats.present} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Absent:</span>{" "}
                <span className="font-semibold text-red-600">{stats.absent} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Leave:</span>{" "}
                <span className="font-semibold text-blue-600">{stats.leave} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Recent attendance records</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Day</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Check-in</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance
                    .filter((r) => isSameMonth(parseISO(r.date), currentMonth))
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 10)
                    .map((record) => (
                      <tr key={record.date} className="border-b last:border-0">
                        <td className="p-2">{format(parseISO(record.date), "MMM d, yyyy")}</td>
                        <td className="p-2">{format(parseISO(record.date), "EEEE")}</td>
                        <td className="p-2">
                          <span
                            className={`
                            inline-block px-2 py-0.5 rounded text-xs font-medium
                            ${record.status === "Present" ? "bg-green-100 text-green-800" : ""}
                            ${record.status === "Absent" ? "bg-red-100 text-red-800" : ""}
                            ${record.status === "On Leave" ? "bg-blue-100 text-blue-800" : ""}
                          `}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">{record.check_in || "—"}</td>
                        <td className="p-2 text-muted-foreground">{record.check_out || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No attendance records available</div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
