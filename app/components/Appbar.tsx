"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { Music, LogOut, LogIn } from "lucide-react"

export function Appbar() {
  const session = useSession()

  return (
    <header className="bg-gradient-to-r from-gray-900 to-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-purple-500" />
            <span className="font-bold text-xl text-white">StreamMusic</span>
          </Link>

          <nav>
            {session.data?.user ? (
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out transform hover:scale-105"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out transform hover:scale-105"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}