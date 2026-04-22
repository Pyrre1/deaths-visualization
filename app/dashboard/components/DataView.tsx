"use client"
import { SetStateAction, useState } from "react"
import TopCausesPieChart from "./TopCausesPieChart"
import AgeGroupChart from "./AgeGroupChart"

type Props = {
  regionCode: number
  regionName: string
}

export default function DataView({ regionCode, regionName }: Props) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null)
  const [selectedDiagnosisName, setSelectedDiagnosisName] = useState<string | null>(null)
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{regionName}</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Top 10 Causes of Death</h3>
          <TopCausesPieChart
            regionCode={regionCode}
            onDiagnosisSelect={(code: SetStateAction<string | null>, name: SetStateAction<string | null>) => {
              setSelectedDiagnosis(code)
              setSelectedDiagnosisName(name)
            }}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">
              {selectedDiagnosisName ? `Cause: ${selectedDiagnosisName}` : "Deaths by Age Group (all causes)"}
            </h3>
            {selectedDiagnosis && (
              <button
                onClick={() => { setSelectedDiagnosis(null); setSelectedDiagnosisName(null) }}
                className="text-xs text-blue-600 hover:underline"
              >
                ← All causes
              </button>
              )}
          </div>
          <AgeGroupChart
            regionCode={regionCode}
            diagnosisCode={selectedDiagnosis}
          />
        </div>
      </div>
    </div>
  )
}