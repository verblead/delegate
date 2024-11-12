export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  published_at?: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'slides';
  content_url: string;
  duration_minutes?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  lesson_id: string;
  question_text: string;
  explanation?: string;
  points: number;
  created_at: string;
  updated_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percent: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer_id: string;
  is_correct: boolean;
  points_earned: number;
  attempt_number: number;
  created_at: string;
}