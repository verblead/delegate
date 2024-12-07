-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.training_courses;
DROP POLICY IF EXISTS "Enable insert for admins" ON public.training_courses;
DROP POLICY IF EXISTS "Enable update for admins and creators" ON public.training_courses;
DROP POLICY IF EXISTS "Enable delete for admins and creators" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can create training courses" ON public.training_courses;

-- Make sure RLS is enabled
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Ensure role column exists in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Create simplified policies with proper syntax
CREATE POLICY "Admins can create training courses"
ON public.training_courses
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Anyone can view training courses"
ON public.training_courses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update training courses"
ON public.training_courses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete training courses"
ON public.training_courses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Set the first user as admin if no admin exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    UPDATE profiles
    SET role = 'admin'
    WHERE id = (
      SELECT id 
      FROM profiles 
      ORDER BY created_at 
      LIMIT 1
    );
  END IF;
END $$;</content>