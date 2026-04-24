import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

/**
 * Next.js Route Handler — proxies GET requests to the upstream deaths API.
 *
 * Responsibilities:
 * - Reads the session token from the httpOnly cookie via NextAuth.
 * - Forwards all query parameters from the incoming request unchanged.
 * - Attaches `Authorization: Bearer <apiToken>` to the upstream request.
 * - Returns 401 if there is no valid session, preventing unauthenticated
 *   requests from reaching the backend.
 *
 * `API_BASE_URL` is server-side only and never exposed to the client.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const params = req.nextUrl.searchParams.toString()
  const url = `${process.env.API_BASE_URL}/v1/deaths${params ? `?${params}` : ""}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (session?.apiToken) {
    headers["Authorization"] = `Bearer ${session.apiToken}`
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch(url, { headers })

  if (!res.ok) {
    return NextResponse.json(
      { error: "Upstream API error", status: res.status },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}