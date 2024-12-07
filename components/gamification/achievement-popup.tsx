"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "confetti-js";

interface AchievementPopupProps {
  achievement: {
    title: string;
    description: string;
    points: number;
    badge_url: string;
  } | null;
  onClose: () => void;
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  useEffect(() => {
    if (achievement) {
      // Initialize confetti
      const confettiSettings = {
        target: "achievement-confetti",
        max: 150,
        size: 1.5,
        animate: true,
        props: ["circle", "square", "triangle", "line"],
        colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
        clock: 25,
        rotate: true,
      };
      const confettiCanvas = new confetti(confettiSettings);
      confettiCanvas.render();

      // Clean up confetti after animation
      const timer = setTimeout(() => {
        confettiCanvas.clear();
        onClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
        confettiCanvas.clear();
      };
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <canvas id="achievement-confetti" className="fixed inset-0 z-0" />
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold">Achievement Unlocked!</h3>
                  <p className="text-lg font-semibold text-primary">
                    {achievement.title}
                  </p>
                </motion.div>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  {achievement.description}
                </motion.p>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge variant="secondary" className="mt-2">
                    <Star className="h-3 w-3 mr-1" />
                    {achievement.points} points earned
                  </Badge>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}