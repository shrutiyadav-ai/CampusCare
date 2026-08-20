-- profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  student_id text unique,
  email text not null,
  phone text,
  course text,
  year text,
  role text not null default 'student',
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- complaints table
create table public.complaints (
  id uuid default gen_random_uuid() primary key,
  complaint_id text unique not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  student_name text,
  title text not null,
  category text not null,
  location text,
  description text not null,
  priority text default 'Medium',
  status text default 'Pending',
  assigned_department text,
  resolution_message text,
  notes jsonb default '[]',
  timeline jsonb default '[]',
  feedback jsonb,
  contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;

-- Security Definer function to check admin status (bypasses RLS recursion)
create or replace function public.is_admin(user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql;

-- RLS Policies: profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- RLS Policies: complaints
create policy "Students and Admins can view complaints"
  on public.complaints for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "Students can insert own complaints"
  on public.complaints for insert with check (user_id = auth.uid());

create policy "Admins can update any complaint"
  on public.complaints for update using (public.is_admin(auth.uid()));
