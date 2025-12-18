"use client"

import React from "react"

export type Notification = {
  id: string
  type: "batch-completion" | "batch-warning" | "student-admitted"
  title: string
  message: string
  batchId?: string
  createdAt: string
  read: boolean
}

const NOTIFICATIONS_KEY = "sdhub:notifications"

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "read">) {
  if (typeof window === "undefined") return

  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  }

  notifications.push(newNotification)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  window.dispatchEvent(new CustomEvent("notifications:updated"))
}

export function markNotificationAsRead(id: string) {
  if (typeof window === "undefined") return

  const notifications = getNotifications()
  const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent("notifications:updated"))
}

export function clearNotifications() {
  if (typeof window === "undefined") return

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]))
  window.dispatchEvent(new CustomEvent("notifications:updated"))
}

export function createBatchCompletionNotification(batchName: string, batchId: string) {
  addNotification({
    type: "batch-completion",
    title: "Batch Completed",
    message: `Batch "${batchName}" has been automatically marked as completed. All students have been archived.`,
    batchId,
  })
}

export function createBatchWarningNotification(batchName: string, batchId: string, daysRemaining: number) {
  addNotification({
    type: "batch-warning",
    title: "Batch Ending Soon",
    message: `Batch "${batchName}" will end in ${daysRemaining} days. Prepare for batch completion.`,
    batchId,
  })
}

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>(getNotifications)

  React.useEffect(() => {
    const sync = () => setNotifications(getNotifications())
    sync()
    window.addEventListener("notifications:updated" as any, sync as any)
    return () => window.removeEventListener("notifications:updated" as any, sync as any)
  }, [])

  return notifications
}
