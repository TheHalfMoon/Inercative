import { describe, expect, it } from "vitest";

import {
  formatLogicalIdentity,
  parseExactRevision,
  type ExactRevision,
  type RunRecord,
} from "@ineractive/protocol";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseRunStore } from "./run-store.ts";

const PROJECT_ID = "55555555-5555-4555-8555-555555555555";
const RUN_A = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789601");
const RUN_B = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789602");
const TARGET_ID = formatLogicalIdentity(
  "productrevision",
  "018f9f3a-7b2a-7f11-8a4c-123456789603",
);

function exactRevision(value: string): ExactRevision {
  const parsed = parseExactRevision(value);
  if (parsed === null) throw new Error("Test fixture revision must be an exact revision.");
  return parsed.value;
}

const TARGET_REVISION = exactRevision(`sha256:${"a".repeat(64)}`);

type FakeError = {
  readonly code: string;
  readonly message: string;
  readonly details: string | null;
  readonly hint: string | null;
};

type FakeResponse = {
  readonly data: unknown;
  readonly error: FakeError | null;
};

function run(
  id = RUN_A,
  state: RunRecord["state"] = "PLANNED",
  parentRunId: RunRecord["parentRunId"] = null,
): RunRecord {
  return {
    schemaVersion: 1,
    id,
    target: { identity: TARGET_ID, revision: TARGET_REVISION },
    state,
    parentRunId,
  };
}

function row(value: RunRecord) {
  return {
    id: value.id,
    target_identity: value.target.identity,
    target_revision: value.target.revision,
    state: value.state,
    parent_run_id: value.parentRunId,
  };
}

function fakeClient(options?: {
  readonly reads?: readonly FakeResponse[];
  readonly inserts?: readonly FakeResponse[];
  readonly updates?: readonly FakeResponse[];
}) {
  const reads = [...(options?.reads ?? [])];
  const inserts = [...(options?.inserts ?? [])];
  const updates = [...(options?.updates ?? [])];
  const inserted: unknown[] = [];
  const updated: unknown[] = [];
  const readFilters: Array<readonly [string, unknown]> = [];
  const updateFilters: Array<readonly [string, unknown]> = [];

  const client = {
    from(table: string) {
      expect(table).toBe("ineractive_runs");
      return {
        select() {
          const builder = {
            eq(column: string, value: unknown) {
              readFilters.push([column, value]);
              return builder;
            },
            maybeSingle() {
              return Promise.resolve(reads.shift() ?? { data: null, error: null });
            },
          };
          return builder;
        },
        insert(value: unknown) {
          inserted.push(value);
          return {
            select() {
              return {
                single() {
                  return Promise.resolve(inserts.shift() ?? { data: null, error: null });
                },
              };
            },
          };
        },
        update(value: unknown) {
          updated.push(value);
          const builder = {
            eq(column: string, filterValue: unknown) {
              updateFilters.push([column, filterValue]);
              return builder;
            },
            select() {
              return {
                maybeSingle() {
                  return Promise.resolve(updates.shift() ?? { data: null, error: null });
                },
              };
            },
          };
          return builder;
        },
      };
    },
  } as unknown as SupabaseClient;

  return {
    client,
    snapshot: () => ({ inserted, updated, readFilters, updateFilters }),
  };
}

describe("SupabaseRunStore core", () => {
  it("creates a validated root Run and returns an immutable round trip", async () => {
    const input = run();
    const fake = fakeClient({ inserts: [{ data: row(input), error: null }] });
    const store = new SupabaseRunStore(fake.client, PROJECT_ID);

    const result = await store.createRoot(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.run).toEqual(input);
      expect(Object.isFrozen(result.run)).toBe(true);
      expect(Object.isFrozen(result.run.target)).toBe(true);
    }
    expect(fake.snapshot().inserted).toEqual([
      {
        id: RUN_A,
        project_id: PROJECT_ID,
        target_identity: TARGET_ID,
        target_revision: TARGET_REVISION,
        state: "PLANNED",
        parent_run_id: null,
      },
    ]);
  });

  it("rejects invalid or non-root creation before touching storage", async () => {
    const fake = fakeClient();
    const store = new SupabaseRunStore(fake.client, PROJECT_ID);

    const invalid = await store.createRoot({ schemaVersion: 1, id: RUN_A });
    const nonRoot = await store.createRoot(run(RUN_B, "RUNNING", RUN_A));

    expect(invalid.ok ? null : invalid.issues[0]?.code).toBe("INVALID_RUN_RECORD");
    expect(nonRoot.ok ? null : nonRoot.issues[0]?.code).toBe("INVALID_ROOT_RUN");
    expect(fake.snapshot().inserted).toEqual([]);
  });

  it("applies canonical lifecycle validation before an optimistic state update", async () => {
    const planned = run(RUN_A, "PLANNED");
    const running = run(RUN_A, "RUNNING");
    const fake = fakeClient({
      reads: [{ data: row(planned), error: null }],
      updates: [{ data: row(running), error: null }],
    });
    const store = new SupabaseRunStore(fake.client, PROJECT_ID);

    const result = await store.transition(RUN_A, "RUNNING");

    expect(result.ok && result.run.state).toBe("RUNNING");
    expect(fake.snapshot().updated).toEqual([{ state: "RUNNING" }]);
    expect(fake.snapshot().updateFilters).toEqual([
      ["project_id", PROJECT_ID],
      ["id", RUN_A],
      ["state", "PLANNED"],
    ]);
  });

  it("validates continuation semantics against the durable parent before child insertion", async () => {
    const parent = run(RUN_A, "BLOCKED");
    const child = run(RUN_B, "PLANNED", RUN_A);
    const fake = fakeClient({
      reads: [{ data: row(parent), error: null }],
      inserts: [{ data: row(child), error: null }],
    });
    const store = new SupabaseRunStore(fake.client, PROJECT_ID);

    const result = await store.continue(RUN_A, child);

    expect(result.ok && result.run).toEqual(child);
    expect(fake.snapshot().inserted[0]).toMatchObject({
      id: RUN_B,
      project_id: PROJECT_ID,
      parent_run_id: RUN_A,
      state: "PLANNED",
    });
  });
});
