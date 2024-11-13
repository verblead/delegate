'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '@/lib/types/achievements'

interface AchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementNotification({
  achievement,
  onClose
}: AchievementNotificationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (achievement) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  return (
    <AnimatePresence>
      {show && achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-4">
            <img
              src={achievement.iconUrl}
              alt={achievement.title}
              className="w-12 h-12"
            />
            <div>
              <h4 className="font-bold">Achievement Unlocked!</h4>
              <p className="text-sm">{achievement.title}</p>
              <p className="text-xs opacity-80">+{achievement.points} points</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 