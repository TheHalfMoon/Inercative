-- SG-000040 / IN-P03-S01-T01C
-- Durable Run/Event persistence in the existing Ineractive control-plane trust domain only.
-- Generated-application data planes and privileged/service-role credentials are out of scope.

create table public.ineractive_runs (
  id text primary key,
  project_id uuid not null references public.ineractive_projects(id) on delete cascade,
  target_identity text not null,
  target_revision text not null,
  state text not null,
  parent_run_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ineractive_runs_project_id_id_unique unique (project_id, id),
  constraint ineractive_runs_id_format
    check (id ~ '^ineractive:run:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  constraint ineractive_runs_target_identity_format
    check (target_identity ~ '^ineractive:[a-z][a-z0-9-]{0,31}:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  constraint ineractive_runs_target_revision_format
    check (target_revision ~ '^(?:git:[0-9a-f]{40}|git:[0-9a-f]{64}|sha256:[0-9a-f]{64})$'),
  constraint ineractive_runs_state
    check (state in ('PLANNED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'BLOCKED')),
  constraint ineractive_runs_initial_state check (state = 'PLANNED'),
  constraint ineractive_runs_parent_not_self check (parent_run_id is null or parent_run_id <> id),
  constraint ineractive_runs_parent_format
    check (
      parent_run_id is null
      or parent_run_id ~ '^ineractive:run:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ),
  constraint ineractive_runs_parent_fk
    foreign key (project_id, parent_run_id)
    references public.ineractive_runs(project_id, id)
);

-- Replace the insert-only initial-state CHECK with trigger-enforced creation semantics so
-- later legal transitions can update the row without weakening the initial-state invariant.
alter table public.ineractive_runs drop constraint ineractive_runs_initial_state;

create table public.ineractive_run_events (
  id text primary key,
  project_id uuid not null,
  run_id text not null,
  sequence bigint not null,
  kind text not null,
  source text not null,
  target_identity text,
  target_revision text,
  references_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint ineractive_run_events_project_run_fk
    foreign key (project_id, run_id)
    references public.ineractive_runs(project_id, id)
    on delete cascade,
  constraint ineractive_run_events_run_sequence_unique unique (run_id, sequence),
  constraint ineractive_run_events_id_format
    check (id ~ '^ineractive:event:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  constraint ineractive_run_events_run_id_format
    check (run_id ~ '^ineractive:run:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  constraint ineractive_run_events_sequence_nonnegative check (sequence >= 0),
  constraint ineractive_run_events_kind_format
    check (kind ~ '^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$' and char_length(kind) <= 128),
  constraint ineractive_run_events_source_format
    check (source ~ '^ineractive:[a-z][a-z0-9-]{0,31}:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  constraint ineractive_run_events_target_pair
    check ((target_identity is null) = (target_revision is null)),
  constraint ineractive_run_events_target_identity_format
    check (
      target_identity is null
      or target_identity ~ '^ineractive:[a-z][a-z0-9-]{0,31}:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ),
  constraint ineractive_run_events_target_revision_format
    check (
      target_revision is null
      or target_revision ~ '^(?:git:[0-9a-f]{40}|git:[0-9a-f]{64}|sha256:[0-9a-f]{64})$'
    ),
  constraint ineractive_run_events_references_array check (jsonb_typeof(references_json) = 'array')
);

create or replace function public.ineractive_enforce_run_lifecycle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.state <> 'PLANNED' then
      raise exception using errcode = 'P0001', message = 'ineractive_run_must_start_planned';
    end if;
    return new;
  end if;

  if new.id <> old.id
     or new.project_id <> old.project_id
     or new.target_identity <> old.target_identity
     or new.target_revision <> old.target_revision
     or new.parent_run_id is distinct from old.parent_run_id then
    raise exception using errcode = 'P0001', message = 'ineractive_run_identity_fields_immutable';
  end if;

  if new.state = old.state then
    raise exception using errcode = 'P0001', message = 'ineractive_run_noop_transition';
  end if;

  if not (
    (old.state = 'PLANNED' and new.state in ('RUNNING', 'CANCELLED', 'BLOCKED'))
    or (old.state = 'RUNNING' and new.state in ('COMPLETED', 'FAILED', 'CANCELLED', 'BLOCKED'))
  ) then
    raise exception using errcode = 'P0001', message = 'ineractive_run_invalid_transition';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger ineractive_runs_lifecycle_guard
before insert or update on public.ineractive_runs
for each row execute function public.ineractive_enforce_run_lifecycle();

create or replace function public.ineractive_enforce_event_append()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  run_project_id uuid;
  expected_sequence bigint;
begin
  select project_id
    into run_project_id
    from public.ineractive_runs
    where id = new.run_id
    for update;

  if run_project_id is null then
    raise exception using errcode = '23503', message = 'ineractive_event_unknown_run';
  end if;

  if new.project_id is not null and new.project_id <> run_project_id then
    raise exception using errcode = 'P0001', message = 'ineractive_event_cross_project_binding';
  end if;
  new.project_id := run_project_id;

  select count(*)::bigint
    into expected_sequence
    from public.ineractive_run_events
    where run_id = new.run_id;

  if new.sequence > expected_sequence then
    raise exception using errcode = 'P0001', message = 'ineractive_event_sequence_gap';
  end if;
  if new.sequence < expected_sequence then
    raise exception using errcode = 'P0001', message = 'ineractive_event_sequence_regression';
  end if;

  return new;
end;
$$;

create trigger ineractive_run_events_append_guard
before insert on public.ineractive_run_events
for each row execute function public.ineractive_enforce_event_append();

create or replace function public.ineractive_reject_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception using errcode = 'P0001', message = 'ineractive_event_history_immutable';
end;
$$;

create trigger ineractive_run_events_update_guard
before update on public.ineractive_run_events
for each row execute function public.ineractive_reject_event_mutation();

create trigger ineractive_run_events_delete_guard
before delete on public.ineractive_run_events
for each row execute function public.ineractive_reject_event_mutation();

alter table public.ineractive_runs enable row level security;
alter table public.ineractive_run_events enable row level security;

revoke all on table public.ineractive_runs from anon, authenticated;
revoke all on table public.ineractive_run_events from anon, authenticated;

grant select, insert, update on table public.ineractive_runs to authenticated;
grant select, insert on table public.ineractive_run_events to authenticated;

create policy "runs_select_project_member"
on public.ineractive_runs
for select
to authenticated
using (
  exists (
    select 1
    from public.ineractive_projects project
    where project.id = ineractive_runs.project_id
      and (
        project.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.ineractive_project_memberships membership
          where membership.project_id = project.id
            and membership.user_id = (select auth.uid())
        )
      )
  )
);

create policy "runs_insert_owner_or_editor"
on public.ineractive_runs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ineractive_projects project
    where project.id = ineractive_runs.project_id
      and (
        project.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.ineractive_project_memberships membership
          where membership.project_id = project.id
            and membership.user_id = (select auth.uid())
            and membership.role = 'editor'
        )
      )
  )
);

create policy "runs_update_owner_or_editor"
on public.ineractive_runs
for update
to authenticated
using (
  exists (
    select 1
    from public.ineractive_projects project
    where project.id = ineractive_runs.project_id
      and (
        project.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.ineractive_project_memberships membership
          where membership.project_id = project.id
            and membership.user_id = (select auth.uid())
            and membership.role = 'editor'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.ineractive_projects project
    where project.id = ineractive_runs.project_id
      and (
        project.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.ineractive_project_memberships membership
          where membership.project_id = project.id
            and membership.user_id = (select auth.uid())
            and membership.role = 'editor'
        )
      )
  )
);

create policy "run_events_select_project_member"
on public.ineractive_run_events
for select
to authenticated
using (
  exists (
    select 1
    from public.ineractive_projects project
    where project.id = ineractive_run_events.project_id
      and (
        project.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.ineractive_project_memberships membership
          where membership.project_id = project.id
            and membership.user_id = (select auth.uid())
        )
      )
  )
);

create policy "run_events_insert_owner_or_editor"
on public.ineractive_run_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ineractive_projects project
    where project.id = ineractive_run_events.project_id
      and (
        project.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.ineractive_project_memberships membership
          where membership.project_id = project.id
            and membership.user_id = (select auth.uid())
            and membership.role = 'editor'
        )
      )
  )
);
