import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260929175000_control_plane_run_event_store.sql",
    import.meta.url,
  ),
);

function migrationSql(): string {
  return readFileSync(migrationPath, "utf8");
}

describe("SG-000040 durable Run/Event database contract", () => {
  it("creates only project-owned Run and Run-event persistence", () => {
    const sql = migrationSql();

    expect(sql).toContain("create table public.ineractive_runs");
    expect(sql).toContain("create table public.ineractive_run_events");
    expect(sql).toContain("references public.ineractive_projects(id) on delete cascade");
    expect(sql).toContain("foreign key (project_id, run_id)");
    expect(sql).not.toMatch(/service_role|generated[_-]app[_-]data/iu);
    expect(sql).toContain("[1-8][0-9a-f]{3}");
    expect(sql).toContain("[a-z][a-z0-9-]{0,31}");
    expect(sql).not.toContain("[1-5][0-9a-f]{3}");
  });

  it("enforces exact lifecycle state changes at the database boundary", () => {
    const sql = migrationSql();

    expect(sql).toContain("ineractive_runs_lifecycle_guard");
    expect(sql).toContain("ineractive_run_must_start_planned");
    expect(sql).toContain("ineractive_run_identity_fields_immutable");
    expect(sql).toContain("ineractive_run_noop_transition");
    expect(sql).toContain("ineractive_run_invalid_transition");
    expect(sql).toContain("old.state = 'PLANNED'");
    expect(sql).toContain("old.state = 'RUNNING'");
  });

  it("enforces zero-based contiguous immutable event history with a per-Run lock", () => {
    const sql = migrationSql();

    expect(sql).toContain("ineractive_run_events_append_guard");
    expect(sql).toContain("where id = new.run_id\n    for update");
    expect(sql).toContain("ineractive_event_sequence_gap");
    expect(sql).toContain("ineractive_event_sequence_regression");
    expect(sql).toContain("unique (run_id, sequence)");
    expect(sql).toContain("ineractive_event_history_immutable");
    expect(sql).toContain("before update on public.ineractive_run_events");
    expect(sql).toContain("before delete on public.ineractive_run_events");
  });

  it("keeps anonymous denied and viewer mutation impossible through RLS/grants", () => {
    const sql = migrationSql();

    for (const table of ["ineractive_runs", "ineractive_run_events"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(`revoke all on table public.${table} from anon, authenticated`);
    }
    expect(sql).toContain(
      "grant select, insert, update on table public.ineractive_runs to authenticated",
    );
    expect(sql).toContain(
      "grant select, insert on table public.ineractive_run_events to authenticated",
    );
    expect(sql).not.toContain(
      "grant delete on table public.ineractive_run_events to authenticated",
    );
    expect(sql).toContain("membership.role = 'editor'");
    expect(sql).toContain('create policy "runs_select_project_member"');
    expect(sql).toContain('create policy "runs_insert_owner_or_editor"');
    expect(sql).toContain('create policy "runs_update_owner_or_editor"');
    expect(sql).toContain('create policy "run_events_select_project_member"');
    expect(sql).toContain('create policy "run_events_insert_owner_or_editor"');
  });
});
