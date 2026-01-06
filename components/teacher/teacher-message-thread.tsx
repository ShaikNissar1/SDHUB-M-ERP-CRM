"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Reply, MessageSquare } from "lucide-react"

interface Message {
  id: string
  sender: "teacher" | "student"
  message: string
  timestamp: Date
}

interface StudentMessage {
  id: string
  studentName: string
  studentId: string
  subject: string
  messages: Message[]
}

interface TeacherMessageThreadProps {
  selectedMessage: StudentMessage | null
  replyText: string
  onReplyTextChange: (text: string) => void
  onSendReply: () => void
}

export default function TeacherMessageThread({
  selectedMessage,
  replyText,
  onReplyTextChange,
  onSendReply,
}: TeacherMessageThreadProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendReply()
    }
  }

  if (!selectedMessage) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm">Choose a student from the list to view messages</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {selectedMessage.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "teacher" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sender === "teacher"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input */}
      <div className="space-y-2">
        <Input
          placeholder="Type your reply..."
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={onSendReply}
          className="w-full gap-2"
          disabled={!replyText.trim()}
        >
          <Reply className="h-4 w-4" />
          Send Reply
        </Button>
      </div>
    </div>
  )
}