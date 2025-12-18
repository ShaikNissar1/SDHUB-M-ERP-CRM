import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const examId = request.nextUrl.searchParams.get("examId")

    if (!examId) {
      return NextResponse.json({ error: "examId is required" }, { status: 400 })
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

    const { data, error } = await supabase
      .from("internal_exam_results")
      .select("*")
      .eq("exam", examId)
      .order("submitted_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching internal exam results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
