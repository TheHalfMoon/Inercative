import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import {
  createVerifiedControlPlaneRunEventStore,
  readControlPlaneSupabaseConfig,
  type ControlPlaneSupabaseConfig,
  type VerifiedControlPlaneActor,
} from "./control-plane-store.ts";
import { SupabaseRunEventStore } from "./run-event-store.ts";

const RUN_ID = "ineractive:run:018f9f3a-7b2a-7f11-8a4c-123456789201";
const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const ACTOR: VerifiedControlPlaneActor = {
  userId: PROJECT_ID,
  accessToken: "signed-user-access-token",
};
const CONFIG: ControlPlaneSupabaseConfig = readControlPlaneSupabaseConfig({
  INERACTIVE_CONTROL_PLANE_SUPABASE_URL: "https://control-plane.example.supabase.co",
  INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_control_plane",
});
const migrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260929175000_control_plane_run_event_store.sql",
    import.meta.url,
  ),
);

function migrationSql(): string {
  return readFileSync(migrationPath, "utf8");
}

function validationOnlyStore(): SupabaseRunEventStore {
  return new SupabaseRunEventStore({} as SupabaseClient);
}

describe("durable Run/Event adapter validation boundary", () => {
  it("rejects invalid inputs before touching the storage client", async () => {
    const store = validationOnlyStore();

    await expect(store.getRun("not-a-run")).resolves.toMatchObject({ ok: false });
    await expect(store.read("not-a-run")).resolves.toMatchObject({ ok: false });
    await expect(store.append({ schemaVersion: 1, runId: RUN_ID })).resolves.toMatchObject({
      ok: false,
    });
    await expect(store.createRun("not-a-project", {})).resolves.toMatchObject({ ok: false });
  });

  it("reuses the verified control-plane client boundary instead of accepting forged config", async () => {
    const forged = {
      scope: "CONTROL_PLANE",
      url: CONFIG.url,
      publishableKey: CONFIG.publishableKey,
    } as unknown as ControlPlaneSupabaseConfig;

    await expect(createVerifiedControlPlaneRunEventStore(forged, ACTOR)).rejects.toThrow(
      /dedicated server parser/u,
    );
  });
});

describe("SG-000040 durable migration contract", () => {
  it("creates only project-owned Run and Run-event tables in the control plane", () => {
    const sql = migrationSql();

    expect(sql).toContain("create table public.ineractive_runs");
    expect(sql).toContain("create table public.ineractive_run_events");
    expect(sql).toContain("references public.ineractive_projects(id) on delete cascade");
    expect(sql).toContain("foreign key (project_id, run_id)");
    expect(sql).not.toMatch(/service_role|generated[_-]app[_-]data/iu);
  });

  it("enforces lifecycle and append ordering at the database boundary", () => {
    const sql = migrationSql();

    expect(sql).toContain("ineractive_runs_lifecycle_guard");
    expect(sql).toContain("ineractive_run_invalid_transition");
    expect(sql).toContain("ineractive_run_events_append_guard");
    expect(sql).toContain("for update");
    expect(sql).toContain("ineractive_event_sequence_gap");
    expect(sql).toContain("ineractive_event_sequence_regression");
    expect(sql).toContain("ineractive_event_history_immutable");
    expect(sql).toContain("unique (run_id, sequence)");
  });

  it("keeps Run/Event access RLS-constrained with viewer read-only semantics", () => {
    const sql = migrationSql();

    for (const table of ["ineractive_runs", "ineractive_run_events"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(`revoke all on table public.${table} from anon, authenticated`);
    }
    expect(sql).toContain("grant select, insert, update on table public.ineractive_runs to authenticated");
    expect(sql).toContain("grant select, insert on table public.ineractive_run_events to authenticated");
    expect(sql).not.toContain(
      "grant select, insert, update, delete on table public.ineractive_run_events to authenticated",
    );
    expect(sql).toContain("membership.role = 'editor'");
    expect(sql).toContain('create policy "runs_select_project_member"');
    expect(sql).toContain('create policy "runs_update_owner_or_editor"');
    expect(sql).toContain('create policy "run_events_insert_owner_or_editor"');
  });
});
