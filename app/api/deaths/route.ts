import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const params = req.nextUrl.searchParams.toString()
  const url = `${process.env.API_BASE_URL}/v1/deaths${params ? `?${params}` : ""}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (session?.apiToken) {
    headers["Authorization"] = `Bearer ${session.apiToken}`
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