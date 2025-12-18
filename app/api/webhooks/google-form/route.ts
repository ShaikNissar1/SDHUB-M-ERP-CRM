import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received form data:", body)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors
            }
          },
        },
      },
    )

    const leadData = {
      name: body.full_name || body["Full Name"] || "",
      email: body.email || body["Email"] || "",
      phone: body.contact || body["Contact"] || "",
      course: body.course_interested || body["Course Interested"] || "",
      qualification: body.education_qualification || body["Education Qualification"] || "",
      source: body.how_did_you_hear || body["How did you hear about us?"] || "Google Form",
      status: "New",
      remarks: `Age: ${body.age || "N/A"}, Gender: ${body.gender || "N/A"}, Area: ${body.residence_area || "N/A"}`,
    }

    console.log("[v0] Mapped lead data:", leadData)

    const { data, error } = await supabase.from("leads").insert([leadData]).select().single()

    if (error) {
      console.error("[v0] Error inserting lead:", error)
      return NextResponse.json({ error: "Failed to save lead", details: error.message }, { status: 400 })
    }

    console.log("[v0] Lead created successfully:", data)

    return NextResponse.json({ success: true, message: "Lead saved successfully", data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
