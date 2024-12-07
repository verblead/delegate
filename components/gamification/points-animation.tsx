"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface PointsAnimationProps {
  points: number;
  x: number;
  y: number;
  onComplete: () => void;
}

export function PointsAnimation({ points, x, y, onComplete }: PointsAnimationProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x, y }}
        animate={{
          opacity: 1,
          scale: 1,
          y: y - 50,
        }}
        exit={{ opacity: 0, y: y - 100 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={onComplete}
        className="fixed z-50 pointer-events-none flex items-center gap-1 text-yellow-500 font-bold"
      >
        <Star className="h-4 w-4" />
        +{points}
      </motion.div>
    </AnimatePresence>
  );
}