"use client"
import { useState } from "react"
import RegionList from "./RegionList"
import { REGIONS } from "@/lib/regions"
import DataView from "./DataView"

/**
 * Props for {@link DashboardClient}.
 */
type Props = {
  /** Display name of the signed-in user, sourced from the NextAuth session. */
  userName: string | null | undefined
}

/**
 * Client-side shell for the dashboard page.
 *
 * Owns `selectedRegion` state and passes it down to {@link RegionList}
 * (for highlighting) and {@link DataView} (for data fetching).
 * Renders a prompt when no region is selected.
 */
export default function DashboardClient({ userName }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)

  const regionName = REGIONS.find(r => r.code === selectedRegion)?.name ?? ""
  return (
    <div className="flex h-screen">
      <RegionList selected={selectedRegion} onSelect={setSelectedRegion} />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-1">Datavisualiseringen</h1>
        <p className="text-sm text-gray-500 mb-6">Välkommen, {userName}!</p>
        {selectedRegion === null ? (
          <p className="text-gray-400">Välj en region för att visa data.</p>
        ) : (
          <DataView regionCode={selectedRegion} regionName={regionName} />
        )}
      </main>
    </div>
  )
}