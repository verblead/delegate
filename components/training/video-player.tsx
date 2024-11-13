'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  onProgress: (progress: number) => void
  onComplete: () => void
}

export function VideoPlayer({ videoUrl, onProgress, onComplete }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const newProgress = (video.currentTime / video.duration) * 100
    setProgress(newProgress)
    onProgress(newProgress)
    
    if (newProgress >= 95) {
      onComplete()
    }
  }

  return (
    <Card className="relative">
      <video
        className="w-full rounded-lg"
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        muted={muted}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  )
} 