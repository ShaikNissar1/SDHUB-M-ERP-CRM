"use client"

import { Button } from "@/components/ui/button"

const resources = [
  { name: "Welcome Kit.pdf", size: "1.2 MB" },
  { name: "Student Commitment Form.pdf", size: "650 KB" },
  { name: "Class Schedule - Term 1.pdf", size: "420 KB" },
]

export default function ResourcesList() {
  return (
    <ul className="divide-y">
      {resources.map((r) => (
        <li key={r.name} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.size}</p>
          </div>
          <Button variant="outline" size="sm">
            Download
          </Button>
        </li>
      ))}
    </ul>
  )
}
