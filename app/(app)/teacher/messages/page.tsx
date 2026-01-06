"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, MessageSquare, Bell, Reply, Users } from "lucide-react"
import TeacherMessageList from "@/components/teacher/teacher-message-list"
import TeacherMessageThread from "@/components/teacher/teacher-message-thread"

interface StudentMessage {
  id: string
  studentName: string
  studentId: string
  subject: string
  lastMessage: string
  timestamp: Date
  unread: boolean
  messages: {
    id: string
    sender: "teacher" | "student"
    message: string
    timestamp: Date
  }[]
}

interface AdminMessage {
  id: string
  subject: string
  message: string
  timestamp: Date
  read: boolean
}

export default function TeacherMessagesPage() {
  const [announcementText, setAnnouncementText] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentMessage | null>(null)
  const [replyText, setReplyText] = useState("")

  // Mock data for student messages
  const studentMessages: StudentMessage[] = [
    {
      id: "1",
      studentName: "Asha Verma",
      studentId: "CS001",
      subject: "Doubt in Module 2",
      lastMessage: "Hi teacher, I'm having trouble understanding the database concepts...",
      timestamp: new Date(Date.now() - 3600000),
      unread: true,
      messages: [
        {
          id: "m1",
          sender: "student",
          message: "Hi teacher, I'm having trouble understanding the database concepts in Module 2. Can you please explain the normalization process?",
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
    },
    {
      id: "2",
      studentName: "Rohit Kumar",
      studentId: "CS002",
      subject: "Assignment Extension",
      lastMessage: "I need an extension for the assignment due to personal reasons...",
      timestamp: new Date(Date.now() - 7200000),
      unread: false,
      messages: [
        {
          id: "m2",
          sender: "student",
          message: "Hi teacher, I need an extension for the assignment due to personal reasons. Is it possible to get 2 more days?",
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: "m3",
          sender: "teacher",
          message: "I understand. Please submit by tomorrow evening. Make sure to complete all requirements.",
          timestamp: new Date(Date.now() - 7000000),
        },
      ],
    },
    {
      id: "3",
      studentName: "Sara Khan",
      studentId: "CS003",
      subject: "Good Performance",
      lastMessage: "Thank you for the feedback on my recent test...",
      timestamp: new Date(Date.now() - 86400000),
      unread: false,
      messages: [
        {
          id: "m4",
          sender: "teacher",
          message: "Congratulations on scoring 88% in the recent test! Your understanding of the concepts is excellent.",
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          id: "m5",
          sender: "student",
          message: "Thank you teacher! I'll keep working hard.",
          timestamp: new Date(Date.now() - 86000000),
        },
      ],
    },
  ]

  // Mock data for admin messages
  const adminMessages: AdminMessage[] = [
    {
      id: "1",
      subject: "Faculty Meeting Tomorrow",
      message: "All faculty members are required to attend the monthly meeting tomorrow at 10 AM in the conference room.",
      timestamp: new Date(Date.now() - 1800000),
      read: false,
    },
    {
      id: "2",
      subject: "New Course Material Available",
      message: "Updated course materials for Digital Marketing have been uploaded to the portal. Please review and incorporate in your teaching.",
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
    {
      id: "3",
      subject: "Holiday Notice",
      message: "College will remain closed on January 26th for Republic Day celebrations.",
      timestamp: new Date(Date.now() - 172800000),
      read: true,
    },
  ]

  const handleSendAnnouncement = () => {
    if (announcementText.trim() && selectedBatch) {
      console.log("Sending announcement:", { batch: selectedBatch, message: announcementText })
      setAnnouncementText("")
      setSelectedBatch("")
    }
  }

  const handleSendReply = () => {
    if (replyText.trim() && selectedStudent) {
      console.log("Sending reply to student:", selectedStudent.studentName, replyText)
      setReplyText("")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Communication</h1>
        <p className="text-muted-foreground mt-1">
          Send announcements and communicate with students
        </p>
      </div>

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements">Batch Announcements</TabsTrigger>
          <TabsTrigger value="students">Student Messages</TabsTrigger>
          <TabsTrigger value="admin">Admin Messages</TabsTrigger>
        </TabsList>

        {/* Batch Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Send Batch Announcement
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Send announcements to entire batches
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS-2024-A">CS-2024-A (Computer Science)</SelectItem>
                    <SelectItem value="DM-2024-B">DM-2024-B (Digital Marketing)</SelectItem>
                    <SelectItem value="TE-2024-C">TE-2024-C (Tally ERP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Announcement Message</label>
                <Textarea
                  placeholder="Type your announcement here..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="min-h-32"
                />
              </div>

              <Button
                onClick={handleSendAnnouncement}
                className="w-full gap-2"
                disabled={!announcementText.trim() || !selectedBatch}
              >
                <Send className="h-4 w-4" />
                Send Announcement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Messages Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Student Inbox */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Student Messages
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {studentMessages.length} conversation{studentMessages.length !== 1 ? "s" : ""}
                </p>
              </CardHeader>
              <CardContent>
                <TeacherMessageList
                  messages={studentMessages}
                  selectedMessageId={selectedStudent?.id || null}
                  onMessageSelect={setSelectedStudent}
                />
              </CardContent>
            </Card>

            {/* Message Thread */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Reply className="h-5 w-5" />
                  {selectedStudent ? selectedStudent.studentName : "Select a conversation"}
                </CardTitle>
                {selectedStudent && (
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.studentId} • {selectedStudent.messages.length} message{selectedStudent.messages.length !== 1 ? "s" : ""}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <TeacherMessageThread
                  selectedMessage={selectedStudent}
                  replyText={replyText}
                  onReplyTextChange={setReplyText}
                  onSendReply={handleSendReply}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Messages Tab */}
        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Admin Messages
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {adminMessages.length} message{adminMessages.length !== 1 ? "s" : ""} from administration
              </p>
            </CardHeader>
            <CardContent>
              {adminMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No admin messages</p>
                  <p className="text-sm">Administrative messages will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        !message.read ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{message.subject}</h3>
                            {!message.read && (
                              <Badge variant="secondary" className="text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{message.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(message.timestamp)}</span>
                            <span>•</span>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
