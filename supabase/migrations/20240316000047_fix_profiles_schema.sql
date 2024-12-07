-- Drop existing profile triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        username,
        avatar_url,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://avatar.vercel.sh/' || NEW.id
        ),
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin')
            THEN 'admin'
            ELSE 'member'
        END,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing users have profiles
INSERT INTO public.profiles (id, email, username, avatar_url, role, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || id),
    'member',
    created_at,
    created_at
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = users.id
);