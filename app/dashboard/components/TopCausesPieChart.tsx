"use client"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { fetchDeaths, type DeathRecord } from "@/lib/apiClient"

/** Ten distinct colours cycled across pie slices. Might add more later, and refactor for better maintainability. */
const COLORS = ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16"]

/**
 * Props for {@link TopCausesPieChart}.
 */
type Props = {
  /** Region to fetch data for. */
  regionCode: number
  /** Called when the user clicks a pie slice, with the diagnosis code and display name. */
  onDiagnosisSelect: (code: string, name: string) => void
  /** Year to fetch data for. */
  year: number
}

/**
 * Pie chart showing the top 10 causes of death for a given region and year.
 *
 * Fetches all-ages, both-sexes totals (`age_code=99`, `sex_code=3`), ordered
 * by death count descending, excluding the catch-all diagnosis code "99".
 * Clicking a slice calls `onDiagnosisSelect` to filter the adjacent bar chart.
 */
export default function TopCausesPieChart({ regionCode, onDiagnosisSelect, year }: Props) {
  const [data, setData] = useState<DeathRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const results = await fetchDeaths({
        exclude_diagnosis_code: "99",
        age_code: 99,
        sex_code: 3,
        order_by: "value",
        direction: "desc",
        limit: 10,
        from_year: year,
        to_year: year,
        region_code: regionCode,
      })
        if (!cancelled) setData(results)
      } catch {
        if (!cancelled) setError("Failed to load data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [regionCode, year])

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>

  return (
    <ResponsiveContainer width="100%" height={365}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="diagnosis_name"
          cx="50%"
          cy="45%"
          outerRadius={110}
          /* Cast through unknown — Recharts types the click payload as its internal
            ActiveShape rather than the original data item, so we recover the
            underlying DeathRecord manually. */
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
        <Legend
          layout="vertical"
          align="left"
          verticalAlign="middle"
          formatter={(value: string) => (
            <span style={{fontSize:"11px", display:"inline-block", width:"180px"}}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}