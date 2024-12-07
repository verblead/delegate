"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideViewerProps {
  slides: string;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export function SlideViewer({ slides, onProgress, onComplete }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideUrls = JSON.parse(slides) as string[];
  const totalSlides = slideUrls.length;

  const handleSlideChange = (direction: "prev" | "next") => {
    const newSlide = direction === "prev" ? currentSlide - 1 : currentSlide + 1;
    if (newSlide >= 0 && newSlide < totalSlides) {
      setCurrentSlide(newSlide);
      const progress = ((newSlide + 1) / totalSlides) * 100;
      onProgress(progress);

      if (progress >= 95) {
        onComplete();
      }
    }
  };

  return (
    <Card className="p-6">
      <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
        <img
          src={slideUrls[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-contain"
        />
        
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleSlideChange("prev")}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="bg-black/50 px-4 py-2 rounded-full">
            <span className="text-white">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleSlideChange("next")}
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress 
        value={(currentSlide + 1) / totalSlides * 100} 
        className="mt-4"
      />
    </Card>
  );
}