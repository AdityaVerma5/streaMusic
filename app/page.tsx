"use client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Radio, Headphones } from "lucide-react"
import Link from "next/link"
import { Appbar } from "./components/Appbar"
import useRedirect from "./hooks/useRedirect"


export default function LandingPage() {
 useRedirect();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-950 text-gray-100 flex flex-col">
      {/* Integrating the Appbar in the header */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Appbar/>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center bg-gradient-to-t from-purple-900 via-black to-purple-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tighter text-purple-100 shadow-lg sm:text-6xl md:text-7xl lg:text-8xl">
                  Let Your Fans Choose the Beat
                </h1>
                <p className="mx-auto max-w-[700px] text-purple-300 md:text-xl leading-relaxed">
                  streaMusic: Where creators and fans unite to create the perfect stream soundtrack.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition">
                  Get Started
                </Button>
                <Button variant="outline" className="bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:shadow-lg transition">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-950 via-black to-purple-950">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-100">Key Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Users className="h-14 w-14 text-yellow-400 drop-shadow-lg" />
                <h3 className="text-2xl font-bold text-purple-100">Fan Interaction</h3>
                <p className="text-purple-300">
                  Let fans choose the music.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Radio className="h-14 w-14 text-green-400 drop-shadow-lg" />
                <h3 className="text-2xl font-bold text-purple-100">Live Streaming</h3>
                <p className="text-purple-300">
                  Stream with real-time input.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Headphones className="h-14 w-14 text-blue-400 drop-shadow-lg" />
                <h3 className="text-2xl font-bold text-purple-100">High-Quality Audio</h3>
                <p className="text-purple-300">
                  Crystal clear sound quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-t from-purple-950 via-black to-purple-900">
          <div className="container px-4 md:px-6 mx-auto max-w-xl">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h2 className="text-4xl font-bold tracking-tighter md:text-5xl text-purple-100">
                Ready to revolutionize your streams?
              </h2>
              <p className="text-purple-300 md:text-xl">
                Join streaMusic today and give your audience the power to shape your music.
              </p>
              <div className="w-full space-y-2">
                <form className="flex flex-col sm:flex-row gap-2">
                  <Input
                    className="flex-grow bg-purple-900 text-white placeholder-purple-400 border-purple-700 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white shadow-lg hover:shadow-xl transition">
                    Sign Up
                  </Button>
                </form>
                <p className="text-xs text-purple-400">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2 hover:text-purple-300" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-center px-4 md:px-6 border-t border-purple-800 bg-black/50">
        <p className="text-xs text-purple-400">© 2024 streaMusic. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-purple-400 hover:text-purple-200" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-purple-400 hover:text-purple-200" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
