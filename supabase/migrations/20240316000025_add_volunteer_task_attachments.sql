-- Create volunteer task attachments table
CREATE TABLE IF NOT EXISTS public.volunteer_task_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.volunteer_tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT volunteer_task_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) 
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.volunteer_task_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for volunteer task attachments
CREATE POLICY "Anyone can view volunteer task attachments"
ON public.volunteer_task_attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can upload volunteer task attachments"
ON public.volunteer_task_attachments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Create volunteer-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer-files', 'volunteer-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated users to read volunteer files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'volunteer-files');

CREATE POLICY "Allow admins to upload volunteer files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'volunteer-files'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Create indexes
CREATE INDEX idx_volunteer_task_attachments_task_id ON public.volunteer_task_attachments(task_id);
CREATE INDEX idx_volunteer_task_attachments_uploaded_by ON public.volunteer_task_attachments(uploaded_by);