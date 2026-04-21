"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { fetchDeaths, type DeathRecord } from "@/lib/apiClient"

type Props = {
  regionCode: number
  year: number
  limit: number
}

export default function TopCausesChart({ regionCode, year, limit }: Props) {
  const [data, setData] = useState<DeathRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDeaths({
      from_year: year,
      to_year: year,
      region_code: regionCode,
      sex_code: 3,
      exclude_diagnosis_code: "99",
      age_code: 99,
      order_by: "value",
      direction: "desc",
      limit,
    })
      .then(setData)
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false))
  }, [regionCode, year, limit])

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 200 }}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="diagnosis_name" width={190} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${v} deaths`} />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}