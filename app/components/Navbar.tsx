"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function Navbar() {
  const { data: session , status} = useSession()
  const [showProviders, setShowProviders] = useState(false)

  return (
    <nav className="w-full px-6 py-4 border-b flex items-center justify-between">
      <span className="font-semibold">Dödsorsaksstatistik från socialstyrelsen</span>

      <div>
        {status === "loading" && (
          <span className="text-sm text-gray-500">Loading...</span>
        )}
        {status === "unauthenticated" && (
          <div className="relative">
            {!showProviders && (
              <button
                onClick={() => setShowProviders(true)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
              >
                Logga in
              </button>
            )}
            {showProviders && (
              <div className="absolute right-0 mt-2 flex flex-col bg-white border rounded shadow-md p-2 w-48">
                <button
                  onClick={() => signIn("github")}
                  className="px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  Logga in med GitHub
                </button>

                <button
                  onClick={() => signIn("google")}
                  className="px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  Logga in med Google
                </button>
                <button
                  onClick={() => setShowProviders(false)}
                  className="px-3 py-1 text-left text-gray-500 text-xs hover:underline"
                >
                  Avbryt
                </button>
              </div>
            )}
          </div>
        )}

        {status === "authenticated" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: window.location.origin })}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Logga ut
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}