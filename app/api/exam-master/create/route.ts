import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exam_title, course_id, google_form_url, google_sheet_url, exam_type } = body

    if (!exam_title || !google_form_url || !google_sheet_url || !exam_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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

    // Extract IDs from URLs
    const formIdMatch = google_form_url.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/)
    const sheetIdMatch = google_sheet_url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)

    if (!formIdMatch || !sheetIdMatch) {
      return NextResponse.json({ error: "Invalid Google Form or Sheet URL" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("exams")
      .insert({
        title: exam_title,
        course_id: course_id || null,
        form_link: google_form_url,
        sheet_link: google_sheet_url,
        type: exam_type,
        status: "active",
        created_by: "admin",
        total_marks: 100,
        duration_minutes: 60,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating exam:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
