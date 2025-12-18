import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const examId = request.nextUrl.searchParams.get("exam_id")

    if (!examId) {
      return NextResponse.json({ error: "exam_id required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { data: examData, error: examError } = await supabase.from("exams").select("title").eq("id", examId).single()

    if (examError || !examData) {
      console.error("[v0] Error fetching exam:", examError)
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .eq("exam", examData.title)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching responses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
