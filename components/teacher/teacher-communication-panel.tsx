"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Send } from "lucide-react"

export default function TeacherCommunicationPanel() {
  const [message, setMessage] = useState("")
  const [recipient, setRecipient] = useState("batch")
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      type: "announcement",
      recipient: "Batch A",
      message: "Class will be held online tomorrow due to maintenance.",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      type: "reminder",
      recipient: "Batch B",
      message: "Assignment submission deadline is tomorrow.",
      timestamp: new Date(Date.now() - 7200000),
    },
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          type: "message",
          recipient: recipient === "batch" ? "Batch A" : "Individual Student",
          message,
          timestamp: new Date(),
        },
      ])
      setMessage("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Message / Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Send to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch">Entire Batch</SelectItem>
                <SelectItem value="student">Individual Student</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select batch or student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch-a">Batch A</SelectItem>
                <SelectItem value="batch-b">Batch B</SelectItem>
                <SelectItem value="batch-c">Batch C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Type your message or announcement here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24"
          />
          <Button onClick={handleSendMessage} className="gap-2">
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
          {messages.map((msg) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
