"use client"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { fetchDeaths, type DeathRecord } from "@/lib/apiClient"

const COLORS = ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16"]

type Props = {
  regionCode: number
  onDiagnosisSelect: (code: string, name: string) => void
}

export default function TopCausesPieChart({ regionCode, onDiagnosisSelect }: Props) {
  const [data, setData] = useState<DeathRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchDeaths({
      exclude_diagnosis_code: "99",
      age_code: 99,
      sex_code: 3,
      order_by: "value",
      direction: "desc",
      limit: 10,
      from_year: 2024,
      to_year: 2024,
      region_code: regionCode,
    })
      .then(setData)
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false))
  }, [regionCode])

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="diagnosis_name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          onClick={(entry) => {
            const record = entry as unknown as DeathRecord
            onDiagnosisSelect(record.diagnosis_code, record.diagnosis_name)
          }}
          className="cursor-pointer"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `${v} deaths`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}