-- Add points column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points);

-- Update existing profiles to have 0 points if null
UPDATE public.profiles 
SET points = 0 
WHERE points IS NULL;

-- Add not null constraint
ALTER TABLE public.profiles 
ALTER COLUMN points SET NOT NULL;

-- Create function to handle points updates
CREATE OR REPLACE FUNCTION update_profile_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's total points in profiles
    UPDATE public.profiles
    SET points = (
        SELECT COALESCE(SUM(points), 0)
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for points updates
DROP TRIGGER IF EXISTS on_achievement_earned ON user_achievements;
CREATE TRIGGER on_achievement_earned
    AFTER INSERT ON user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_points();