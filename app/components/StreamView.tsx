'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Share2, Play, ChevronUp, Music } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { YT_REGEX } from '../lib/utils'
import { Appbar } from './Appbar'
import 'react-toastify/dist/ReactToastify.css'
import dynamic from 'next/dynamic'

const LiteYouTubeEmbed = dynamic(() => import('react-lite-youtube-embed'), { ssr: false })

interface Video {
  "id": string
  "type": string
  "url": string
  "extractedId": string
  "title": string
  "smallImg": string
  "bigImg": string
  "active": boolean
  "userId": string
  "upvotes": number
  "haveUpvoted": boolean
}

const REFRESH_INTERVAL_MS = 10 * 1000

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string
  playVideo: boolean
}) {
  const [inputLink, setInputLink] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(false)
  const [playNextLoader, setPlayNextLoader] = useState(false)
  const videoPlayerRef = useRef<HTMLDivElement>(null)

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    })
    const json: { streams: Video[]; activeSteam: { stream: Video | null } } = await res.json()
    setQueue(json.streams.sort((a, b) => a.upvotes < b.upvotes ? 1 : -1))
    
    setCurrentVideo(video => {
      if (video?.id === json.activeSteam?.stream?.id) {
        return video
      }
      return json.activeSteam.stream
    })
  }

  useEffect(() => {
    refreshStreams()
    const interval = setInterval(() => {
      refreshStreams()
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [creatorId])

  useEffect(() => {
    if (!currentVideo || !videoPlayerRef.current) return

// @ts-expect-error : YouTubePlayer may not have TypeScript types or has compatibility issues

    let player: ReturnType<typeof import('youtube-player')>

    const loadPlayer = async () => {
      // @ts-expect-error : YouTubePlayer may not have TypeScript types or has compatibility issues
      const YouTubePlayer = (await import('youtube-player')).default
      player = YouTubePlayer(videoPlayerRef.current)

      player.loadVideoById(currentVideo.extractedId)
      player.playVideo()

      player.on('stateChange', (event: { data: number }) => {
        if (event.data === 0) {
          playNext()
        }
      })
    }

    loadPlayer()

    return () => {
      if (player) {
        player.destroy()
      }
    }
  }, [currentVideo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputLink.match(YT_REGEX)) return toast.error("Invalid YouTube URL")
    setLoading(true)

    try {
      // Send only the URL, the server will fetch and process video metadata
      const res = await fetch('/api/streams/', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, url: inputLink })
      })

      if (!res.ok) throw new Error("Failed to add stream")

      const newStream: Video = await res.json()  // Use server-provided metadata directly

      // Update queue with server response (already includes title, thumbnail, etc.)
      setQueue(prev => [...prev, newStream].sort((a, b) => b.upvotes - a.upvotes))
      setInputLink('')
    } catch (error) {
      console.error("Error adding stream:", error)
      toast.error("Could not add stream.")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(queue.map(video =>
      video.id === id
        ? {
          ...video,
          upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
          haveUpvoted: !video.haveUpvoted,
        }
        : video
    )
      .sort((a, b) => b.upvotes - a.upvotes))

    fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: id
      })
    })
  }

  const playNext = async () => {
    if (queue.length > 0) {
      try {
        setPlayNextLoader(true)
        const data = await fetch(`/api/streams/next`, {
          method: "GET",
        })
        const json = await data.json()
        setCurrentVideo(json.stream)
        setQueue(queue.filter(video => video.id !== json.stream.id))
      } catch (e) {
        console.error(e)
      }
      setPlayNextLoader(false)
    }
  }

  const handleShare = () => {
    const shareableLink = `${window.location.hostname}/creator/${creatorId}`
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast.success('Copied to clipboard', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#00a36c',
          color: 'white',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '16px',
        },
        closeButton: false,
      })
    }).catch((err) => {
      console.error('Could not copy text:', err)
      toast.error('Failed to copy link. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#d9534f',
          color: 'white',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '16px',
        },
        closeButton: false,
      })
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Appbar/>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Upcoming Songs</h2>
              <Button 
                onClick={handleShare}
                variant="outline" 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>

            <div className="space-y-4">
              {queue.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 shadow-lg">
                  <CardContent className="p-8 text-center text-gray-400">
                    <Music className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    Queue is empty
                  </CardContent>
                </Card>
              ) : (
                queue.map((video) => (
                  <Card key={video.id} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors shadow-lg">
                    <CardContent className="p-4 flex items-center gap-4">
                      <img
                        src={video.smallImg || "/placeholder.svg?height=80&width=80"}
                        alt={video.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-white truncate leading-tight">{video.title}</h3>
                      </div>
                      <Button
                        onClick={() => handleVote(video.id, !video.haveUpvoted)}
                        variant="outline"
                        size="sm"
                        className={`rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                          video.haveUpvoted ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {video.haveUpvoted ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        <span className="ml-1">{video.upvotes || 0}</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">Add a song</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Paste YouTube link here"
                    value={inputLink}
                    onChange={(e) => setInputLink(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <Button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {loading ? "Adding..." : "Add to Queue"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <h2 className="text-xl font-bold text-white p-4">Now Playing</h2>
                {currentVideo ? (
                  <div>
                    <div className="aspect-video bg-black">
                      {playVideo ? (
                        <div ref={videoPlayerRef} className="w-full h-full" />
                      ) : (
                        <img
                          src={currentVideo.bigImg}
                          alt="Current video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-white">{currentVideo.title}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-900 text-gray-500">
                    <Music className="h-12 w-12 text-purple-500" />
                  </div>
                )}
              </CardContent>
            </Card>

            {playVideo && (
              <Button
                onClick={playNext}
                disabled={playNextLoader}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
              >
                <Play className="mr-2 h-4 w-4" /> {playNextLoader ? "Loading..." : "Play Next"}
              </Button>
            )}

            {inputLink && inputLink.match(YT_REGEX) && !loading && (
              <Card className="bg-gray-800 border-gray-700 shadow-lg overflow-hidden">
                <CardContent className="p-4">
                  <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]} params="nocookie-1"/>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        toastClassName="bg-gray-800 text-white"
        bodyClassName="text-sm"
      />
    </div>
  )
}