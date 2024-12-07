-- Ensure profiles table has correct structure
CREATE TABLE IF NOT EXISTS public.profiles_new (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member',
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrate existing data
INSERT INTO public.profiles_new (
    id, username, full_name, avatar_url, role, points, created_at, updated_at
)
SELECT 
    p.id,
    COALESCE(p.username, u.email),
    p.full_name,
    COALESCE(p.avatar_url, 'https://avatar.vercel.sh/' || p.id),
    COALESCE(p.role, 'member'),
    COALESCE(p.points, 0),
    COALESCE(p.created_at, NOW()),
    COALESCE(p.updated_at, NOW())
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

-- Drop old table and rename new one
DROP TABLE IF EXISTS public.profiles CASCADE;
ALTER TABLE public.profiles_new RENAME TO profiles;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow viewing all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create trigger for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        username,
        avatar_url,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        'https://avatar.vercel.sh/' || NEW.id,
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin')
            THEN 'admin'
            ELSE 'member'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();