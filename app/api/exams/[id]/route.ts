import { getSupabaseClient } from "@/lib/supabase/client"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseClient()

    const { error: resultsError } = await supabase.from("test_results").delete().eq("exam_id", params.id)
    if (resultsError) {
      console.error("[v0] Error deleting test results:", resultsError.message)
      return Response.json({ error: `Failed to delete test results: ${resultsError.message}` }, { status: 400 })
    }

    // Then delete the exam itself
    const { error } = await supabase.from("exams").delete().eq("id", params.id)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error?.message || "Failed to delete exam" }, { status: 500 })
  }
}
