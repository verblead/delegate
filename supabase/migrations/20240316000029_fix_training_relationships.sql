-- Drop existing tables if they exist to rebuild with proper relationships
DROP TABLE IF EXISTS public.user_question_answers CASCADE;
DROP TABLE IF EXISTS public.question_choices CASCADE;
DROP TABLE IF EXISTS public.assessment_questions CASCADE;
DROP TABLE IF EXISTS public.training_assessments CASCADE;
DROP TABLE IF EXISTS public.user_content_progress CASCADE;
DROP TABLE IF EXISTS public.training_content CASCADE;

-- Recreate training content table
CREATE TABLE public.training_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('video', 'document', 'slides')),
    title TEXT NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    duration INTEGER,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate user content progress table with proper foreign key
CREATE TABLE public.user_content_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.training_content(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_position INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, content_id)
);

-- Recreate training assessments table
CREATE TABLE public.training_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES public.training_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 70,
    attempts_allowed INTEGER NOT NULL DEFAULT 3,
    time_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate assessment questions table with proper foreign key
CREATE TABLE public.assessment_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES public.training_assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate question choices table
CREATE TABLE public.question_choices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate user answers table
CREATE TABLE public.user_question_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    choice_id UUID REFERENCES public.question_choices(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view training content"
ON public.training_content FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can track their own progress"
ON public.user_content_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

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

CREATE POLICY "Users can manage their own answers"
ON public.user_question_answers FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_training_content_lesson ON public.training_content(lesson_id);
CREATE INDEX idx_user_content_progress_user ON public.user_content_progress(user_id);
CREATE INDEX idx_user_content_progress_content ON public.user_content_progress(content_id);
CREATE INDEX idx_training_assessments_lesson ON public.training_assessments(lesson_id);
CREATE INDEX idx_assessment_questions_assessment ON public.assessment_questions(assessment_id);
CREATE INDEX idx_question_choices_question ON public.question_choices(question_id);
CREATE INDEX idx_user_question_answers_user ON public.user_question_answers(user_id);
CREATE INDEX idx_user_question_answers_question ON public.user_question_answers(question_id);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.training_content;
ALTER publication supabase_realtime ADD TABLE public.user_content_progress;
ALTER publication supabase_realtime ADD TABLE public.training_assessments;
ALTER publication supabase_realtime ADD TABLE public.user_question_answers;