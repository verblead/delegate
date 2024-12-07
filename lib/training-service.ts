import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export class TrainingService {
  private supabase = createClientComponentClient()

  async updateLessonProgress(lessonId: string, progress: number) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return

    const { data, error } = await this.supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        last_accessed: new Date().toISOString(),
        completed: progress >= 100,
        completion_date: progress >= 100 ? new Date().toISOString() : null
      })

    if (error) throw error
    return data
  }

  async getQuestions(lessonId: string) {
    const { data, error } = await this.supabase
      .from('training_questions')
      .select(`
        *,
        choices: training_question_choices(*)
      `)
      .eq('lesson_id', lessonId)
      .order('sequence')

    if (error) throw error
    return data
  }

  async submitAnswer(questionId: string, choiceId: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return

    const { data, error } = await this.supabase
      .from('user_question_answers')
      .insert({
        user_id: user.id,
        question_id: questionId,
        choice_id: choiceId,
        answered_at: new Date().toISOString()
      })

    if (error) throw error
    return data
  }
}

export const trainingService = new TrainingService() 