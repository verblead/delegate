-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create courses table
create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  thumbnail_url text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_hours integer,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published boolean default false,
  published_at timestamp with time zone
);

-- Create modules table
create table modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lessons table
create table lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  title text not null,
  description text,
  content_type text check (content_type in ('video', 'document', 'slides')) not null,
  content_url text not null,
  duration_minutes integer,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create questions table for assessments
create table questions (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references lessons(id) on delete cascade not null,
  question_text text not null,
  explanation text,
  points integer default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create answers table
create table answers (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references questions(id) on delete cascade not null,
  answer_text text not null,
  is_correct boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user progress table
create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started' not null,
  progress_percent integer default 0 check (progress_percent between 0 and 100),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id)
);

-- Create user assessment results table
create table assessment_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  selected_answer_id uuid references answers(id) on delete cascade not null,
  is_correct boolean not null,
  points_earned integer not null,
  attempt_number integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;
alter table user_progress enable row level security;
alter table assessment_results enable row level security;

-- Create policies
-- Courses
create policy "Courses are viewable by everyone"
  on courses for select
  using (published = true or auth.uid() = created_by);

create policy "Only admins can create courses"
  on courses for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Modules
create policy "Modules are viewable by everyone"
  on modules for select
  using (
    exists (
      select 1 from courses
      where courses.id = modules.course_id
      and (courses.published = true or courses.created_by = auth.uid())
    )
  );

-- Lessons
create policy "Lessons are viewable by everyone"
  on lessons for select
  using (
    exists (
      select 1 from modules
      join courses on courses.id = modules.course_id
      where modules.id = lessons.module_id
      and (courses.published = true or courses.created_by = auth.uid())
    )
  );

-- Questions
create policy "Questions are viewable by enrolled users"
  on questions for select
  using (
    exists (
      select 1 from lessons
      join modules on modules.id = lessons.module_id
      join courses on courses.id = modules.course_id
      where lessons.id = questions.lesson_id
      and (courses.published = true or courses.created_by = auth.uid())
    )
  );

-- User Progress
create policy "Users can view their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on user_progress for update
  using (auth.uid() = user_id);

-- Assessment Results
create policy "Users can view their own results"
  on assessment_results for select
  using (auth.uid() = user_id);

create policy "Users can submit their own results"
  on assessment_results for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_modules_course_id on modules(course_id);
create index idx_modules_order on modules(order_index);
create index idx_lessons_module_id on lessons(module_id);
create index idx_lessons_order on lessons(order_index);
create index idx_questions_lesson_id on questions(lesson_id);
create index idx_answers_question_id on answers(question_id);
create index idx_user_progress_user_id on user_progress(user_id);
create index idx_user_progress_lesson_id on user_progress(lesson_id);
create index idx_assessment_results_user_id on assessment_results(user_id);
create index idx_assessment_results_question_id on assessment_results(question_id);

-- Enable realtime subscriptions
alter publication supabase_realtime add table courses;
alter publication supabase_realtime add table modules;
alter publication supabase_realtime add table lessons;
alter publication supabase_realtime add table user_progress;
alter publication supabase_realtime add table assessment_results;

-- Create storage bucket for course content
insert into storage.buckets (id, name, public)
values ('course-content', 'course-content', true)
on conflict (id) do nothing;

-- Create storage policies
create policy "Anyone can read course content"
  on storage.objects for select
  using ( bucket_id = 'course-content' );

create policy "Only admins can upload course content"
  on storage.objects for insert
  with check (
    bucket_id = 'course-content' and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );