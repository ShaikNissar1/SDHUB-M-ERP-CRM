"use client"

import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"

interface StudentMessage {
    id: string
    studentName: string
    studentId: string
    subject: string
    lastMessage: string
    timestamp: Date
    unread: boolean
}

interface TeacherMessageListProps {
    messages: StudentMessage[]
    selectedMessageId: string | null
    onMessageSelect: (message: StudentMessage) => void
}

export default function TeacherMessageList({
    messages,
    selectedMessageId,
    onMessageSelect,
}: TeacherMessageListProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (messages.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No messages</p>
                <p className="text-sm">Student messages will appear here</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedMessageId === message.id
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                    onClick={() => onMessageSelect(message)}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">{message.studentName}</span>
                                {message.unread && (
                                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                        New
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground truncate">
                                {message.subject}
                            </p>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                                {message.lastMessage}
                            </p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}