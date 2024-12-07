-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_choices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_task_attachments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view channels" ON public.channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Anyone can view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel admins can manage members" ON public.channel_members;

-- Ensure storage buckets are public
UPDATE storage.buckets SET public = true;

-- Drop storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload post attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read post attachments" ON storage.objects;

-- Create a single permissive storage policy
CREATE POLICY "Allow all storage access" ON storage.objects
FOR ALL TO authenticated USING (true) WITH CHECK (true);