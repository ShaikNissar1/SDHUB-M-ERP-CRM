"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, CalendarCheck } from "lucide-react"

export default function StudentKpiCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Attendance %</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold">89%</div>
            <CalendarCheck className="h-5 w-5 text-foreground/60" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Performance %</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold">81%</div>
            <BarChart3 className="h-5 w-5 text-foreground/60" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Average score</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={68} />
          <p className="text-xs text-muted-foreground mt-1">Overall</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Certificate Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Pending</div>
          <Badge variant="secondary" className="text-xs">
            Awaiting
          </Badge>
        </CardContent>
      </Card>
    </section>
  )
}
