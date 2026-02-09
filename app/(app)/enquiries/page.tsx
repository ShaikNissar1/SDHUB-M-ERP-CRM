"use client"
import { useEffect, useState } from "react"
import { LeadsTable } from "@/components/tables/leads-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVerticalIcon, UsersIcon, PhoneCallIcon } from "lucide-react"
import { useSupabaseLeads } from "@/hooks/use-supabase-leads"

type Range = "today" | "week" | "month"

function filterLeadsByDateRange(leads: any[], range: Range) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return leads.filter((lead) => {
    if (!lead.created_at) return false
    const leadDate = new Date(lead.created_at)
    if (range === "today") return leadDate >= startOfToday
    if (range === "week") return leadDate >= startOfWeek
    if (range === "month") return leadDate >= startOfMonth
    return true
  })
}

export default function EnquiriesPage() {
  const { leads: supabaseLeads } = useSupabaseLeads()
  const [kpi, setKpi] = useState({ today: 0, week: 0, month: 0, followUpsAll: 0, followUpsToday: 0 })
  const [enquiriesRange, setEnquiriesRange] = useState<Range>("month")
  const [followUpsView, setFollowUpsView] = useState<"all" | "today">("all")

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const filteredToday = filterLeadsByDateRange(supabaseLeads, "today")
    const filteredWeek = filterLeadsByDateRange(supabaseLeads, "week")
    const filteredMonth = filterLeadsByDateRange(supabaseLeads, "month")

    let followUpsAll = 0
    let followUpsToday = 0
    for (const lead of supabaseLeads) {
      const nextFU = lead.next_follow_up_date
      if (nextFU) {
        followUpsAll++
        if (nextFU === today) followUpsToday++
      }
    }

    setKpi({
      today: filteredToday.length,
      week: filteredWeek.length,
      month: filteredMonth.length,
      followUpsAll,
      followUpsToday,
    })
  }, [supabaseLeads])

  return (
    <main className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border border-border/70 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2 border-b bg-card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-sm font-medium text-pretty truncate">Enquiries</CardTitle>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm" aria-label="Enquiries range options">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setEnquiriesRange("today")}>Today</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEnquiriesRange("week")}>This Week</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEnquiriesRange("month")}>This Month</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                <UsersIcon className="h-4 w-4" />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded px-1.5 py-0.5 bg-muted">{enquiriesRange}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-w-0 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-3xl font-semibold tracking-tight truncate tabular-nums">
                {enquiriesRange === "today" ? kpi.today : enquiriesRange === "week" ? kpi.week : kpi.month}
              </div>
            </div>
            <div className="mt-2">
              <a href="/enquiries" className="text-xs underline underline-offset-2">
                Open Enquiries
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/70 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2 border-b bg-card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-sm font-medium text-pretty truncate">Scheduled Follow-Ups</CardTitle>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm" aria-label="Followups options">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setFollowUpsView("all")}>All Follow-Ups</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFollowUpsView("today")}>Today</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                <PhoneCallIcon className="h-4 w-4" />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded px-1.5 py-0.5 bg-muted">{followUpsView}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-w-0 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-3xl font-semibold tracking-tight truncate tabular-nums">{followUpsView === "today" ? kpi.followUpsToday : kpi.followUpsAll}</div>
            </div>
            <div className="mt-2">
              <a href="/enquiries?filter=followups" className="text-xs underline underline-offset-2">
                View Follow-Ups
              </a>
            </div>
          </CardContent>
        </Card>

      </div>

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
