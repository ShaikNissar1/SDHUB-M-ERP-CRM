"use client"
import { useEffect, useState } from "react"
import { LeadsTable } from "@/components/tables/leads-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loadLeads, todayYMDLocal } from "@/lib/leads"

export default function EnquiriesPage() {
  const [upcoming, setUpcoming] = useState<
    Array<{ name: string; course: string; nextFollowUpDate?: string; string; remarks?: string }>
  >([])
  useEffect(() => {
    const leads = loadLeads()
    const today = todayYMDLocal()
    const data = leads
      .filter((l) => l.nextFollowUpDate)
      .sort((a, b) => (a.nextFollowUpDate! < b.nextFollowUpDate! ? -1 : 1))
      .slice(0, 10)
    setUpcoming(data as any)
  }, [])

  return (
    <main className="grid gap-4">
      <Card id="followups">
        <CardHeader>
          <CardTitle>Upcoming Follow-Ups</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Course</th>
                <th className="py-2 pr-3 font-medium">Next Follow-Up</th>
                <th className="py-2 pr-3 font-medium">HR</th>
                <th className="py-2 pr-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 ? (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={5}>
                    No scheduled follow-ups yet.
                  </td>
                </tr>
              ) : (
                upcoming.map((u, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3">{u.name}</td>
                    <td className="py-2 pr-3">{u.course}</td>
                    <td className="py-2 pr-3">{u.nextFollowUpDate}</td>
                   
                    <td className="py-2 pr-3 max-w-[360px] truncate">{u.remarks || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Enquiries table */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsTable />
        </CardContent>
      </Card>
    </main>
  )
}
