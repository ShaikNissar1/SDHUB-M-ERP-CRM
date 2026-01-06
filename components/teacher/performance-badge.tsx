"use client"

import { Badge } from "@/components/ui/badge"

interface PerformanceBadgeProps {
  status: "Good" | "Average" | "At Risk"
}

export function PerformanceBadge({ status }: PerformanceBadgeProps) {
  const variants = {
    "Good": "default", // green
    "Average": "secondary", // gray
    "At Risk": "destructive", // red
  } as const

  return (
    <Badge variant={variants[status]} className="w-20 justify-center">
      {status}
    </Badge>
  )
}