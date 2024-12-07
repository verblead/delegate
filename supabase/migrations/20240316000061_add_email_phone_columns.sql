-- Add email and phone columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing profiles with their email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Create index for email search
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
