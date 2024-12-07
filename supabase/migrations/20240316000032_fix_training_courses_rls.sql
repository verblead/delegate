-- First ensure the profiles table has the role column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Enable RLS on training_courses
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can manage training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can create training courses" ON public.training_courses;

-- Create more granular policies for training_courses
CREATE POLICY "Anyone can view training courses"
ON public.training_courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create training courses"
ON public.training_courses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Admins can update training courses"
ON public.training_courses FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete training courses"
ON public.training_courses FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Create function to set initial admin role
CREATE OR REPLACE FUNCTION set_initial_admin_role()
RETURNS void AS $$
BEGIN
    -- Set the first user as admin if no admin exists
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id IN (
        SELECT id 
        FROM public.profiles 
        ORDER BY created_at 
        LIMIT 1
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT set_initial_admin_role();