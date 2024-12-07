export interface Achievement {
  id: string
  title: string
  description: string
  iconUrl: string
  points: number
  criteria: {
    type: 'course_completion' | 'lesson_streak' | 'points_earned'
    value: number
  }
  created_at: string
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  earned_at: string
  achievement: Achievement
} 