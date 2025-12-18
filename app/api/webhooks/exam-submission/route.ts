import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Webhook received body:", JSON.stringify(body, null, 2))

    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim()
    const phone = String(body.phone || "").trim()
    const course = String(body.course || "").trim()
    const exam = String(body.exam || "").trim()
    const examType = String(body.exam_type || "entrance_exam").trim()
    const totalMarks = body.total_marks !== undefined && body.total_marks !== null ? Number(body.total_marks) : null

    let numericScore: number | null = null
    if (body.score !== undefined && body.score !== null) {
      const scoreStr = String(body.score).trim()
      const scoreMatch = scoreStr.match(/(\d+(?:\.\d+)?)/)
      if (scoreMatch) {
        numericScore = Number.parseFloat(scoreMatch[1])
      }
    }

    console.log("[v0] Parsed data:", { name, email, phone, course, exam, examType, score: numericScore, totalMarks })

    if (!email && !phone) {
      console.error("[v0] Missing email or phone")
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 })
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

    let tableName = "entrance_exam_results"
    if (examType === "main_exam") {
      tableName = "main_exam_results"
    } else if (examType === "internal_exam") {
      tableName = "internal_exam_results"
    }

    console.log(`[v0] Inserting ${examType} result into ${tableName}:`, {
      name,
      email,
      phone,
      course,
      exam,
      score: numericScore,
      totalMarks,
    })

    const insertPayload: any = {
      name,
      email,
      phone,
      course,
      exam,
      score: numericScore,
      total_marks: totalMarks,
      submitted_at: new Date().toISOString(),
    }

    const { error: resultError, data: resultData } = await supabase.from(tableName).insert(insertPayload).select()

    if (resultError) {
      console.error(`[v0] ${tableName} insert error:`, resultError)
      return NextResponse.json(
        { error: `Failed to insert ${examType} result`, details: resultError.message },
        { status: 500 },
      )
    }

    console.log(`[v0] ${examType} result inserted:`, resultData)

    if (numericScore !== null && (email || phone)) {
      let leadId: string | null = null

      const filter: any = {}
      let secondaryFilter: any = null

      if (email) {
        filter.email = email
        if (phone) {
          secondaryFilter = { phone: phone }
        }
      } else if (phone) {
        filter.phone = phone
      }

      console.log("[v0] Primary filter:", filter, "Secondary filter:", secondaryFilter)

      // Find existing lead with primary filter
      let existingLead = await supabase.from("leads").select("id, email, phone").match(filter).single()
      console.log("[v0] Primary filter search result:", { error: existingLead.error?.message, data: existingLead.data })

      // If not found and secondary filter exists, try secondary filter
      if (existingLead.error && secondaryFilter) {
        console.log("[v0] Primary filter didn't match, trying secondary filter with:", secondaryFilter)
        existingLead = await supabase.from("leads").select("id, email, phone").match(secondaryFilter).single()
        console.log("[v0] Secondary filter search result:", {
          error: existingLead.error?.message,
          data: existingLead.data,
        })
      }

      if (existingLead.data?.id) {
        leadId = existingLead.data.id
        console.log(
          "[v0] Found existing lead:",
          leadId,
          "with email:",
          existingLead.data.email,
          "phone:",
          existingLead.data.phone,
        )
      } else {
        // Create new lead if doesn't exist
        console.log("[v0] No lead found, creating new lead with:", { name, email, phone, course })
        const { data: newLead, error: createError } = await supabase
          .from("leads")
          .insert({
            name,
            email,
            phone,
            course,
            status: "New Enquiry",
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single()

        if (createError) {
          console.error("[v0] Error creating new lead:", createError)
        }

        if (newLead?.id) {
          leadId = newLead.id
          console.log("[v0] Created new lead:", leadId)
        }
      }

      // Update exam results table with lead_id
      if (leadId && resultData && resultData.length > 0) {
        const resultId = resultData[0].id
        await supabase
          .from(tableName)
          .update({ lead_id: leadId })
          .eq("id", resultId)
          .then(({ error }) => {
            if (error) {
              console.error(`[v0] Error updating lead_id in ${tableName}:`, error)
            } else {
              console.log(`[v0] Linked result to lead ${leadId}`)
            }
          })
      }

      const updatePayload: any = { updated_at: new Date().toISOString() }

      if (examType === "entrance_exam") {
        updatePayload.entrance_score = numericScore
      } else if (examType === "main_exam") {
        updatePayload.final_score = numericScore
      }

      // Update leads table with score
      if (leadId) {
        console.log("[v0] Updating lead", leadId, "with payload:", updatePayload, "for exam type:", examType)
        const { error: updateError, data: updateData } = await supabase
          .from("leads")
          .update(updatePayload)
          .eq("id", leadId)
          .select()

        if (updateError) {
          console.error("[v0] Lead update error:", updateError)
        } else {
          console.log("[v0] Lead updated successfully:", updateData)
        }
      } else {
        console.log("[v0] No leadId found, skipping lead update")
      }
    } else {
      console.log("[v0] Skipping leads update - no numeric score extracted or missing email/phone")
    }

    return NextResponse.json({ success: true, resultData }, { status: 200 })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
