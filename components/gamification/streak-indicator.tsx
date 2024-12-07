"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
}

export function StreakIndicator({
  currentStreak,
  longestStreak,
  lastActivity,
}: StreakIndicatorProps) {
  const isHotStreak = currentStreak >= 7;

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background flames for hot streaks */}
      {isHotStreak && (
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-t from-orange-500 to-transparent"
          />
        </div>
      )}

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Flame className={`h-5 w-5 ${isHotStreak ? "text-orange-500" : "text-muted-foreground"}`} />
            Learning Streak
          </h3>
          {isHotStreak && (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              Hot Streak! 🔥
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <motion.p
              key={currentStreak}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold"
            >
              {currentStreak}
            </motion.p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
            <p className="text-3xl font-bold">{longestStreak}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Last activity{" "}
            {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
          </span>
        </div>

        {/* Motivational message */}
        {currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm"
          >
            {currentStreak < 7 ? (
              <p className="text-muted-foreground">
                Keep going! You're {7 - currentStreak} days away from a Hot Streak!
              </p>
            ) : (
              <p className="text-orange-500">
                Amazing! You're on fire! 🔥 Keep the streak alive!
              </p>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}