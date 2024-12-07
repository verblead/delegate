'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AchievementBadge } from './achievement-badge'
import { Certificate } from './certificate'
import { StreakTracker } from './streak-tracker'
import { gamificationService } from '@/lib/gamification-service'
import { Achievement } from '@/lib/types/achievements'

// Add this type definition
type CertificateType = React.ComponentProps<typeof Certificate> & {
  id: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    achievements: [] as Achievement[],
    certificates: [] as CertificateType[],
    streak: {
      current: 0,
      longest: 0,
      lastActivity: ''
    }
  })

  useEffect(() => {
    const loadUserStats = async () => {
      const [
        levelData,
        achievements,
        certificates,
        streak
      ] = await Promise.all([
        gamificationService.calculateUserLevel(userId),
        gamificationService.getUserAchievements(userId),
        gamificationService.getUserCertificates(userId),
        gamificationService.getUserStreak(userId)
      ])

      setUserStats({
        level: levelData.level,
        points: levelData.points,
        achievements: achievements || [],
        certificates: certificates || [],
        streak: {
          current: streak?.current_streak || 0,
          longest: streak?.longest_streak || 0,
          lastActivity: streak?.last_activity_date || ''
        }
      })
    }

    loadUserStats()
  }, [userId])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Level {userStats.level}</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={(userStats.points % 100)}
            max={100}
            className="mb-2"
          />
          <p className="text-sm text-muted-foreground">
            {userStats.points} total points
          </p>
        </CardContent>
      </Card>

      <StreakTracker
        currentStreak={userStats.streak.current}
        longestStreak={userStats.streak.longest}
        lastActivityDate={userStats.streak.lastActivity}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats.achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            id={achievement.id}
            title={achievement.title}
            description={achievement.description}
            iconUrl={achievement.iconUrl}
            points={achievement.points}
            earned={true}
            criteria={achievement.criteria}
            created_at={achievement.created_at}
          />
        ))}
      </div>

      {userStats.certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userStats.certificates.map((certificate) => (
            <Certificate
              key={certificate.id}
              {...certificate}
            />
          ))}
        </div>
      )}
    </div>
  )
} 