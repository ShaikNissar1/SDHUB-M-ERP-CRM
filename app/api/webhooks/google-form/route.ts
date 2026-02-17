import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ========== GOOGLE FORM WEBHOOK CALLED ==========")
    const body = await request.json()
    console.log("[v0] Received form data:", body)
    console.log("[v0] Request timestamp:", new Date().toISOString())

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
      email: (body.email || body["Email"] || body["email_address"] || "").trim().toLowerCase(),
      phone: (body.phone || body.contact || body["Contact"] || body["Phone"] || body["phone_number"] || "").trim().replace(/[\s\-\(\)]/g, ""),
      course: body.course || body.course_interested || body["Course Interested"] || body["Course"] || "",
      qualification: body.qualification || body.education_qualification || body["Education Qualification"] || body["Qualification"] || "",
      source: body.source || body.how_did_you_hear || body["How did you hear about us?"] || body["Source"] || "Google Form",
      status: "New Enquiry",
      remarks: body.remarks || body.additional_remarks || body["Remarks"] || `Age: ${body.age || "N/A"}, Gender: ${body.gender || "N/A"}, Area: ${body.residence_area || "N/A"}`,
    }

    console.log("[v0] Mapped lead data:", leadData)
    console.log("[v0] Lead validation - hasEmail:", hasEmail, "hasPhone:", hasPhone)

    // Check for duplicate by email or phone
    let existingLead = null
    
    // Only check if email or phone is provided
    const hasEmail = leadData.email && leadData.email.length > 0
    const hasPhone = leadData.phone && leadData.phone.length > 0

    if (!hasEmail && !hasPhone) {
      console.error("[v0] No email or phone provided - cannot save lead")
      return NextResponse.json(
        { 
          success: false, 
          message: "Email or phone number is required" 
        }, 
        { status: 400 }
      )
    }
    
    // Check for duplicate by checking if BOTH email and phone match an existing record
    // We want to prevent duplicate submissions only when BOTH email and phone match
    if (hasEmail && hasPhone) {
      console.log("[v0] Checking for existing lead with both email and phone (AND condition):", leadData.email, leadData.phone)
      
      const { data: exactMatch } = await supabase
        .from("leads")
        .select("id, name, email, phone")
        .eq("email", leadData.email)
        .eq("phone", leadData.phone)
        .maybeSingle()
      
      if (exactMatch) {
        existingLead = exactMatch
        console.log("[v0] Found existing lead by exact email AND phone match:", existingLead)
      }
    } else if (hasEmail) {
      console.log("[v0] Checking for existing lead with email:", leadData.email)
      
      const { data: exactMatch } = await supabase
        .from("leads")
        .select("id, name, email, phone")
        .eq("email", leadData.email)
        .maybeSingle()
      
      if (exactMatch) {
        existingLead = exactMatch
        console.log("[v0] Found existing lead by exact email match:", existingLead)
      }
    } else if (hasPhone) {
      console.log("[v0] Checking for existing lead with phone:", leadData.phone)
      
      const { data: exactMatch } = await supabase
        .from("leads")
        .select("id, name, email, phone")
        .eq("phone", leadData.phone)
        .maybeSingle()
      
      if (exactMatch) {
        existingLead = exactMatch
        console.log("[v0] Found existing lead by exact phone match:", existingLead)
      }
    }

    console.log("[v0] Duplicate check result - existingLead:", existingLead)

    if (existingLead) {
      console.log("[v0] Duplicate lead detected (ID:", existingLead.id, "). Skipping insertion.")
      return NextResponse.json(
        { 
          success: false, 
          message: "Duplicate lead detected - not saved", 
          existingLeadId: existingLead.id,
          existingLead 
        }, 
        { status: 200 }
      )
    }

    const { data, error } = await supabase.from("leads").insert([leadData]).select().single()

    if (error) {
      // Check if it's a unique constraint violation (duplicate)
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        console.log("[v0] Duplicate constraint violation detected:", error.message)
        
        // Try to find the existing record again
        let existingByEmail = null
        let existingByPhone = null
        
        if (hasEmail) {
          const { data: eMatch } = await supabase
            .from("leads")
            .select("id, name, email, phone")
            .eq("email", leadData.email)
            .maybeSingle()
          existingByEmail = eMatch
        }
        
        if (!existingByEmail && hasPhone) {
          const { data: pMatch } = await supabase
            .from("leads")
            .select("id, name, email, phone")
            .eq("phone", leadData.phone)
            .maybeSingle()
          existingByPhone = pMatch
        }
        
        const foundExisting = existingByEmail || existingByPhone
        
        return NextResponse.json(
          { 
            success: false, 
            message: "Duplicate lead - not saved", 
            existingLeadId: foundExisting?.id,
            existingLead: foundExisting
          }, 
          { status: 200 }
        )
      }
      
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
