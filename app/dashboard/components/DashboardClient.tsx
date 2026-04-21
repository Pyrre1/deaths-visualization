"use client"
import { useState } from "react"
import RegionList from "./RegionList"

type Props = {
  userName: string | null | undefined
}

export default function DashboardClient({ userName }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)

  return (
    <div className="flex h-screen">
      <RegionList selected={selectedRegion} onSelect={setSelectedRegion} />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome, {userName}</p>
        {selectedRegion === null ? (
          <p className="text-gray-400">Select a region to view data.</p>
        ) : (
          <p className="text-gray-400">Region {selectedRegion} selected — charts coming soon.</p>
        )}
      </main>
    </div>
  )
}