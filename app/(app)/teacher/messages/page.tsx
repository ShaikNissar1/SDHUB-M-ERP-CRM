"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Send, Search, MessageSquare, Bell, User } from "lucide-react"

const messageHistory = [
  {
    id: 1,
    type: "announcement",
    recipient: "Batch B001 - Digital Marketing",
    recipientType: "batch",
    subject: "Class Schedule Change",
    message:
      "Tomorrow's class will be held online due to facility maintenance. Join link will be shared 15 mins before class.",
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: 2,
    type: "reminder",
    recipient: "Batch B002 - Tally ERP",
    recipientType: "batch",
    subject: "Assignment Deadline Reminder",
    message: "This is a reminder that Module 2 assignment is due tomorrow at 5 PM. Please submit on time.",
    timestamp: new Date(Date.now() - 7200000),
    read: true,
  },
  {
    id: 3,
    type: "message",
    recipient: "Asha Verma",
    recipientType: "student",
    subject: "Good Performance",
    message: "Congratulations on scoring 82 in the recent test! Keep up the good work.",
    timestamp: new Date(Date.now() - 86400000),
    read: true,
  },
  {
    id: 4,
    type: "message",
    recipient: "Rohit Kumar",
    recipientType: "student",
    subject: "Need to Improve",
    message:
      "I noticed you scored 65 in the last test. Let's schedule a doubt clearing session. Please reply with your available time.",
    timestamp: new Date(Date.now() - 172800000),
    read: false,
  },
]

export default function TeacherMessagesPage() {
  const [message, setMessage] = useState("")
  const [recipient, setRecipient] = useState("batch")
  const [selectedBatchOrStudent, setSelectedBatchOrStudent] = useState("")
  const [subject, setSubject] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSendMessage = () => {
    if (message.trim() && selectedBatchOrStudent && subject.trim()) {
      console.log("[v0] Sending message:", {
        recipient,
        to: selectedBatchOrStudent,
        subject,
        message,
      })
      // Reset form
      setMessage("")
      setSubject("")
      setSelectedBatchOrStudent("")
    }
  }

  const filteredMessages = messageHistory.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.recipient.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Bell className="h-4 w-4" />
      case "reminder":
        return <Bell className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getMessageTypeBadge = (type: string) => {
    const colors = {
      announcement: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      reminder: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      message: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }
    return colors[type as keyof typeof colors] || colors.message
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Messages</h1>
          <p className="text-muted-foreground mt-2">Communicate with your students and batches</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageHistory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sent this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageHistory.filter((m) => m.type === "announcement").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Batch-wide</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Individual Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messageHistory.filter((m) => m.recipientType === "student").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Personal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageHistory.filter((m) => !m.read).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Send Message Card */}
        <Card>
          <CardHeader>
            <CardTitle>Send Message / Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch">Entire Batch</SelectItem>
                  <SelectItem value="student">Individual Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{recipient === "batch" ? "Select Batch" : "Select Student"}</Label>
              <Select value={selectedBatchOrStudent} onValueChange={setSelectedBatchOrStudent}>
                <SelectTrigger>
                  <SelectValue placeholder={recipient === "batch" ? "Choose batch" : "Choose student"} />
                </SelectTrigger>
                <SelectContent>
                  {recipient === "batch" ? (
                    <>
                      <SelectItem value="B001">Batch B001 - Digital Marketing</SelectItem>
                      <SelectItem value="B002">Batch B002 - Tally ERP</SelectItem>
                      <SelectItem value="B003">Batch B003 - Advanced Excel</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="asha">Asha Verma</SelectItem>
                      <SelectItem value="rohit">Rohit Kumar</SelectItem>
                      <SelectItem value="sara">Sara Khan</SelectItem>
                      <SelectItem value="vikram">Vikram Singh</SelectItem>
                      <SelectItem value="priya">Priya Sharma</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter message subject" />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              className="w-full gap-2"
              disabled={!message.trim() || !selectedBatchOrStudent || !subject.trim()}
            >
              <Send className="h-4 w-4" />
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Message History Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Message History</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No messages found</div>
            ) : (
              filteredMessages.map((msg) => (
                <div key={msg.id} className="rounded-lg border p-4 space-y-2 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1">{getMessageTypeIcon(msg.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{msg.subject}</span>
                          <Badge className={getMessageTypeBadge(msg.type)}>{msg.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span className="truncate">{msg.recipient}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{msg.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {msg.timestamp.toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
