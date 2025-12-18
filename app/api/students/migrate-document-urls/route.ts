import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    })

    const { data: docsToMigrate, error: fetchError } = await supabase
      .from("student_documents")
      .select("*")
      .or(`url.is.null,url.eq.""`)

    if (fetchError) {
      console.error("[v0] Error fetching documents to migrate:", fetchError)
      return Response.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    console.log(`[v0] Found ${docsToMigrate?.length || 0} documents to migrate`)

    const migrated = []

    for (const doc of docsToMigrate || []) {
      const studentId = doc.student_id
      const kind = doc.kind || "study"
      const docName = doc.name

      // Try to find the file in storage
      const { data: kindItems, error: listError } = await supabase.storage
        .from("student_documents")
        .list(`${studentId}/${kind}`, { limit: 1000 })

      if (listError) {
        console.warn(`[v0] Could not list ${studentId}/${kind}:`, listError)
        continue
      }

      const foundFile = kindItems?.find((f: any) => f.name === docName || f.name.includes(docName.split(".")[0]))

      if (foundFile) {
        const filePath = `${studentId}/${kind}/${foundFile.name}`
        const { data: signedData, error: signError } = await supabase.storage
          .from("student_documents")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year

        if (!signError && signedData?.signedUrl) {
          await supabase.from("student_documents").update({ url: signedData.signedUrl }).eq("id", doc.id)

          migrated.push({ id: doc.id, name: docName })
          console.log(`[v0] Migrated ${docName} to signed URL`)
        }
      }
    }

    return Response.json({
      success: true,
      migratedCount: migrated.length,
      migrated,
    })
  } catch (error) {
    console.error("[v0] Migration error:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
