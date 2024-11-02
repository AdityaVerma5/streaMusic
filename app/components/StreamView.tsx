"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Share2, Play, ChevronUp } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { YT_REGEX } from '../lib/utils'
import { Appbar } from './Appbar'
import 'react-toastify/dist/ReactToastify.css';
// @ts-expect-error : YouTubePlayer may not have TypeScript types or has compatibility issues
import YouTubePlayer from 'youtube-player'

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
  const videoPlayerRef = useRef<HTMLDivElement>()

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    })
    const json: { streams: Video[]; activeSteam: { stream: Video | null } } = await res.json();
    setQueue(json.streams.sort((a: Video, b: Video) => a.upvotes < b.upvotes ? 1 : -1))
    
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
  }, [])

  useEffect(() => {
    if (!currentVideo) return
    let player = YouTubePlayer(videoPlayerRef.current)

    player.loadVideoById(currentVideo?.extractedId)
    player.playVideo()

    function eventHandler(event: any) {
      if (event.data === 0) {
        playNext()
      }
    }

    player.on('stateChange', eventHandler)

    return () => {
      player.destroy()
    }
  }, [currentVideo, videoPlayerRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/streams', {
      method: "POST",
      body: JSON.stringify({
        creatorId,
        url: inputLink,
      })
    })
    setQueue([...queue, await res.json()])
    setLoading(false)
    setInputLink('')
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
    const shareableLink = `${window.location.hostname}:3000/creator/${creatorId}`
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast.success('Copied to clipboard', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#00a36c',  // Match the green color in the image
          color: 'white',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '16px',
        },
        closeButton: false,  // Remove close button or style as needed
      });
    }).catch((err) => {
      console.error('Could not copy text:', err);
      toast.error('Failed to copy link. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#d9534f',  // Red background for error
          color: 'white',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '16px',
        },
        closeButton: false,
      });
    });
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Appbar/>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-[1fr,400px] gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Upcoming Songs</h2>
              <Button 
                onClick={handleShare}
                variant="outline" 
                size="sm" 
                className="text-purple-400 border-purple-800 hover:bg-purple-900/50"
              >
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>

            <div className="space-y-2">
              {queue.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 text-center text-gray-500">
                    Queue is empty
                  </CardContent>
                </Card>
              ) : (
                queue.map((video) => (
                  <Card key={video.id} className="bg-[#111827]/50 border-gray-800 hover:bg-[#111827] transition-colors">
                    <CardContent className="p-3 flex items-center gap-4">
                      <img
                        src={video.smallImg || "/placeholder.svg?height=80&width=80"}
                        alt={video.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-white truncate leading-tight">{video.title}</h3>
                      </div>
                      <Button
                        onClick={() => handleVote(video.id, !video.haveUpvoted)}
                        variant="outline"
                        size="sm"
                        className={`bg-gray-800 text-white border-gray-700 hover:bg-gray-700 ${
                          video.haveUpvoted ? 'bg-purple-700 hover:bg-purple-800' : ''
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Add a song</h2>
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="text"
                  placeholder="Paste YouTube link here"
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                  className="bg-[#111827]/50 border-gray-800 text-white placeholder:text-gray-500"
                />
                <Button 
                  disabled={loading} 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? "Adding..." : "Add to Queue"}
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Now Playing</h2>
              <Card className="bg-[#111827]/50 border-gray-800 overflow-hidden">
                <CardContent className="p-0">
                  {currentVideo ? (
                    <div>
                      <div className="aspect-video bg-black">
                        {playVideo ? (
                          // @ts-expect-error : YouTubePlayer may not have TypeScript types or has compatibility issues
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
                    <div className="aspect-video flex items-center justify-center text-gray-500">
                      No video playing
                    </div>
                  )}
                </CardContent>
              </Card>

              {playVideo && (
                <Button
                  onClick={playNext}
                  disabled={playNextLoader}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Play className="mr-2 h-4 w-4" /> {playNextLoader ? "Loading..." : "Play Next"}
                </Button>
              )}
            </div>

            {inputLink && inputLink.match(YT_REGEX) && !loading && (
              <Card className="bg-[#111827]/50 border-gray-800">
                <CardContent className="p-4">
                  <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]} />
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
        toastClassName="bg-gray-800 text-white" // Customize to your theme
      bodyClassName="text-sm"
      />
    </div>
  )
}