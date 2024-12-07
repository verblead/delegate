-- Questions table
CREATE TABLE training_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES training_lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Question choices table
CREATE TABLE training_question_choices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES training_questions(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User answers table
CREATE TABLE user_question_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES training_questions(id) ON DELETE CASCADE,
  choice_id UUID REFERENCES training_question_choices(id) ON DELETE CASCADE,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, question_id)
);

-- Indexes
CREATE INDEX idx_questions_lesson_id ON training_questions(lesson_id);
CREATE INDEX idx_choices_question_id ON training_question_choices(question_id);
CREATE INDEX idx_answers_user_id ON user_question_answers(user_id);
CREATE INDEX idx_answers_question_id ON user_question_answers(question_id); 