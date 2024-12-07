"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Star, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "confetti-js";

interface LevelUpPopupProps {
  levelUp: {
    newLevel: number;
    rewards: string[];
  } | null;
  onClose: () => void;
}

export function LevelUpPopup({ levelUp, onClose }: LevelUpPopupProps) {
  useEffect(() => {
    if (levelUp) {
      const confettiSettings = {
        target: "levelup-confetti",
        max: 200,
        size: 2,
        animate: true,
        props: ["circle", "square", "triangle", "line"],
        colors: [[255, 198, 51], [255, 215, 0], [255, 235, 59], [255, 255, 0]],
        clock: 25,
        rotate: true,
      };
      const confettiCanvas = new confetti(confettiSettings);
      confettiCanvas.render();

      const timer = setTimeout(() => {
        confettiCanvas.clear();
        onClose();
      }, 6000);

      return () => {
        clearTimeout(timer);
        confettiCanvas.clear();
      };
    }
  }, [levelUp, onClose]);

  if (!levelUp) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <canvas id="levelup-confetti" className="fixed inset-0 z-0" />
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="p-8 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 shadow-xl">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className="relative w-24 h-24 mx-auto"
              >
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
                <div className="relative w-full h-full rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <ArrowUp className="h-12 w-12 text-yellow-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h2 className="text-3xl font-bold text-yellow-500">Level Up!</h2>
                <p className="text-xl font-semibold">
                  You've reached Level {levelUp.newLevel}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium">New Rewards Unlocked</h3>
                <div className="flex flex-col gap-2">
                  {levelUp.rewards.map((reward, index) => (
                    <motion.div
                      key={reward}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <Badge
                        variant="outline"
                        className="w-full justify-center py-2 text-yellow-500 border-yellow-500/20"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {reward}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}