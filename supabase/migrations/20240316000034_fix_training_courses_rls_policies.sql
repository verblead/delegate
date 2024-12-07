-- First, drop all existing policies on training_courses
DROP POLICY IF EXISTS "Admins can create training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can delete training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can update training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Anyone can view public training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON public.training_courses;
DROP POLICY IF EXISTS "Anyone can view training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.training_courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.training_courses;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.training_courses;
DROP POLICY IF EXISTS "Users can create courses" ON public.training_courses;

-- Make sure RLS is enabled
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Create a single, clear select policy
CREATE POLICY "Enable read access for authenticated users"
ON public.training_courses FOR SELECT
TO authenticated
USING (true);

-- Create a single, clear insert policy
CREATE POLICY "Enable insert for authenticated users"
ON public.training_courses FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create a single, clear update policy
CREATE POLICY "Enable update for authenticated users"
ON public.training_courses FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a single, clear delete policy
CREATE POLICY "Enable delete for authenticated users"
ON public.training_courses FOR DELETE
TO authenticated
USING (true);

-- Make sure the training_courses table is part of realtime
ALTER PUBLICATION supabase_realtime ADD TABLE training_courses;