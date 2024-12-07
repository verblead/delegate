import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { VideoPlayer } from '@/components/training/video-player'
import { DocumentViewer } from '@/components/training/document-viewer'
import { MultipleChoice } from '@/components/training/multiple-choice'
import { trainingService } from '@/lib/training-service'

export default async function LessonDetail({ 
  params 
}: { 
  params: { courseId: string; lessonId: string } 
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch lesson details and content
  const { data: lesson } = await supabase
    .from('training_lessons')
    .select(`
      *,
      content: training_content(*)
    `)
    .eq('id', params.lessonId)
    .single()

  // Fetch navigation info
  const { data: navigation } = await supabase
    .from('training_lessons')
    .select('id, sequence')
    .eq('course_id', params.courseId)
    .order('sequence')

  const currentIndex = navigation?.findIndex(n => n.id === params.lessonId) ?? 0
  const prevLesson = navigation?.[currentIndex - 1]
  const nextLesson = navigation?.[currentIndex + 1]

  const { data: questions } = await supabase
    .from('training_questions')
    .select(`
      *,
      choices: training_question_choices(*)
    `)
    .eq('lesson_id', params.lessonId)
    .order('sequence')

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href={`/dashboard/training/${params.courseId}`}>
          <Button variant="ghost">← Back to Course</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">{lesson?.title}</h1>
          
          {lesson?.content_type === 'video' && (
            <VideoPlayer
              videoUrl={lesson.content_url}
              onProgress={(progress) => {
                trainingService.updateLessonProgress(lesson.id, progress)
              }}
              onComplete={() => {
                trainingService.updateLessonProgress(lesson.id, 100)
              }}
            />
          )}

          {lesson?.content_type === 'document' && (
            <DocumentViewer
              content={lesson.content_url}
              onProgress={(progress) => {
                trainingService.updateLessonProgress(lesson.id, progress)
              }}
              onComplete={() => {
                trainingService.updateLessonProgress(lesson.id, 100)
              }}
            />
          )}

          {questions && questions.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold">Assessment</h2>
              {questions.map((question) => (
                <MultipleChoice
                  key={question.id}
                  question={question.question_text}
                  choices={question.choices}
                  onAnswer={(correct) => {
                    // Handle answer submission
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex justify-between">
            {prevLesson ? (
              <Link href={`/dashboard/training/${params.courseId}/${prevLesson.id}`}>
                <Button variant="outline">
                  <ChevronLeft className="mr-2" />
                  Previous Lesson
                </Button>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link href={`/dashboard/training/${params.courseId}/${nextLesson.id}`}>
                <Button>
                  Next Lesson
                  <ChevronRight className="ml-2" />
                </Button>
              </Link>
            ) : (
              <Button variant="default">Complete Course</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
