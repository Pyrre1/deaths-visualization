"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type DeathRecord = {
  diagnosis_name: string
  value: number
}

type Props = {
  regionCode: number
  year: number
  limit: number
}

export default function TopCausesChart({ regionCode, year, limit }: Props) {
  const [data, setData] = useState<DeathRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Semi hardcoded to url to test how it behaves in the browser.
      const url = `${process.env.API_BASE_URL}/v1/deaths?from_year=${year}&to_year=${year}&region_code=${regionCode}&sex_code=3&exclude_diagnosis_code=99&age_code=99&order_by=value&direction=desc&limit=${limit}`

      console.log("Fetching:", url)

      try {
        const res = await fetch(url)

        if (!res.ok) {
          return
        }

        const json = await res.json()

        if (!json.data) {
          return
        }

        setData(
          json.data.map((d: unknown) => ({
            diagnosis_name: (d as { diagnosis_name?: string }).diagnosis_name,
            value: (d as { value?: number }).value,
          }))
        )
      } catch (err) {
        console.error("Failed to fetch top causes", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [regionCode, year, limit])

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>

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