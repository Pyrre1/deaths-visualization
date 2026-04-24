"use client"
import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { fetchDeaths, type DeathRecord } from "@/lib/apiClient"

/**
 * Controls which sex filter is applied to the bar chart.
 * - both — combined total (sex_code=3) - standard.
 * - men — men only (sex_code=1)
 * - women — women only (sex_code=2)
 * - grouped — side-by-side bars for men and women (two parallel fetches)
 */
type SexMode = "both" | "men" | "women" | "grouped"

/**
 * Props for {@link AgeGroupChart}.
 */
type Props = {
  /** Region to fetch data for. */
  regionCode: number
  /** ICD-10 diagnosis code to filter by, or `null` for all diagnoses (99). */
  diagnosisCode: string | null
  /** Year to fetch data for. */
  year: number
}

/**
 * Merged record used in grouped mode, combining men and women values
 * for the same age band into a single data point for the grouped bar chart.
 */
type GroupedRecord = {
  age_range: string
  men: number
  women: number
}

/**
 * Bar chart showing deaths broken down by age group for a given region,
 * diagnosis, and year.
 *
 * Sex is controlled by a radio button group. In grouped mode two fetches
 * run in parallel and their results are merged by `age_code`.
 * Age code 99 (all-ages aggregate) is excluded from results in all modes
 * to avoid a misleadingly large bar dwarfing the per-group data.
 */
export default function AgeGroupChart({ regionCode, diagnosisCode, year }: Props) {
  const [sexMode, setSexMode] = useState<SexMode>("both")
  const [data, setData] = useState<DeathRecord[]>([])
  const [groupedData, setGroupedData] = useState<GroupedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cancellation flag — prevents setState calls on unmounted component
    // when regionCode, diagnosisCode, sexMode, or year changes mid-fetch.
    let cancelled = false

    async function load() {
      const baseFilters = {
        from_year: year,
        to_year: year,
        region_code: regionCode,
        // Fall back to "99" (all diagnoses) when no specific diagnosis is selected.
        diagnosis_code: diagnosisCode ?? "99",
        order_by: "age_code",
        direction: "asc" as const,
      }
      setLoading(true)
      setError(null)

      try {
        if (sexMode === "grouped") {
          const [men, women] = await Promise.all([
            fetchDeaths({ ...baseFilters, sex_code: 1 }),
            fetchDeaths({ ...baseFilters, sex_code: 2 }),
          ])
          if (!cancelled) {
            setGroupedData(
              men
              // Exclude age_code 99 (all-ages total) — it skews the scale.
              .filter((record: DeathRecord) => record.age_code !== 99)
              .map((menRecord: DeathRecord) => ({
                age_range: menRecord.age_range,
                men: menRecord.value,
                // Match each men record to its women counterpart by age_code.
                // Default to 0 if the women's dataset has no entry for that band.
                women: women.find((womenRecord: DeathRecord) => womenRecord.age_code === menRecord.age_code)?.value ?? 0,
              }))
            )
          }
        } else {
          const records = await fetchDeaths({
            ...baseFilters,
            sex_code: sexMode === "both" ? 3 : sexMode === "men" ? 1 : 2,
          })
          if (!cancelled) setData(records.filter((record: DeathRecord) => record.age_code !== 99))
        }
      } catch {
        if (!cancelled) setError("Failed to load data")
      } finally {
        if (!cancelled) setLoading(false)
      }     
    }
    load()
    return () => { cancelled = true }
  }, [regionCode, diagnosisCode, sexMode, year])

  const radioOptions: { label: string; value: SexMode }[] = [
    { label: "Total", value: "both" },
    { label: "Män", value: "men" },
    { label: "Kvinnor", value: "women" },
    { label: "Uppdelat", value: "grouped" },
  ]

  return (
    <div>
      <div className="flex gap-4 mb-4">
        {radioOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-1 text-sm cursor-pointer">
            <input
              type="radio"
              name="sexMode"
              value={option.value}
              checked={sexMode === option.value}
              onChange={() => setSexMode(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={330}>
          {sexMode === "grouped" ? (
            <BarChart data={groupedData} margin={{ bottom: 40 }}>
              <XAxis
                dataKey="age_range"
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <YAxis />
              <Tooltip formatter={(v) => `${v} deaths`} />
              <Legend />
              <Bar dataKey="men" fill="#fd8528" radius={[4, 4, 0, 0]} />
              <Bar dataKey="women" fill="#00a3a0" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
          <BarChart data={data} margin={{ bottom: 40 }}>
            <XAxis
              dataKey="age_range"
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <YAxis />
            <Tooltip formatter={(v) => `${v} deaths`} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  )
}