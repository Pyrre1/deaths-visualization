import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TopCausesChart from "./components/TopCausesChart"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/api/auth/signin")

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
      <p>Email: {session.user?.email}</p>
      <p>API Token: {session.apiToken ? "✅ present" : "❌ missing"}</p>
      <TopCausesChart regionCode={1} year={2024} limit={5} />

    </div>
  )
}