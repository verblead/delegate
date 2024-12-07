"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player";

interface DocumentViewerProps {
  content: string;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export function DocumentViewer({ content, onProgress, onComplete }: DocumentViewerProps) {
  const [scale, setScale] = useState(1);
  const isPdf = content.endsWith(".pdf");
  const isVideo = content.match(/\.(mp4|webm|ogg)$/i);
  const isMarkdown = content.match(/\.(md|markdown)$/i) || !isPdf;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const progress = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    onProgress(progress);
    
    if (progress >= 90) {
      onComplete();
    }
  };

  if (isVideo) {
    return (
      <Card className="p-6">
        <div className="aspect-video">
          <ReactPlayer
            url={content}
            width="100%"
            height="100%"
            controls
            onProgress={({ played }) => {
              onProgress(played * 100);
              if (played >= 0.9) {
                onComplete();
              }
            }}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(scale - 0.1)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(scale + 0.1)}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea 
        className="h-[600px] rounded-lg border"
        onScrollCapture={handleScroll}
      >
        <div 
          className="p-6"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease-in-out"
          }}
        >
          {isMarkdown ? (
            <ReactMarkdown className="prose dark:prose-invert max-w-none">
              {content}
            </ReactMarkdown>
          ) : (
            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
              <p>PDF preview is not available. Please download the file to view it.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}