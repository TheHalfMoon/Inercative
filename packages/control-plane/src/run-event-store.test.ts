import { describe, expect, it } from "vitest";

import { formatLogicalIdentity } from "@ineractive/protocol";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseRunEventStore } from "./run-event-store.ts";

const PROJECT_ID = "55555555-5555-4555-8555-555555555555";
const RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789501");
const SOURCE_ID = formatLogicalIdentity("tool", "018f9f3a-7b2a-7f11-8a4c-123456789502");
const TARGET_ID = formatLogicalIdentity(
  "productrevision",
  "018f9f3a-7b2a-7f11-8a4c-123456789503",
);
const TARGET_REVISION = `sha256:${"a".repeat(64)}`;

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

function event(sequence = 0, suffix = "000000000504") {
  return {
    schemaVersion: 1 as const,
    id: formatLogicalIdentity("event", `018f9f3a-7b2a-7f11-8a4c-${suffix}`),
    runId: RUN_ID,
    sequence,
    kind: "tool.observed",
    source: SOURCE_ID,
    target: { identity: TARGET_ID, revision: TARGET_REVISION },
    references: [`artifact:${suffix}`],
  };
}

function row(sequence = 0, suffix = "000000000504") {
  const input = event(sequence, suffix);
  return {
    id: input.id,
    run_id: input.runId,
    sequence: input.sequence,
    kind: input.kind,
    source: input.source,
    target_identity: input.target.identity,
    target_revision: input.target.revision,
    references_json: [...input.references],
  };
}

function failure(code: string, message: string): FakeError {
  return { code, message, details: null, hint: null };
}

function fakeClient(insertResponse: FakeResponse, readResponse: FakeResponse) {
  let fromCalls = 0;
  let inserted: unknown = null;
  const filters: Array<readonly [string, unknown]> = [];
  let order: readonly [string, { readonly ascending: boolean }] | null = null;

  const client = {
    from(table: string) {
      fromCalls += 1;
      expect(table).toBe("ineractive_run_events");
      return {
        insert(value: unknown) {
          inserted = value;
          return {
            select() {
              return {
                async single() {
                  return insertResponse;
                },
              };
            },
          };
        },
        select() {
          const builder = {
            eq(column: string, value: unknown) {
              filters.push([column, value]);
              return builder;
            },
            async order(column: string, options: { readonly ascending: boolean }) {
              order = [column, options];
              return readResponse;
            },
          };
          return builder;
        },
      };
    },
  } as unknown as SupabaseClient;

  return {
    client,
    snapshot: () => ({ fromCalls, inserted, filters: [...filters], order }),
  };
}

