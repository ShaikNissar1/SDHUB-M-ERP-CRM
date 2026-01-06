export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      exam_title,
      course_id,
      google_form_url,
      google_sheet_url,
      exam_type,
    } = body;

    if (!exam_title || !google_form_url || !google_sheet_url || !exam_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract IDs (validation only)
    const formIdMatch = google_form_url.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/);
    const sheetIdMatch = google_sheet_url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

    if (!formIdMatch || !sheetIdMatch) {
      return NextResponse.json(
        { error: "Invalid Google Form or Sheet URL" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
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
      .select("id")
      .single();

    if (error) {
      console.error("Create exam error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // ✅ THIS IS WHAT FRONTEND NEEDS
    return NextResponse.json(
      { exam_id: data.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
