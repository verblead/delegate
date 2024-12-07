-- First ensure the profiles table has the role column with proper index
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Ensure training_courses table exists with proper structure
CREATE TABLE IF NOT EXISTS public.training_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    total_lessons INTEGER DEFAULT 0,
    image_url TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours INTEGER,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    is_public BOOLEAN DEFAULT true,
    has_assessment BOOLEAN DEFAULT true,
    has_certificate BOOLEAN DEFAULT true,
    points_reward INTEGER DEFAULT 100,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better RLS performance
CREATE INDEX IF NOT EXISTS idx_training_courses_created_by ON public.training_courses(created_by);

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can create training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can update training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can delete training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.training_courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.training_courses;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.training_courses;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.training_courses;

-- Create optimized policies using best practices
CREATE POLICY "Enable read access for authenticated users"
ON public.training_courses FOR SELECT
TO authenticated
USING (
    is_public = true 
    OR created_by = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
);

CREATE POLICY "Enable insert for admins"
ON public.training_courses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
);

CREATE POLICY "Enable update for admins and creators"
ON public.training_courses FOR UPDATE
TO authenticated
USING (
    created_by = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
)
WITH CHECK (
    created_by = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
);

CREATE POLICY "Enable delete for admins and creators"
ON public.training_courses FOR DELETE
TO authenticated
USING (
    created_by = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid())
        AND role = 'admin'
    )
);

-- Create function to ensure at least one admin exists
CREATE OR REPLACE FUNCTION ensure_admin_exists()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE role = 'admin'
    ) THEN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure admin exists
DROP TRIGGER IF EXISTS ensure_admin_exists_trigger ON public.profiles;
CREATE TRIGGER ensure_admin_exists_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_admin_exists();

-- Set first user as admin if no admin exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE role = 'admin'
    ) THEN
        WITH first_user AS (
            SELECT id FROM public.profiles
            ORDER BY created_at
            LIMIT 1
        )
        UPDATE public.profiles p
        SET role = 'admin'
        FROM first_user
        WHERE p.id = first_user.id;
    END IF;
END $$;

-- Make sure the training_courses table is part of realtime
ALTER PUBLICATION supabase_realtime ADD TABLE training_courses;