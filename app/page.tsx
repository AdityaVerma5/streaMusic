"use client"

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Users, Zap, Star } from 'lucide-react'
import { Appbar } from './components/Appbar'

export default function Component() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [session.status, router])

  if (session.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
          <Appbar/>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Music size={64} className="text-purple-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Welcome to StreamMusic</h1>
          <p className="text-xl text-gray-300 mb-8">
            Let your live chat decide what songs play next. Create a dynamic playlist for your stream!
          </p>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Users className="text-purple-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Audience Engagement</h2>
            <p className="text-gray-400">Boost interaction with your viewers through music selection</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Zap className="text-purple-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Real-time Updates</h2>
            <p className="text-gray-400">Watch your playlist evolve as viewers vote on songs</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <Star className="text-purple-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Customizable Experience</h2>
            <p className="text-gray-400">Tailor the music selection process to fit your stream's vibe</p>
          </div>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">What Streamers Say</h2>
          <blockquote className="text-center">
            <p className="text-lg text-gray-300 mb-4">
              "StreamMusic has revolutionized my streaming experience. My audience loves being part of the music selection process!"
            </p>
            <footer className="text-purple-400">- Alex, Twitch Streamer</footer>
          </blockquote>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to elevate your stream?</h2>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Start Now
          </button>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'auto'