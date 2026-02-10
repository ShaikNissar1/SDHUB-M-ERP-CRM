"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { useTeacher } from "@/lib/contexts/teacher-context"
import { getBatchesByTeacherId } from "@/lib/supabase/batches"
import { getStudentsByBatch } from "@/lib/supabase/students"
import type { Batch } from "@/lib/supabase/batches"
import type { Student } from "@/lib/supabase/types"

export default function TeacherCommunicationPanel() {
  const { selectedTeacher, isLoading: teacherLoading } = useTeacher()
  const [message, setMessage] = useState("")
  const [recipient, setRecipient] = useState<"batch" | "student">("batch")
  const [batches, setBatches] = useState<Batch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [batchesLoading, setBatchesLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      type: "announcement",
      recipient: "Batch",
      message: "Class will be held online tomorrow due to maintenance.",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      type: "reminder",
      recipient: "Batch",
      message: "Assignment submission deadline is tomorrow.",
      timestamp: new Date(Date.now() - 7200000),
    },
  ])

  // Fetch batches for the selected teacher
  useEffect(() => {
    if (!selectedTeacher?.id) {
      setBatches([])
      setSelectedBatch("")
      setStudents([])
      return
    }

    const fetchBatches = async () => {
      setBatchesLoading(true)
      try {
        const teacherBatches = await getBatchesByTeacherId(selectedTeacher.id)
        console.log("[v0] Fetched batches for teacher:", teacherBatches.length)
        setBatches(teacherBatches)

        // Reset selected batch and students when teacher changes
        setSelectedBatch("")
        setStudents([])
      } catch (error) {
        console.error("Error fetching batches:", error)
        setBatches([])
      } finally {
        setBatchesLoading(false)
      }
    }

    fetchBatches()
  }, [selectedTeacher?.id])

  // Fetch students for the selected batch
  useEffect(() => {
    if (!selectedBatch || recipient !== "student") {
      setStudents([])
      setSelectedStudent("")
      return
    }

    const fetchStudents = async () => {
      setStudentsLoading(true)
      try {
        const batchStudents = await getStudentsByBatch(selectedBatch)
        console.log("[v0] Fetched students for batch:", batchStudents.length)
        setStudents(batchStudents)
        setSelectedStudent("")
      } catch (error) {
        console.error("Error fetching students:", error)
        setStudents([])
      } finally {
        setStudentsLoading(false)
      }
    }

    fetchStudents()
  }, [selectedBatch, recipient])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const recipientName = recipient === "batch"
      ? batches.find(b => b.id === selectedBatch)?.name || "Selected Batch"
      : students.find(s => s.id === selectedStudent)?.name || "Selected Student"

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        type: "message",
        recipient: recipientName,
        message,
        timestamp: new Date(),
      },
    ])
    setMessage("")
  }

  if (teacherLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading teacher data...</span>
        </CardContent>
      </Card>
    )
  }

  if (!selectedTeacher) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Please select a teacher first to use the communication panel.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Message / Announcement</CardTitle>
          <div className="text-sm text-muted-foreground mt-2">
            Currently messaging as: <strong>{selectedTeacher.name}</strong>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={recipient} onValueChange={(value) => {
              setRecipient(value as "batch" | "student")
              setSelectedBatch("")
              setSelectedStudent("")
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Send to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch">Entire Batch</SelectItem>
                <SelectItem value="student">Individual Student</SelectItem>
              </SelectContent>
            </Select>

            {batchesLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading batches...</span>
              </div>
            ) : (
              <Select value={selectedBatch} onValueChange={setSelectedBatch} disabled={batches.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={batches.length === 0 ? "No batches available" : "Select batch or student"} />
                </SelectTrigger>
                <SelectContent>
                  {recipient === "batch" ? (
                    batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} ({batch.id})
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      {batches.map((batch) => (
                        <SelectItem key={`batch-header-${batch.id}`} value={batch.id} disabled>
                          <div className="font-bold">{batch.name}</div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {recipient === "student" && selectedBatch && (
            <div>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading students...</span>
                </div>
              ) : (
                <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={students.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={students.length === 0 ? "No students in this batch" : "Select a student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.roll_number || student.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Textarea
            placeholder="Type your message or announcement here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24"
          />
          <Button 
            onClick={handleSendMessage} 
            className="gap-2"
            disabled={!selectedBatch || (recipient === "student" && !selectedStudent)}
          >
            <Send className="h-4 w-4" />
            Send Message
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No messages sent yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{msg.recipient}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                      {msg.type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
