-- Create task notes table
CREATE TABLE IF NOT EXISTS public.task_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT task_notes_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create task files table
CREATE TABLE IF NOT EXISTS public.task_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT task_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create task messages table
CREATE TABLE IF NOT EXISTS public.task_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT task_messages_sender_id_fkey FOREIGN KEY (sender_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for task notes
CREATE POLICY "Users can view task notes they have access to"
ON public.task_notes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
);

CREATE POLICY "Users can create task notes they have access to"
ON public.task_notes FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
);

-- Create policies for task files
CREATE POLICY "Users can view task files they have access to"
ON public.task_files FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
);

CREATE POLICY "Users can upload task files they have access to"
ON public.task_files FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
);

-- Create policies for task messages
CREATE POLICY "Users can view task messages they have access to"
ON public.task_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
);

CREATE POLICY "Users can create task messages they have access to"
ON public.task_messages FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = task_id
        AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
);

-- Create task-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for task files
CREATE POLICY "Allow authenticated users to read task files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-files');

CREATE POLICY "Allow authenticated users to upload task files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'task-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create indexes
CREATE INDEX idx_task_notes_task_id ON public.task_notes(task_id);
CREATE INDEX idx_task_notes_created_by ON public.task_notes(created_by);
CREATE INDEX idx_task_files_task_id ON public.task_files(task_id);
CREATE INDEX idx_task_files_uploaded_by ON public.task_files(uploaded_by);
CREATE INDEX idx_task_messages_task_id ON public.task_messages(task_id);
CREATE INDEX idx_task_messages_sender_id ON public.task_messages(sender_id);