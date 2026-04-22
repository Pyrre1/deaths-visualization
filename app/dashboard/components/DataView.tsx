"use client"
import { useState } from "react"
import TopCausesPieChart from "./TopCausesPieChart"

type Props = {
  regionCode: number
  regionName: string
}

export default function DataView({ regionCode, regionName }: Props) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{regionName}</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Top 10 Causes of Death</h3>
          <TopCausesPieChart
            regionCode={regionCode}
            onDiagnosisSelect={setSelectedDiagnosis}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Deaths by Age Group</h3>
          {/* AgeGroupChart goes here */}
        </div>
      </div>
    </div>
  )
}