"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const items = [
  { name: "Term-1 Completion", status: "Ready" as const },
  { name: "Chemistry Lab", status: "Pending" as const },
]

export default function CertificatesList() {
  return (
    <ul className="divide-y">
      {items.map((c) => (
        <li key={c.name} className="flex items-center justify-between py-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{c.name}</p>
            <Badge variant={c.status === "Ready" ? "default" : "secondary"} className="mt-1">
              {c.status}
            </Badge>
          </div>
          <Button size="sm" disabled={c.status !== "Ready"}>
            {c.status === "Ready" ? "Download" : "Not Ready"}
          </Button>
        </li>
      ))}
    </ul>
  )
}
