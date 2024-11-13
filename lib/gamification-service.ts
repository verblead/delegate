'use client'

import { Achievement } from '@/lib/types/achievements'

export const gamificationService = {
  calculateUserLevel: async (userId: string) => {
    // Mock data - replace with actual API calls
    return {
      level: 2,
      points: 150
    }
  },

  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    // Mock data - replace with actual API calls
    return [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first training module',
        iconUrl: '/badges/first-steps.png',
        points: 50,
        criteria: {
          type: 'course_completion',
          value: 1
        },
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Quick Learner',
        description: 'Complete 5 training modules',
        iconUrl: '/badges/quick-learner.png',
        points: 100,
        criteria: {
          type: 'course_completion',
          value: 5
        },
        created_at: new Date().toISOString()
      }
    ]
  },

  getUserCertificates: async (userId: string) => {
    // Mock data - replace with actual API calls
    return [
      {
        id: '1',
        courseTitle: 'Volunteer Basics',
        userName: 'John Doe',
        issueDate: new Date().toISOString(),
        certificateUrl: '/certificates/volunteer-basics.pdf'
      }
    ]
  },

  getUserStreak: async (userId: string) => {
    // Mock data - replace with actual API calls
    return {
      current_streak: 5,
      longest_streak: 7,
      last_activity_date: new Date().toISOString()
    }
  }
} 