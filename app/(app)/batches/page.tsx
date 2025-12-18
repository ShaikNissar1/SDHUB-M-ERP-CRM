"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import BatchesTable from "@/components/batches/batches-table"
import { CompletedStudentsTab } from "@/components/batches/completed-students-tab"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddBatchDialog } from "@/components/batches/add-batch-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBatches, updateBatch as updateBatchSupa, deleteBatch as deleteBatchSupa } from "@/lib/supabase/batches"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Batch } from "@/lib/batches"

export default function BatchesPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const filterCourse = sp.get("filterCourse") || ""
  const prefillCourse = sp.get("prefillCourse") || ""
  const openNew = sp.get("new") === "1"

  const [list, setList] = React.useState<Batch[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true

    async function loadBatchesWithCounts() {
      setLoading(true)
      const batches = await getBatches()

      const supabase = getSupabaseClient()
      const batchesWithCounts = await Promise.all(
        batches.map(async (batch) => {
          const { count, error } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("batch_id", batch.id)

          return {
            ...batch,
            total_students: !error ? count || 0 : 0,
          }
        }),
      )

      if (isMounted) {
        setList(batchesWithCounts as Batch[])
        setLoading(false)
      }
    }

    loadBatchesWithCounts()

    return () => {
      isMounted = false
    }
  }, [])

  const rows = React.useMemo<Batch[]>(
    () => (filterCourse ? list.filter((b) => b.course_name?.toLowerCase() === filterCourse.toLowerCase()) : list),
    [list, filterCourse],
  )

  const [openAdd, setOpenAdd] = React.useState<boolean>(openNew)

  const handleAdd = async () => {
    const batches = await getBatches()
    const supabase = getSupabaseClient()
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const { count, error } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("batch_id", batch.id)
        return {
          ...batch,
          total_students: !error ? count || 0 : 0,
        }
      }),
    )
    setList(batchesWithCounts as Batch[])
    router.refresh()
  }

  const handleEdit = async (id: string, payload: Partial<Batch>) => {
    await updateBatchSupa(id, payload)
    const batches = await getBatches()
    const supabase = getSupabaseClient()
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const { count, error } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("batch_id", batch.id)
        return {
          ...batch,
          total_students: !error ? count || 0 : 0,
        }
      }),
    )
    setList(batchesWithCounts as Batch[])
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const batchToDelete = list.find((b) => b.id === id)
    if (!batchToDelete) return

    const confirmed = window.confirm(
      `Delete batch "${batchToDelete.name}" (Status: ${batchToDelete.status})?\n\nThis will remove all associated batch data.`,
    )

    if (!confirmed) return

    await deleteBatchSupa(id)
    const batches = await getBatches()
    const supabase = getSupabaseClient()
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const { count, error } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("batch_id", batch.id)
        return {
          ...batch,
          total_students: !error ? count || 0 : 0,
        }
      }),
    )
    setList(batchesWithCounts as Batch[])
    router.refresh()
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">Batch Management</h1>
          {filterCourse ? (
            <p className="text-sm text-muted-foreground">Filtered by course: {filterCourse}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Create, manage, and review training batches.</p>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <AddBatchDialog
            open={openAdd}
            onOpenChange={setOpenAdd}
            initialValues={prefillCourse ? { course: prefillCourse } : undefined}
            onSubmit={handleAdd}
          />
        </div>
      </header>

      {loading && <div className="text-center py-8 text-muted-foreground">Loading batches...</div>}

      {!loading && (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active & Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed Students</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Track active, upcoming, and completed batches. Use the Actions menu for details, edits, or deletion.
              </CardContent>
            </Card>

            <BatchesTable
              rows={rows}
              onEdit={(id, payload) => handleEdit(id, payload)}
              onDelete={(id) => handleDelete(id)}
            />
          </TabsContent>

          <TabsContent value="completed">
            <CompletedStudentsTab />
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}
