-- First ensure training_courses table exists with proper structure
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

-- Ensure profiles have admin role column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can create training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can update training courses" ON public.training_courses;
DROP POLICY IF EXISTS "Admins can delete training courses" ON public.training_courses;

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Anyone can view public training courses"
ON public.training_courses FOR SELECT
TO authenticated
USING (
    is_public = true 
    OR created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

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

-- Create function to ensure at least one admin exists
CREATE OR REPLACE FUNCTION ensure_admin_exists()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE role = 'admin'
    ) THEN
        -- Make the first user an admin
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
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id IN (
            SELECT id
            FROM public.profiles
            ORDER BY created_at
            LIMIT 1
        );
    END IF;
END $$;