describe("SupabaseRunEventStore", () => {
  it("validates and persists an Event through the project-scoped durable row shape", async () => {
    const expected = event();
    const fake = fakeClient({ data: row(), error: null }, { data: [], error: null });
    const store = new SupabaseRunEventStore(fake.client, PROJECT_ID);

    const result = await store.append(expected);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event).toEqual(expected);
      expect(Object.isFrozen(result.event)).toBe(true);
      expect(Object.isFrozen(result.event.target)).toBe(true);
      expect(Object.isFrozen(result.event.references)).toBe(true);
    }
    expect(fake.snapshot().inserted).toEqual({
      id: expected.id,
      project_id: PROJECT_ID,
      run_id: RUN_ID,
      sequence: 0,
      kind: "tool.observed",
      source: SOURCE_ID,
      target_identity: TARGET_ID,
      target_revision: TARGET_REVISION,
      references_json: expected.references,
    });
  });

  it("rejects invalid EventRecord input before touching storage", async () => {
    const fake = fakeClient({ data: null, error: null }, { data: [], error: null });
    const store = new SupabaseRunEventStore(fake.client, PROJECT_ID);

    const result = await store.append({ schemaVersion: 1, runId: RUN_ID });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.every((item) => item.code === "INVALID_EVENT_RECORD")).toBe(true);
    expect(fake.snapshot().fromCalls).toBe(0);
  });

  it("maps durable sequence admission failures to stable EventStore issue codes", async () => {
    const gap = fakeClient(
      { data: null, error: failure("P0001", "ineractive_event_sequence_gap") },
      { data: [], error: null },
    );
    const regression = fakeClient(
      { data: null, error: failure("P0001", "ineractive_event_sequence_regression") },
      { data: [], error: null },
    );

    const gapResult = await new SupabaseRunEventStore(gap.client, PROJECT_ID).append(event());
    const regressionResult = await new SupabaseRunEventStore(regression.client, PROJECT_ID).append(
      event(),
    );

    expect(gapResult.ok ? [] : gapResult.issues.map((item) => item.code)).toEqual([
      "SEQUENCE_GAP",
    ]);
    expect(regressionResult.ok ? [] : regressionResult.issues.map((item) => item.code)).toEqual([
      "DUPLICATE_SEQUENCE",
      "SEQUENCE_REGRESSION",
    ]);
  });

  it("maps duplicate durable identities without exposing vendor error details", async () => {
    const fake = fakeClient(
      {
        data: null,
        error: failure(
          "23505",
          'duplicate key value violates unique constraint "ineractive_run_events_pkey"',
        ),
      },
      { data: [], error: null },
    );
    const result = await new SupabaseRunEventStore(fake.client, PROJECT_ID).append(event());

    expect(result).toEqual({
      ok: false,
      issues: [
        {
          code: "DUPLICATE_EVENT_ID",
          path: "$.id",
          message: "Durable EventStore rejected a duplicate Event identity.",
        },
      ],
    });
  });

  it("reads deterministic project-scoped history and returns immutable validated records", async () => {
    const fake = fakeClient(
      { data: row(), error: null },
      { data: [row(0, "000000000505"), row(1, "000000000506")], error: null },
    );
    const store = new SupabaseRunEventStore(fake.client, PROJECT_ID);

    const result = await store.read(RUN_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.events.map((item) => item.sequence)).toEqual([0, 1]);
      expect(Object.isFrozen(result.events)).toBe(true);
      expect(result.events.every((item) => Object.isFrozen(item))).toBe(true);
    }
    expect(fake.snapshot().filters).toEqual([
      ["project_id", PROJECT_ID],
      ["run_id", RUN_ID],
    ]);
    expect(fake.snapshot().order).toEqual(["sequence", { ascending: true }]);
  });

  it("fails closed when durable history is malformed or non-contiguous", async () => {
    const malformed = fakeClient(
      { data: row(), error: null },
      { data: [{ ...row(), references_json: "not-an-array" }], error: null },
    );
    const gapped = fakeClient(
      { data: row(), error: null },
      { data: [row(1, "000000000507")], error: null },
    );

    const malformedResult = await new SupabaseRunEventStore(malformed.client, PROJECT_ID).read(RUN_ID);
    const gappedResult = await new SupabaseRunEventStore(gapped.client, PROJECT_ID).read(RUN_ID);

    expect(malformedResult.ok ? null : malformedResult.issues[0]?.code).toBe("STORAGE_CORRUPTION");
    expect(gappedResult.ok ? null : gappedResult.issues[0]?.code).toBe("STORAGE_CORRUPTION");
  });

  it("rejects invalid project and Run identities and maps read outages generically", async () => {
    const fake = fakeClient(
      { data: row(), error: null },
      { data: null, error: failure("08006", "provider-specific connection detail") },
    );

    expect(() => new SupabaseRunEventStore(fake.client, "not-a-project-id")).toThrow(/projectId/u);

    const store = new SupabaseRunEventStore(fake.client, PROJECT_ID);
    const invalidRun = await store.read(SOURCE_ID);
    const unavailable = await store.read(RUN_ID);

    expect(invalidRun.ok ? null : invalidRun.issues[0]?.code).toBe("INVALID_RUN_ID");
    expect(unavailable).toEqual({
      ok: false,
      issues: [
        {
          code: "STORE_UNAVAILABLE",
          path: "$",
          message: "Durable EventStore could not read Run history.",
        },
      ],
    });
  });
});
