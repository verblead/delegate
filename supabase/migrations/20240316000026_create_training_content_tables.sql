-- Create training content tables
CREATE TABLE IF NOT EXISTS public.training_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('video', 'document', 'slides')),
    title TEXT NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    duration INTEGER, -- Duration in seconds for videos
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create training assessments tables
CREATE TABLE IF NOT EXISTS public.training_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 70,
    attempts_allowed INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES public.training_assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.question_choices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_assessment_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.training_assessments(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, assessment_id)
);

CREATE TABLE IF NOT EXISTS public.user_question_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attempt_id UUID REFERENCES public.user_assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    selected_choice_id UUID REFERENCES public.question_choices(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create content progress tracking
CREATE TABLE IF NOT EXISTS public.user_content_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.training_content(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_position INTEGER DEFAULT 0, -- For video progress tracking
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE public.training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view training content"
ON public.training_content FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view assessments"
ON public.training_assessments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view questions"
ON public.assessment_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view choices"
ON public.question_choices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their own attempts"
ON public.user_assessment_attempts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own attempts"
ON public.user_assessment_attempts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own answers"
ON public.user_question_answers FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_assessment_attempts a
        WHERE a.id = attempt_id
        AND a.user_id = auth.uid()
    )
);

CREATE POLICY "Users can track their own progress"
ON public.user_content_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_training_content_lesson ON public.training_content(lesson_id);
CREATE INDEX idx_training_assessments_lesson ON public.training_assessments(lesson_id);
CREATE INDEX idx_assessment_questions_assessment ON public.assessment_questions(assessment_id);
CREATE INDEX idx_question_choices_question ON public.question_choices(question_id);
CREATE INDEX idx_user_assessment_attempts_user ON public.user_assessment_attempts(user_id);
CREATE INDEX idx_user_assessment_attempts_assessment ON public.user_assessment_attempts(assessment_id);
CREATE INDEX idx_user_question_answers_attempt ON public.user_question_answers(attempt_id);
CREATE INDEX idx_user_content_progress_user ON public.user_content_progress(user_id);
CREATE INDEX idx_user_content_progress_content ON public.user_content_progress(content_id);

-- Create training-content storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-content', 'training-content', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can read training content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'training-content');

CREATE POLICY "Admins can upload training content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'training-content'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.training_content;
ALTER publication supabase_realtime ADD TABLE public.user_content_progress;