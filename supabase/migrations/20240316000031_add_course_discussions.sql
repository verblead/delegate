-- Create course discussions table
CREATE TABLE IF NOT EXISTS public.course_discussions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT course_discussions_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create course notes table
CREATE TABLE IF NOT EXISTS public.course_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT course_notes_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.course_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for course discussions
CREATE POLICY "Users can view course discussions"
ON public.course_discussions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create course discussions"
ON public.course_discussions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policies for course notes
CREATE POLICY "Users can view their own notes"
ON public.course_notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON public.course_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_course_discussions_course ON public.course_discussions(course_id);
CREATE INDEX idx_course_discussions_user ON public.course_discussions(user_id);
CREATE INDEX idx_course_notes_course ON public.course_notes(course_id);
CREATE INDEX idx_course_notes_user ON public.course_notes(user_id);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.course_discussions;
ALTER publication supabase_realtime ADD TABLE public.course_notes;