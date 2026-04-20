// app/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500 text-sm">Please sign in using the button above.</p>
    </main>
  )
}