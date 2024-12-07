"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { VideoPlayer } from "./video-player";
import { DocumentViewer } from "./document-viewer";
import { SlideViewer } from "./slide-viewer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface ContentViewerProps {
  content: {
    id: string;
    type: "video" | "document" | "slides";
    title: string;
    description?: string;
    content_url: string;
    duration?: number;
    progress?: {
      progress: number;
      completed: boolean;
      last_position?: number;
    };
  };
  onProgress: (progress: number, lastPosition?: number) => void;
  onComplete: () => void;
}

export function ContentViewer({ content, onProgress, onComplete }: ContentViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const renderContent = () => {
    switch (content.type) {
      case "video":
        return (
          <VideoPlayer
            videoUrl={content.content_url}
            title={content.title}
            onProgress={onProgress}
            onComplete={onComplete}
            initialPosition={content.progress?.last_position}
          />
        );
      case "document":
        return (
          <DocumentViewer
            content={content.content_url}
            onProgress={onProgress}
            onComplete={onComplete}
          />
        );
      case "slides":
        return (
          <SlideViewer
            slides={content.content_url}
            onProgress={onProgress}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{content.title}</h2>
          {content.description && (
            <p className="text-muted-foreground mt-1">{content.description}</p>
          )}
        </div>
        <Badge variant={content.progress?.completed ? "default" : "secondary"}>
          {content.progress?.completed ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completed
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-1" />
              In Progress
            </>
          )}
        </Badge>
      </div>

      <Card className="relative overflow-hidden">
        {!isPlaying && content.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button
              size="lg"
              className="rounded-full h-16 w-16"
              onClick={() => setIsPlaying(true)}
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        )}
        {renderContent()}
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span>{Math.round(content.progress?.progress || 0)}%</span>
        </div>
        <Progress value={content.progress?.progress || 0} className="h-2" />
        {content.duration && (
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              Duration: {formatDuration(content.duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}