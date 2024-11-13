export interface Course {
  id: string;
  title: string;
  description: string | null;
  total_lessons: number;
  created_at?: string;
}

export interface UserProgress {
  [courseId: string]: {
    completed_lessons: number;
    last_accessed: string;
    completed: boolean;
    completion_date: string | null;
  };
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sequence: number;
  content: string;
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