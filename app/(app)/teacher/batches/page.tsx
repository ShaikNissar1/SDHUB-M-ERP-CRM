"use client"

import TeacherBatchesList from "@/components/teacher/teacher-batches-list"
import { useTeacher } from "@/lib/contexts/teacher-context"

export default function TeacherBatchesPage() {
  const { selectedTeacher, isLoading } = useTeacher()

  // TODO: Fetch batches from Supabase based on selectedTeacher.id
  const batches: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Batches</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your assigned batches
        </p>
      </div>

      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No batches assigned</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You don't have any batches assigned at the moment.
          </p>
        </div>
      ) : (
        <TeacherBatchesList batches={batches} />
      )}
    </div>
  )
}
