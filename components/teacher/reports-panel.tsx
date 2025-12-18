"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Batch</Label>
        <Select defaultValue="mathsA">
          <SelectTrigger>
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mathsA">Maths - A</SelectItem>
            <SelectItem value="physicsB">Physics - B</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select defaultValue="attendance">
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attendance">Attendance</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Month</Label>
        <Input type="month" defaultValue="2025-10" />
      </div>
      <div className="md:col-span-3 flex items-center justify-end gap-2">
        <Button variant="outline">Preview</Button>
        <Button>Export PDF</Button>
      </div>
    </div>
  )
}
