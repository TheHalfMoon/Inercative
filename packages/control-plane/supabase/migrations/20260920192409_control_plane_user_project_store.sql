-- Ineractive control-plane persistence only.
-- Generated-application data planes MUST use independent Supabase project/config/credentials.

create table public.ineractive_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ineractive_profiles_display_name_length
    check (display_name is null or char_length(trim(display_name)) between 1 and 120)
);

create table public.ineractive_projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ineractive_projects_name_length
    check (char_length(trim(name)) between 1 and 120),
  constraint ineractive_projects_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 1 and 80),
  constraint ineractive_projects_owner_slug_unique unique (owner_user_id, slug),
  constraint ineractive_projects_id_owner_unique unique (id, owner_user_id)
);

create table public.ineractive_project_memberships (
  project_id uuid not null,
  project_owner_user_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id),
  constraint ineractive_project_memberships_project_owner_fk
    foreign key (project_id, project_owner_user_id)
    references public.ineractive_projects(id, owner_user_id)
    on delete cascade,
  constraint ineractive_project_memberships_role
    check (role in ('editor', 'viewer')),
  constraint ineractive_project_memberships_not_owner
    check (user_id <> project_owner_user_id)
);

alter table public.ineractive_profiles enable row level security;
alter table public.ineractive_projects enable row level security;
alter table public.ineractive_project_memberships enable row level security;

revoke all on table public.ineractive_profiles from anon, authenticated;
revoke all on table public.ineractive_projects from anon, authenticated;
revoke all on table public.ineractive_project_memberships from anon, authenticated;

grant select, insert, update on table public.ineractive_profiles to authenticated;
grant select, insert, update, delete on table public.ineractive_projects to authenticated;
grant select, insert, update, delete on table public.ineractive_project_memberships to authenticated;

create policy "profiles_select_self"
on public.ineractive_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_self"
on public.ineractive_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_self"
on public.ineractive_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "projects_select_owner_or_member"
on public.ineractive_projects
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or exists (
    select 1
    from public.ineractive_project_memberships membership
    where membership.project_id = ineractive_projects.id
      and membership.user_id = (select auth.uid())
  )
);

create policy "projects_insert_owner"
on public.ineractive_projects
for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

create policy "projects_update_owner"
on public.ineractive_projects
for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

create policy "projects_delete_owner"
on public.ineractive_projects
for delete
to authenticated
using (owner_user_id = (select auth.uid()));

create policy "memberships_select_self_or_owner"
on public.ineractive_project_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or project_owner_user_id = (select auth.uid())
);

create policy "memberships_insert_owner"
on public.ineractive_project_memberships
for insert
to authenticated
with check (project_owner_user_id = (select auth.uid()));

create policy "memberships_update_owner"
on public.ineractive_project_memberships
for update
to authenticated
using (project_owner_user_id = (select auth.uid()))
with check (project_owner_user_id = (select auth.uid()));

create policy "memberships_delete_owner"
on public.ineractive_project_memberships
for delete
to authenticated
using (project_owner_user_id = (select auth.uid()));
