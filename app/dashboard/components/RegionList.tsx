"use client"
import { REGIONS } from "@/lib/regions"

/**
 * Props for {@link RegionList}.
 */
type Props = {
  /** Currently selected region code, or `null` if none selected. */
  selected: number | null
  /** Called with the region code when the user clicks a region button. */
  onSelect: (code: number) => void
}

/**
 * Sidebar navigation listing all Swedish regions.
 * Highlights the active region and calls `onSelect` on click.
 */
export default function RegionList({ selected, onSelect }: Props) {
  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 h-full overflow-y-auto">
      <p className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Regioner
      </p>
      <ul>
        {REGIONS.map((r) => (
          <li key={r.code}>
            <button
              onClick={() => onSelect(r.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                selected === r.code ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              {r.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}