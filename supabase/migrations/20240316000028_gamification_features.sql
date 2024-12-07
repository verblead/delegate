-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_url TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('course_completion', 'lesson_streak', 'points_earned', 'volunteer_tasks')),
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE,
    certificate_url TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Create learning streaks table
CREATE TABLE IF NOT EXISTS public.learning_streaks (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update streaks
CREATE OR REPLACE FUNCTION update_learning_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_activity_date DATE;
    days_difference INTEGER;
BEGIN
    -- Get user's last activity date
    SELECT ls.last_activity INTO last_activity_date
    FROM learning_streaks ls
    WHERE ls.user_id = NEW.user_id;

    IF last_activity_date IS NULL THEN
        -- First activity
        INSERT INTO learning_streaks (user_id, current_streak, longest_streak, last_activity)
        VALUES (NEW.user_id, 1, 1, CURRENT_DATE);
    ELSE
        days_difference := CURRENT_DATE - last_activity_date;
        
        IF days_difference = 1 THEN
            -- Consecutive day
            UPDATE learning_streaks
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_activity = CURRENT_DATE,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF days_difference = 0 THEN
            -- Same day activity, just update last_activity
            UPDATE learning_streaks
            SET last_activity = CURRENT_DATE,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSE
            -- Streak broken
            UPDATE learning_streaks
            SET current_streak = 1,
                last_activity = CURRENT_DATE,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating streaks
CREATE TRIGGER update_streak_on_lesson_completion
    AFTER INSERT ON public.user_lesson_progress
    FOR EACH ROW
    WHEN (NEW.completed = true)
    EXECUTE FUNCTION update_learning_streak();

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
    achievement RECORD;
    meets_requirement BOOLEAN;
BEGIN
    FOR achievement IN SELECT * FROM achievements LOOP
        meets_requirement := CASE
            WHEN achievement.requirement_type = 'course_completion' THEN
                EXISTS (
                    SELECT 1
                    FROM user_lesson_progress ulp
                    JOIN training_lessons tl ON ulp.lesson_id = tl.id
                    WHERE ulp.user_id = p_user_id
                    AND ulp.completed = true
                    GROUP BY tl.course_id
                    HAVING COUNT(*) >= achievement.requirement_value
                )
            WHEN achievement.requirement_type = 'lesson_streak' THEN
                EXISTS (
                    SELECT 1
                    FROM learning_streaks
                    WHERE user_id = p_user_id
                    AND current_streak >= achievement.requirement_value
                )
            WHEN achievement.requirement_type = 'points_earned' THEN
                EXISTS (
                    SELECT 1
                    FROM profiles
                    WHERE id = p_user_id
                    AND points >= achievement.requirement_value
                )
            WHEN achievement.requirement_type = 'volunteer_tasks' THEN
                EXISTS (
                    SELECT 1
                    FROM volunteer_tasks
                    WHERE volunteer_id = p_user_id
                    AND status = 'completed'
                    GROUP BY volunteer_id
                    HAVING COUNT(*) >= achievement.requirement_value
                )
            ELSE false
        END;

        IF meets_requirement THEN
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (p_user_id, achievement.id)
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their achievements"
ON public.user_achievements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view their certificates"
ON public.certificates FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view their streaks"
ON public.learning_streaks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_course ON public.certificates(course_id);
CREATE INDEX idx_learning_streaks_user ON public.learning_streaks(user_id);

-- Insert some default achievements
INSERT INTO public.achievements (title, description, badge_url, points, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first course', '/badges/first-steps.svg', 100, 'course_completion', 1),
('Quick Learner', 'Complete 5 courses', '/badges/quick-learner.svg', 500, 'course_completion', 5),
('Knowledge Seeker', 'Complete 10 courses', '/badges/knowledge-seeker.svg', 1000, 'course_completion', 10),
('Dedicated Student', 'Maintain a 7-day learning streak', '/badges/dedicated-student.svg', 200, 'lesson_streak', 7),
('Master Student', 'Maintain a 30-day learning streak', '/badges/master-student.svg', 1000, 'lesson_streak', 30),
('Point Collector', 'Earn 1000 points', '/badges/point-collector.svg', 0, 'points_earned', 1000),
('Helping Hand', 'Complete 5 volunteer tasks', '/badges/helping-hand.svg', 500, 'volunteer_tasks', 5),
('Community Champion', 'Complete 20 volunteer tasks', '/badges/community-champion.svg', 2000, 'volunteer_tasks', 20);