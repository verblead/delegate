'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
}

export function StreakTracker({
  currentStreak,
  longestStreak,
  lastActivityDate
}: StreakTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="text-orange-500" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around text-center">
          <div>
            <div className="text-3xl font-bold">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{longestStreak}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Last activity: {new Date(lastActivityDate).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
} 