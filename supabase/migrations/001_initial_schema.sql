-- VibeFix Database Schema
-- Supabase Postgres Migration

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default '',
  avatar_url text,
  github_handle text,
  role text not null default 'client' check (role in ('client', 'expert', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role can insert users"
  on public.users for insert
  with check (true);

-- ============================================
-- EXPERT PROFILES
-- ============================================
create table public.expert_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null unique,
  stack_tags text[] not null default '{}',
  bio text,
  hourly_rate integer,
  sessions_completed integer not null default 0,
  satisfaction_score numeric(3,2) not null default 0.00,
  avg_delivery_hours numeric(6,1) not null default 0.0,
  stripe_connect_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expert_profiles enable row level security;

create policy "Experts can view their own profile"
  on public.expert_profiles for select
  using (auth.uid() = user_id);

create policy "Experts can update their own profile"
  on public.expert_profiles for update
  using (auth.uid() = user_id);

create policy "Anyone can view active expert profiles"
  on public.expert_profiles for select
  using (is_active = true);

create policy "Service role can manage expert profiles"
  on public.expert_profiles for all
  with check (true);

-- ============================================
-- SESSIONS
-- ============================================
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.users(id) on delete cascade not null,
  expert_id uuid references public.users(id) on delete set null,
  tier text not null check (tier in ('fix', 'build', 'ship', 'autofix')),
  status text not null default 'pending_payment' check (status in (
    'pending_payment', 'paid', 'matched', 'in_progress',
    'pr_submitted', 'pending_review', 'completed',
    'refund_requested', 'refunded', 'cancelled'
  )),
  repo_url text not null,
  branch text,
  pr_url text,
  goal_description text not null,
  stack_tags text[] not null default '{}',
  audit_report_id uuid,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  expert_payout_cents integer not null default 0,
  platform_fee_cents integer not null default 0,
  deadline_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Clients can view their own sessions"
  on public.sessions for select
  using (auth.uid() = client_id);

create policy "Experts can view their assigned sessions"
  on public.sessions for select
  using (auth.uid() = expert_id);

create policy "Clients can create sessions"
  on public.sessions for insert
  with check (auth.uid() = client_id);

create policy "Admins can view all sessions"
  on public.sessions for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all sessions"
  on public.sessions for update
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

create policy "Service role can manage sessions"
  on public.sessions for all
  with check (true);

-- ============================================
-- AUDIT REPORTS
-- ============================================
create table public.audit_reports (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  stack_detected text[] not null default '{}',
  completion_score integer not null default 0 check (completion_score >= 0 and completion_score <= 100),
  blockers jsonb not null default '[]',
  suggested_fix_plan text not null default '',
  model_version text not null default 'manual-v1',
  created_at timestamptz not null default now()
);

alter table public.audit_reports enable row level security;

create policy "Session participants can view audit reports"
  on public.audit_reports for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = audit_reports.session_id
        and (s.client_id = auth.uid() or s.expert_id = auth.uid())
    )
  );

create policy "Service role can manage audit reports"
  on public.audit_reports for all
  with check (true);

-- ============================================
-- MESSAGES
-- ============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Session participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id
        and (s.client_id = auth.uid() or s.expert_id = auth.uid())
    )
  );

create policy "Session participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.sessions s
      where s.id = messages.session_id
        and (s.client_id = auth.uid() or s.expert_id = auth.uid())
    )
  );

create policy "Admins can view all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- DATASET ENTRIES (Phase 3 moat)
-- ============================================
create table public.dataset_entries (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  repo_snapshot_before text,
  repo_diff text,
  outcome text,
  expert_consented boolean not null default false,
  logged_at timestamptz not null default now()
);

alter table public.dataset_entries enable row level security;

create policy "Only admins can view dataset entries"
  on public.dataset_entries for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- INDEXES
-- ============================================
create index idx_sessions_client_id on public.sessions(client_id);
create index idx_sessions_expert_id on public.sessions(expert_id);
create index idx_sessions_status on public.sessions(status);
create index idx_sessions_tier on public.sessions(tier);
create index idx_messages_session_id on public.messages(session_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_expert_profiles_stack_tags on public.expert_profiles using gin(stack_tags);
create index idx_expert_profiles_is_active on public.expert_profiles(is_active);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger on_sessions_updated
  before update on public.sessions
  for each row execute function public.handle_updated_at();

create trigger on_expert_profiles_updated
  before update on public.expert_profiles
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url, github_handle)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
