"use client"
import { useState } from "react"
import RegionList from "./RegionList"
import { REGIONS } from "@/lib/regions"
import DataView from "./DataView"

type Props = {
  userName: string | null | undefined
}

export default function DashboardClient({ userName }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)

  const regionName = REGIONS.find(r => r.code === selectedRegion)?.name ?? ""
  return (
    <div className="flex h-screen">
      <RegionList selected={selectedRegion} onSelect={setSelectedRegion} />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome, {userName}</p>
        {selectedRegion === null ? (
          <p className="text-gray-400">Select a region to view data.</p>
        ) : (
          <DataView regionCode={selectedRegion} regionName={regionName} />
        )}
      </main>
    </div>
  )
}