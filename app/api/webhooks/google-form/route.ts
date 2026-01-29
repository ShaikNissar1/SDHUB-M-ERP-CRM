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

    // Debug: Log all incoming fields to identify the correct mapping
    console.log("[v0] All form fields received:", JSON.stringify(body, null, 2))

    // Map form fields - adjust field names to match your actual Google Form
    // Common variations: field names can use underscores, spaces, or camelCase
    const leadData = {
      name: body.name || body.full_name || body["Full Name"] || body["Name"] || "",
      email: body.email || body["Email"] || body["email_address"] || "",
      phone: body.phone || body.contact || body["Contact"] || body["Phone"] || body["phone_number"] || "",
      course: body.course || body.course_interested || body["Course Interested"] || body["Course"] || "",
      qualification: body.qualification || body.education_qualification || body["Education Qualification"] || body["Qualification"] || "",
      source: body.source || body.how_did_you_hear || body["How did you hear about us?"] || body["Source"] || "Google Form",
      status: "New Enquiry",
      remarks: body.remarks || body.additional_remarks || body["Remarks"] || `Age: ${body.age || "N/A"}, Gender: ${body.gender || "N/A"}, Area: ${body.residence_area || "N/A"}`,
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
