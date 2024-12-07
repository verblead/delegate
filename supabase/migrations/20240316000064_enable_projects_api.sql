-- Enable the projects table in the REST API
BEGIN;

-- Grant access to authenticated users
GRANT ALL ON public.projects TO authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Create or replace the projects view for the API
CREATE OR REPLACE VIEW api.projects AS
SELECT 
    p.*,
    (
        SELECT COUNT(*)
        FROM project_members pm
        WHERE pm.project_id = p.id
    ) as team_members,
    (
        SELECT COUNT(*)
        FROM project_files pf
        WHERE pf.project_id = p.id
    ) as files,
    (
        SELECT COUNT(*)
        FROM project_tasks pt
        WHERE pt.project_id = p.id
    ) as tasks
FROM public.projects p;

-- Grant access to the view
GRANT SELECT ON api.projects TO authenticated;

-- Create the project_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_members (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- Create the project_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the project_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant access to related tables
GRANT ALL ON public.project_members TO authenticated;
GRANT ALL ON public.project_files TO authenticated;
GRANT ALL ON public.project_tasks TO authenticated;

-- Enable RLS on related tables
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_members
CREATE POLICY "Users can view project members"
ON public.project_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Project owners can manage members"
ON public.project_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_id
        AND created_by = auth.uid()
    )
);

-- Create RLS policies for project_files
CREATE POLICY "Users can view project files"
ON public.project_files FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Project members can manage files"
ON public.project_files FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = project_files.project_id
        AND user_id = auth.uid()
    )
);

-- Create RLS policies for project_tasks
CREATE POLICY "Users can view project tasks"
ON public.project_tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Project members can manage tasks"
ON public.project_tasks FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = project_tasks.project_id
        AND user_id = auth.uid()
    )
);

COMMIT;
