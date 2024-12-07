-- Create the projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    deadline timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    budget numeric,
    tags text[],
    team_members uuid[],
    project_members uuid[]
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create project related tables if they don't exist
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    role text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    uploaded_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    assigned_to uuid REFERENCES auth.users(id)
);

-- Enable RLS on related tables
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for project owners" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for project owners" ON public.projects;

-- Create single, clear policies for projects
CREATE POLICY "Enable read access for authenticated users"
ON public.projects FOR SELECT
TO authenticated
USING (
    created_by = auth.uid() 
    OR 
    auth.uid() = ANY(project_members)
);

CREATE POLICY "Enable insert for authenticated users"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "Enable update for project owners"
ON public.projects FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Enable delete for project owners"
ON public.projects FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Grant necessary permissions
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.project_members TO authenticated;
GRANT ALL ON public.project_files TO authenticated;
GRANT ALL ON public.project_tasks TO authenticated;

-- Add index for project_members array
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE INDEX IF NOT EXISTS projects_project_members_idx ON public.projects USING gin (project_members array_ops);
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON public.projects (created_by);

-- Update the api.projects view permissions
DROP VIEW IF EXISTS api.projects;
CREATE VIEW api.projects AS
SELECT 
    p.*,
    (SELECT count(*) FROM public.project_members WHERE project_id = p.id) as team_members_count,
    (SELECT count(*) FROM public.project_files WHERE project_id = p.id) as files_count,
    (SELECT count(*) FROM public.project_tasks WHERE project_id = p.id) as tasks_count
FROM public.projects p;

GRANT SELECT ON api.projects TO authenticated;

-- Set up RLS policies for related tables
DROP POLICY IF EXISTS "Enable read access for project members" ON public.project_members;
CREATE POLICY "Enable read access for project members"
ON public.project_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.created_by = auth.uid() 
            OR auth.uid() = ANY(ARRAY(SELECT UNNEST(p.project_members)))
        )
    )
);

DROP POLICY IF EXISTS "Enable insert for project owners" ON public.project_members;
CREATE POLICY "Enable insert for project owners"
ON public.project_members FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND p.created_by = auth.uid()
    )
);

DROP POLICY IF EXISTS "Enable delete for project owners" ON public.project_members;
CREATE POLICY "Enable delete for project owners"
ON public.project_members FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND p.created_by = auth.uid()
    )
);

DROP POLICY IF EXISTS "Enable read access for project files" ON public.project_files;
CREATE POLICY "Enable read access for project files"
ON public.project_files FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.created_by = auth.uid() 
            OR auth.uid() = ANY(ARRAY(SELECT UNNEST(p.project_members)))
        )
    )
);

DROP POLICY IF EXISTS "Enable insert for project members" ON public.project_files;
CREATE POLICY "Enable insert for project members"
ON public.project_files FOR INSERT
TO authenticated
WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.created_by = auth.uid() 
            OR auth.uid() = ANY(ARRAY(SELECT UNNEST(p.project_members)))
        )
    )
);

DROP POLICY IF EXISTS "Enable delete for file owners" ON public.project_files;
CREATE POLICY "Enable delete for file owners"
ON public.project_files FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Enable read access for project tasks" ON public.project_tasks;
CREATE POLICY "Enable read access for project tasks"
ON public.project_tasks FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.created_by = auth.uid() 
            OR auth.uid() = ANY(ARRAY(SELECT UNNEST(p.project_members)))
        )
    )
);

DROP POLICY IF EXISTS "Enable insert for project members" ON public.project_tasks;
CREATE POLICY "Enable insert for project members"
ON public.project_tasks FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id 
        AND (
            p.created_by = auth.uid() 
            OR auth.uid() = ANY(ARRAY(SELECT UNNEST(p.project_members)))
        )
    )
);

DROP POLICY IF EXISTS "Enable update for task owners and assignees" ON public.project_tasks;
CREATE POLICY "Enable update for task owners and assignees"
ON public.project_tasks FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() 
    OR assigned_to = auth.uid()
);

DROP POLICY IF EXISTS "Enable delete for task owners" ON public.project_tasks;
CREATE POLICY "Enable delete for task owners"
ON public.project_tasks FOR DELETE
TO authenticated
USING (created_by = auth.uid());
