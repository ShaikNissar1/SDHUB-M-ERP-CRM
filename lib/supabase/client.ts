import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error("[v0] Missing Supabase environment variables:", {
        url: !!url,
        key: !!key,
      })
      throw new Error(
        "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings in the Vars section.",
      )
    }

    supabaseClient = createBrowserClient(url, key)

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          supabaseClient = null
        }
      })
    }
  }
  return supabaseClient
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 500): Promise<T> {
  let lastError: any
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const isSchemaError = err instanceof Error && err.message.includes("Could not find the table")
      if (!isSchemaError || i === maxRetries - 1) throw err

      console.log(`[v0] Retrying after schema cache error (attempt ${i + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)))
    }
  }
  throw lastError
}
