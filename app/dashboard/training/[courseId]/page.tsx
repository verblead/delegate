import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function CourseDetail({ params }: { params: { courseId: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch course details and lessons
  const { data: course } = await supabase
    .from('training_courses')
    .select('*')
    .eq('id', params.courseId)
    .single()

  const { data: lessons } = await supabase
    .from('training_lessons')
    .select(`
      *,
      user_progress: user_lesson_progress(
        completed,
        last_accessed
      )
    `)
    .eq('course_id', params.courseId)
    .order('sequence')

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
      <p className="text-muted-foreground mb-6">{course?.description}</p>

      <div className="space-y-4">
        {lessons?.map((lesson) => (
          <Link 
            href={`/dashboard/training/${params.courseId}/${lesson.id}`} 
            key={lesson.id}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center p-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                </div>
                <div className="ml-4">
                  {lesson.user_progress?.[0]?.completed ? (
                    <span className="text-green-500">✓ Completed</span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}