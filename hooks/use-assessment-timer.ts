"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

interface UseAssessmentTimerProps {
  timeLimit: number; // in seconds
  onTimeUp: () => void;
}

export function useAssessmentTimer({ timeLimit, onTimeUp }: UseAssessmentTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          onTimeUp();
          return 0;
        }
        
        // Show warning when 1 minute remaining
        if (prev === 60) {
          toast({
            title: "Time Warning",
            description: "1 minute remaining!",
            variant: "destructive",
          });
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeUp, toast]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setTimeRemaining(timeLimit);
    setIsRunning(false);
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}