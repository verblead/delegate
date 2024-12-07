-- Add time_limit to assessments table
ALTER TABLE public.training_assessments
ADD COLUMN time_limit INTEGER; -- Time limit in seconds

-- Add save_progress to assessments table
ALTER TABLE public.training_assessments
ADD COLUMN save_progress BOOLEAN DEFAULT true;

-- Add type to assessment questions table
ALTER TABLE public.assessment_questions
ADD COLUMN question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false')) DEFAULT 'multiple_choice';

-- Add review_mode to user assessment attempts
ALTER TABLE public.user_assessment_attempts
ADD COLUMN review_mode BOOLEAN DEFAULT false;

-- Add time_spent to user assessment attempts
ALTER TABLE public.user_assessment_attempts
ADD COLUMN time_spent INTEGER;

-- Add progress_state to user assessment attempts for saving progress
ALTER TABLE public.user_assessment_attempts
ADD COLUMN progress_state JSONB;

-- Create assessment feedback table
CREATE TABLE IF NOT EXISTS public.assessment_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attempt_id UUID REFERENCES public.user_assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new table
ALTER TABLE public.assessment_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment feedback
CREATE POLICY "Users can view their own feedback"
ON public.assessment_feedback FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_assessment_attempts a
        WHERE a.id = attempt_id
        AND a.user_id = auth.uid()
    )
);

-- Create indexes for new columns
CREATE INDEX idx_assessment_questions_type ON public.assessment_questions(question_type);
CREATE INDEX idx_user_assessment_attempts_review ON public.user_assessment_attempts(review_mode);
CREATE INDEX idx_assessment_feedback_attempt ON public.assessment_feedback(attempt_id);
CREATE INDEX idx_assessment_feedback_question ON public.assessment_feedback(question_id);