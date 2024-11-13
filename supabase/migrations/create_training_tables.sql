-- Training courses table
CREATE TABLE training_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Training lessons table
CREATE TABLE training_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  content_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User progress tracking
CREATE TABLE user_lesson_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES training_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completion_date TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, lesson_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_lessons_course_id ON training_lessons(course_id);
CREATE INDEX idx_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_progress_lesson_id ON user_lesson_progress(lesson_id); 