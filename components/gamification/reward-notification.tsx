"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Gift, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardNotificationProps {
  reward: {
    title: string;
    description: string;
    points: number;
  } | null;
  onClose: () => void;
}

export function RewardNotification({ reward, onClose }: RewardNotificationProps) {
  if (!reward) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, x: "50%" }}
        animate={{ opacity: 1, y: 0, x: "50%" }}
        exit={{ opacity: 0, y: 50, x: "50%" }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-card p-4 rounded-lg shadow-lg border flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          
          <div>
            <h4 className="font-semibold">{reward.title}</h4>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">+{reward.points} points</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}