-- Create task messages table
CREATE TABLE IF NOT EXISTS public.task_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.task_messages ENABLE ROW LEVEL SECURITY;

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
    ) );

-- Create indexes
CREATE INDEX idx_task_messages_task_id ON public.task_messages(task_id);
CREATE INDEX idx_task_messages_sender_id ON public.task_messages(sender_id);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.task_messages;