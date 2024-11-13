'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  points: number;
  earned: boolean;
  criteria: {
    type: 'course_completion' | 'lesson_streak' | 'points_earned';
    value: number;
  };
  created_at: string;
}

export function AchievementBadge({
  id,
  title,
  description,
  iconUrl,
  points,
  earned,
  criteria,
  created_at
}: AchievementBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className={`${earned ? 'bg-primary/10' : 'opacity-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="relative w-20 h-20 mx-auto mb-2">
            <Image
              src={iconUrl}
              alt={title}
              fill
              className={`${earned ? '' : 'grayscale'}`}
            />
            {points !== undefined && (
              <div className="absolute bottom-0 w-full bg-background/80 text-xs py-1">
                {points} points
              </div>
            )}
          </div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
} 