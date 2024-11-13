import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface LessonNavigationProps {
  courseId: string
  prevLessonId?: string
  nextLessonId?: string
  onComplete?: () => void
}

export function LessonNavigation({
  courseId,
  prevLessonId,
  nextLessonId,
  onComplete
}: LessonNavigationProps) {
  return (
    <div className="flex justify-between">
      {prevLessonId ? (
        <Link href={`/dashboard/training/${courseId}/${prevLessonId}`}>
          <Button variant="outline">
            <ChevronLeft className="mr-2" />
            Previous Lesson
          </Button>
        </Link>
      ) : <div />}

      {nextLessonId ? (
        <Link href={`/dashboard/training/${courseId}/${nextLessonId}`}>
          <Button>
            Next Lesson
            <ChevronRight className="ml-2" />
          </Button>
        </Link>
      ) : (
        <Button onClick={onComplete}>Complete Course</Button>
      )}
    </div>
  )
} 