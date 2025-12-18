"use client"

import { updateBatch, deleteBatch, createBatch, useBatches } from "@/lib/batches"
import BatchesTable from "@/components/batches/batches-table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { AddBatchDialog } from "@/components/batches/add-batch-dialog"

export default function TeacherBatchesPage() {
  const batches = useBatches()
  const [openAdd, setOpenAdd] = useState(false)

  const handleEdit = (id: string, payload: any) => {
    updateBatch(id, payload)
  }

  const handleDelete = (id: string) => {
    deleteBatch(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Batches</h1>
          <p className="text-muted-foreground mt-2">Manage your assigned batches and students</p>
        </div>
        <AddBatchDialog
          trigger={
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Batch
            </Button>
          }
          onSubmit={(payload) => {
            createBatch(payload)
            setOpenAdd(false)
          }}
        />
      </div>
      <BatchesTable rows={batches} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
