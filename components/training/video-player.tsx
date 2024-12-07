"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import ReactPlayer from "react-player";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onProgress: (progress: number, currentTime: number) => void;
  onComplete: () => void;
  initialPosition?: number;
}

export function VideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  initialPosition = 0,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    if (playerRef.current && initialPosition > 0) {
      playerRef.current.seekTo(initialPosition, "seconds");
    }
  }, [initialPosition]);

  const handleProgress = ({ played, playedSeconds }: { played: number; playedSeconds: number }) => {
    setProgress(played * 100);
    setCurrentTime(playedSeconds);
    onProgress(played * 100, playedSeconds);

    if (played >= 0.95) {
      onComplete();
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
    setLoading(false);
  };

  const handleSeek = (value: number[]) => {
    const time = (value[0] / 100) * duration;
    playerRef.current?.seekTo(time);
  };

  const handleSkip = (seconds: number) => {
    const player = playerRef.current;
    if (player) {
      const newTime = currentTime + seconds;
      player.seekTo(Math.max(0, Math.min(newTime, duration)));
    }
  };

  const toggleFullscreen = () => {
    const element = document.querySelector(".react-player");
    if (!element) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen();
    }
  };

  return (
    <Card className="relative group">
      <div className="aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          className="react-player"
          progressInterval={1000}
        />
      </div>

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 right-4">
            <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-16 left-4 right-4">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => handleSkip(-10)}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => handleSkip(10)}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setMuted(!muted)}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[muted ? 0 : volume]}
                max={1}
                step={0.1}
                className="w-24"
                onValueChange={(value) => {
                  setVolume(value[0]);
                  setMuted(value[0] === 0);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPlaybackRate(0.5)}>
                  0.5x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlaybackRate(1)}>
                  1x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlaybackRate(1.5)}>
                  1.5x
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlaybackRate(2)}>
                  2x
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}