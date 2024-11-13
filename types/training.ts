export interface Course {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  sequence: number
  content_type: 'video' | 'document' | 'slides'
  content_url: string
  created_at: string
  updated_at: string
}

export interface UserProgress {
  user_id: string
  lesson_id: string
  completed: boolean
  last_accessed: string
  completion_date?: string
} 