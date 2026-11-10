-- ============================================================
-- CampusCare – University Complaint Portal
-- Complete Database Schema, Functions, Triggers & RLS Policies
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  student_id text unique,
  email text not null,
  phone text,
  course text,
  year text,
  role text not null default 'student' check (role in ('student', 'admin')),
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. COMPLAINT ID GENERATOR SEQUENCE & FUNCTION
create sequence if not exists public.complaint_seq start 101;

create or replace function public.generate_complaint_id()
returns text as $$
begin
  return 'CMP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.complaint_seq')::text, 5, '0');
end;
$$ language plpgsql;

-- 3. COMPLAINTS TABLE
create table if not exists public.complaints (
  id uuid default gen_random_uuid() primary key,
  complaint_id text unique not null default public.generate_complaint_id(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  student_name text,
  title text not null,
  category text not null,
  location text,
  description text not null,
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Resolved')),
  assigned_department text,
  resolution_message text,
  notes jsonb default '[]'::jsonb,
  timeline jsonb default '[]'::jsonb,
  feedback jsonb,
  contact text,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure optional columns exist if migrating from earlier schema
alter table public.complaints add column if not exists image text;
alter table public.complaints add column if not exists feedback jsonb;
alter table public.complaints add column if not exists resolution_message text;
alter table public.complaints add column if not exists notes jsonb default '[]'::jsonb;
alter table public.complaints add column if not exists timeline jsonb default '[]'::jsonb;

-- 4. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'info',
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- 5. DEPARTMENTS TABLE
create table if not exists public.departments (
  id text primary key,
  name text unique not null,
  icon text not null default 'fa-building',
  head text,
  email text,
  created_at timestamptz default now()
);

-- Seed initial campus departments if empty
insert into public.departments (id, name, icon, head, email)
values
  ('DEPT01', 'Hostel Management', 'fa-building', 'Mr. Rajesh Singh', 'hostel@university.edu'),
  ('DEPT02', 'Maintenance', 'fa-wrench', 'Mr. Sunil Yadav', 'maintenance@university.edu'),
  ('DEPT03', 'IT Department', 'fa-laptop-code', 'Ms. Kavita Nair', 'it@university.edu'),
  ('DEPT04', 'Administration', 'fa-landmark', 'Dr. Meera Joshi', 'admin-dept@university.edu'),
  ('DEPT05', 'Security', 'fa-shield-halved', 'Mr. Vikram Rathore', 'security@university.edu'),
  ('DEPT06', 'Transport', 'fa-bus', 'Mr. Prakash Gupta', 'transport@university.edu'),
  ('DEPT07', 'Canteen', 'fa-utensils', 'Mrs. Lakshmi Devi', 'canteen@university.edu'),
  ('DEPT08', 'Academic Department', 'fa-graduation-cap', 'Prof. Anil Mehta', 'academic@university.edu')
on conflict (id) do nothing;

-- ============================================================
-- HELPER & SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Function: Check if user is an admin (bypasses RLS recursion)
create or replace function public.is_admin(user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql;

-- Function: Check student_id uniqueness safely before registration
create or replace function public.check_student_id_exists(check_id text)
returns boolean security definer as $$
begin
  if check_id is null or trim(check_id) = '' then
    return false;
  end if;
  return exists (
    select 1 from public.profiles where student_id = trim(check_id)
  );
end;
$$ language plpgsql;

grant execute on function public.check_student_id_exists(text) to anon, authenticated;

-- Function: Get aggregated platform stats for landing page without exposing rows
create or replace function public.get_platform_stats()
returns jsonb security definer as $$
declare
  total_count int;
  pending_count int;
  in_progress_count int;
  resolved_count int;
  student_count int;
begin
  select count(*) into total_count from public.complaints;
  select count(*) into pending_count from public.complaints where status = 'Pending';
  select count(*) into in_progress_count from public.complaints where status = 'In Progress';
  select count(*) into resolved_count from public.complaints where status = 'Resolved';
  select count(*) into student_count from public.profiles where role = 'student';

  return jsonb_build_object(
    'total', coalesce(total_count, 0),
    'pending', coalesce(pending_count, 0),
    'inProgress', coalesce(in_progress_count, 0),
    'resolved', coalesce(resolved_count, 0),
    'studentCount', coalesce(student_count, 0)
  );
end;
$$ language plpgsql;

grant execute on function public.get_platform_stats() to anon, authenticated;

-- Function: Promote a user to admin by email (run by project owner in SQL Editor)
create or replace function public.make_user_admin(target_email text)
returns text as $$
declare
  updated_count int;
begin
  update public.profiles set role = 'admin' where email = target_email;
  get diagnostics updated_count = row_count;
  if updated_count > 0 then
    return 'User ' || target_email || ' promoted to admin successfully.';
  else
    return 'No profile found for email: ' || target_email;
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.notifications enable row level security;
alter table public.departments enable row level security;

-- ── PROFILES POLICIES ───────────────────────────────────────
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger: Prevent students from escalating their role to admin
create or replace function public.prevent_profile_role_update()
returns trigger as $$
begin
  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception 'Permission denied: Students cannot alter account role.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_prevent_profile_role_update on public.profiles;
create trigger tr_prevent_profile_role_update
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_update();

-- ── COMPLAINTS POLICIES ─────────────────────────────────────
drop policy if exists "Students and Admins can view complaints" on public.complaints;
create policy "Students and Admins can view complaints"
  on public.complaints for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Students can insert own complaints" on public.complaints;
create policy "Students can insert own complaints"
  on public.complaints for insert
  with check (user_id = auth.uid());

drop policy if exists "Admins can update complaints" on public.complaints;
create policy "Admins can update complaints"
  on public.complaints for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Students can update own complaints" on public.complaints;
create policy "Students can update own complaints"
  on public.complaints for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Admins can delete complaints" on public.complaints;
create policy "Admins can delete complaints"
  on public.complaints for delete
  using (public.is_admin(auth.uid()));

-- Trigger: Enforce complaint field modification restrictions
create or replace function public.enforce_complaint_update_permissions()
returns trigger as $$
begin
  -- Admins can update any field
  if public.is_admin(auth.uid()) then
    new.updated_at = now();
    return new;
  end if;

  -- Non-admins must be the complaint creator
  if old.user_id <> auth.uid() then
    raise exception 'Permission denied: Cannot modify another student complaint.';
  end if;

  -- Students cannot modify restricted administrative fields
  if new.status is distinct from old.status then
    raise exception 'Permission denied: Students cannot update complaint status.';
  end if;

  if new.assigned_department is distinct from old.assigned_department then
    raise exception 'Permission denied: Students cannot update assigned department.';
  end if;

  if new.priority is distinct from old.priority then
    raise exception 'Permission denied: Students cannot update complaint priority.';
  end if;

  if new.resolution_message is distinct from old.resolution_message then
    raise exception 'Permission denied: Students cannot alter resolution message.';
  end if;

  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_enforce_complaint_update_permissions on public.complaints;
create trigger tr_enforce_complaint_update_permissions
  before update on public.complaints
  for each row execute procedure public.enforce_complaint_update_permissions();

-- ── NOTIFICATIONS POLICIES ──────────────────────────────────
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can insert notifications" on public.notifications;
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ── DEPARTMENTS POLICIES ────────────────────────────────────
drop policy if exists "Everyone can view departments" on public.departments;
create policy "Everyone can view departments"
  on public.departments for select
  using (true);

drop policy if exists "Admins can manage departments" on public.departments;
create policy "Admins can manage departments"
  on public.departments for all
  using (public.is_admin(auth.uid()));

-- ============================================================
-- AUTH SIGNUP TRIGGER (Automatically create user profile)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, student_id, email, phone, course, year, role, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'student_id', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'course', ''),
    coalesce(new.raw_user_meta_data->>'year', ''),
    'student',
    upper(substring(coalesce(new.raw_user_meta_data->>'full_name', new.email) from 1 for 2))
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    student_id = coalesce(excluded.student_id, public.profiles.student_id),
    email = excluded.email,
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone),
    course = coalesce(nullif(excluded.course, ''), public.profiles.course),
    year = coalesce(nullif(excluded.year, ''), public.profiles.year),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
