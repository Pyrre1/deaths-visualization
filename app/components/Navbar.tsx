"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session , status} = useSession()

  return (
    <nav className="w-full px-6 py-4 border-b flex items-center justify-between">
      <span className="font-semibold">Swedish Death Statistics</span>

      <div>
        {status === "loading" && (
          <span className="text-sm text-gray-500">Loading...</span>
        )}
        {status === "unauthenticated" && (
          <button
            onClick={() => signIn("github")}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
          >
            Sign in with GitHub
          </button>
        )}

        {status === "authenticated" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: window.location.origin })}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}