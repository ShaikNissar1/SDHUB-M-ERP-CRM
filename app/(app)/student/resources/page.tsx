"use client"

import ResourcesList from "@/components/student/resources-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentResourcesPage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Resources</h1>
        <p className="text-muted-foreground">Download materials shared by your teachers or admin.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Available Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourcesList />
        </CardContent>
      </Card>
    </main>
  )
}
