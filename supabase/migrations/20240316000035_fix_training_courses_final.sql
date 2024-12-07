-- First ensure the training_courses table exists with proper structure
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

-- Make sure RLS is enabled
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

-- Create new simplified policies
CREATE POLICY "Anyone can view courses"
ON public.training_courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create courses"
ON public.training_courses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Course creators can update their courses"
ON public.training_courses FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Course creators can delete their courses"
ON public.training_courses FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_training_courses_updated_at ON public.training_courses;
CREATE TRIGGER update_training_courses_updated_at
    BEFORE UPDATE ON public.training_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Make sure the training_courses table is part of realtime
ALTER PUBLICATION supabase_realtime ADD TABLE training_courses;