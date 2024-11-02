"use client"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export function Appbar() {
  const session = useSession()
  return (
    <div className="flex items-center justify-between w-full px-4"> {/* Added px-4 for horizontal padding */}
      <Link href="#">
        <span className="font-bold text-xl text-purple-100">streaMusic</span>
      </Link>

      <nav className="flex items-center gap-4 sm:gap-6">
        <Link href="#">
          {session.data?.user ? (
            <button
              className="m-2 p-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 hover:shadow-xl transition"
              onClick={() => signOut()}
            >
              Logout
            </button>
          ) : (
            <button
              className="m-2 p-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 hover:shadow-xl transition"
              onClick={() => signIn()}
            >
              Sign In
            </button>
          )}
        </Link>
      </nav>
    </div>
  )
}
