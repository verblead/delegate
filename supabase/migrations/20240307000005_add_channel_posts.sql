-- Create channels table
create table if not exists public.channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  is_private boolean default false,
  avatar_url text,
  created_by uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create channel_members table
create table if not exists public.channel_members (
  id uuid default uuid_generate_v4() primary key,
  channel_id uuid references public.channels on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(channel_id, user_id)
);

-- Create channel_posts table
create table if not exists public.channel_posts (
  id uuid default uuid_generate_v4() primary key,
  channel_id uuid references public.channels on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  content text,
  has_attachments boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sender_id uuid references public.profiles(id) not null,
  constraint fk_sender_id_user_id check (sender_id = user_id)
);

-- Create post_attachments table
create table if not exists public.post_attachments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.channel_posts on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create post_likes table
create table if not exists public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.channel_posts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- Create post_comments table
create table if not exists public.post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.channel_posts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.channel_posts enable row level security;
alter table public.post_attachments enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

-- Create policies for channels
create policy "Users can view public channels and private channels they are members of"
  on public.channels for select
  using (
    (not is_private) or 
    exists (
      select 1 from public.channel_members cm 
      where cm.channel_id = channels.id 
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can create channels"
  on public.channels for insert
  with check (auth.uid() = created_by);

create policy "Only creator can update channel"
  on public.channels for update
  using (auth.uid() = created_by);

create policy "Only creator can delete channel"
  on public.channels for delete
  using (auth.uid() = created_by);

-- Create policies for channel_members
create policy "Users can view channel members"
  on public.channel_members for select
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_members.channel_id
      and (
        not c.is_private or 
        exists (
          select 1 from public.channel_members cm
          where cm.channel_id = c.id
          and cm.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can join public channels"
  on public.channel_members for insert
  with check (
    exists (
      select 1 from public.channels c
      where c.id = channel_members.channel_id
      and not c.is_private
    )
    and auth.uid() = user_id
  );

create policy "Channel creator can manage members"
  on public.channel_members for insert
  with check (
    exists (
      select 1 from public.channels c
      where c.id = channel_members.channel_id
      and c.created_by = auth.uid()
    )
  );

create policy "Channel creator can remove members"
  on public.channel_members for delete
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_members.channel_id
      and c.created_by = auth.uid()
    )
  );

create policy "Users can leave channels"
  on public.channel_members for delete
  using (user_id = auth.uid());

-- Create policies for channel_posts
create policy "Users can view posts in channels they are members of"
  on public.channel_posts for select
  using (
    exists (
      select 1 from public.channel_members cm
      where cm.channel_id = channel_posts.channel_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can create posts in channels they are members of"
  on public.channel_posts for insert
  with check (
    exists (
      select 1 from public.channel_members cm
      where cm.channel_id = channel_posts.channel_id
      and cm.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

create policy "Users can update their own posts"
  on public.channel_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.channel_posts for delete
  using (auth.uid() = user_id);

-- Create policies for post_attachments
create policy "Users can view attachments of posts they can see"
  on public.post_attachments for select
  using (
    exists (
      select 1 from public.channel_posts cp
      join public.channel_members cm on cm.channel_id = cp.channel_id
      where cp.id = post_attachments.post_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can create attachments for their posts"
  on public.post_attachments for insert
  with check (
    exists (
      select 1 from public.channel_posts cp
      where cp.id = post_attachments.post_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can delete attachments from their posts"
  on public.post_attachments for delete
  using (
    exists (
      select 1 from public.channel_posts cp
      where cp.id = post_attachments.post_id
      and cp.user_id = auth.uid()
    )
  );

-- Policies for post_likes
create policy "Users can view likes on posts they can see"
  on public.post_likes for select
  using (
    exists (
      select 1 from public.channel_posts cp
      join public.channel_members cm on cm.channel_id = cp.channel_id
      where cp.id = post_likes.post_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can like posts they can see"
  on public.post_likes for insert
  with check (
    exists (
      select 1 from public.channel_posts cp
      join public.channel_members cm on cm.channel_id = cp.channel_id
      where cp.id = post_likes.post_id
      and cm.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

create policy "Users can unlike their likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- Policies for post_comments
create policy "Users can view comments on posts they can see"
  on public.post_comments for select
  using (
    exists (
      select 1 from public.channel_posts cp
      join public.channel_members cm on cm.channel_id = cp.channel_id
      where cp.id = post_comments.post_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can comment on posts they can see"
  on public.post_comments for insert
  with check (
    exists (
      select 1 from public.channel_posts cp
      join public.channel_members cm on cm.channel_id = cp.channel_id
      where cp.id = post_comments.post_id
      and cm.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

create policy "Users can update their own comments"
  on public.post_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.post_comments for delete
  using (auth.uid() = user_id);

-- Create foreign key relationships for counts
alter table public.post_likes add constraint fk_post_likes_post
  foreign key (post_id) references public.channel_posts(id)
  on delete cascade;

alter table public.post_comments add constraint fk_post_comments_post
  foreign key (post_id) references public.channel_posts(id)
  on delete cascade;

-- Create views for post counts
create or replace view post_likes_count as
  select post_id, count(*) as count
  from public.post_likes
  group by post_id;

create or replace view post_comments_count as
  select post_id, count(*) as count
  from public.post_comments
  group by post_id;
