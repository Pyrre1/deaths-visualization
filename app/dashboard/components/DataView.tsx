"use client"
import { SetStateAction, useState } from "react"
import TopCausesPieChart from "./TopCausesPieChart"
import AgeGroupChart from "./AgeGroupChart"

/**
 * Props for {@link DataView}.
 */
type Props = {
  /** Numeric region code passed through to child chart components. */
  regionCode: number
  /** Human-readable region name shown in headings. */
  regionName: string
}

/**
 * Renders the two main charts for a selected region:
 * - {@link TopCausesPieChart} — top 10 causes of death for the selected year.
 * - {@link AgeGroupChart} — deaths by age group, optionally filtered to one diagnosis.
 *
 * Owns `selectedDiagnosis`, `selectedDiagnosisName`, and `selectedYear` state.
 * Clicking a pie slice sets the active diagnosis; the back button clears it.
 */
export default function DataView({ regionCode, regionName }: Props) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null)
  const [selectedDiagnosisName, setSelectedDiagnosisName] = useState<string | null>(null)
  const [selectedYear, setYear] = useState<number>(2024)
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{regionName}</h2>
      <select
        value={selectedYear}
        onChange={(e) => setYear(Number(e.target.value))}
        className="text-sm border rounded px-2 py-1"
      >
        {Array.from({ length: 28 }, (_, i) => 2024 - i).map((y) => (
          /* Years 1997–2024 generated from offset; index 0 = 2024, last = 1997 */
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Topp 10 dödsorsaker för {regionName}, år {selectedYear}</h3>
          <TopCausesPieChart
            regionCode={regionCode}
            year={selectedYear}
            onDiagnosisSelect={(code: SetStateAction<string | null>, name: SetStateAction<string | null>) => {
              setSelectedDiagnosis(code)
              setSelectedDiagnosisName(name)
            }}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">
              {selectedDiagnosisName ? `Dödsorsak: ${selectedDiagnosisName}` : "Dödsfall per åldersgrupp (samtliga dödsorsaker)"}
            </h3>
            {selectedDiagnosis && (
              <button
                onClick={() => { setSelectedDiagnosis(null); setSelectedDiagnosisName(null) }}
                className="text-xs text-blue-600 hover:underline"
              >
                ← Tillbaka till överblick
              </button>
              )}
          </div>
          <AgeGroupChart
            regionCode={regionCode}
            year={selectedYear}
            diagnosisCode={selectedDiagnosis}
          />
        </div>
      </div>
    </div>
  )
}