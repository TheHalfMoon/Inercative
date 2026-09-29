import { describe, expect, it } from "vitest";

import {
  formatLogicalIdentity,
  parseExactRevision,
  type EventRecord,
  type ExactRevision,
  type RunRecord,
} from "@ineractive/protocol";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseRunEventStore } from "./run-event-store.ts";
import { SupabaseRunStore } from "./run-store.ts";

const PROJECT_ID = "55555555-5555-4555-8555-555555555555";
const ROOT_RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789701");
const CHILD_RUN_ID = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789702");
const EVENT_ZERO_ID = formatLogicalIdentity("event", "018f9f3a-7b2a-7f11-8a4c-123456789703");
const EVENT_ONE_ID = formatLogicalIdentity("event", "018f9f3a-7b2a-7f11-8a4c-123456789704");
const TARGET_ID = formatLogicalIdentity(
  "productrevision",
  "018f9f3a-7b2a-7f11-8a4c-123456789705",
);
const SOURCE_ID = formatLogicalIdentity("agent", "018f9f3a-7b2a-7f11-8a4c-123456789706");

function exactRevision(value: string): ExactRevision {
  const parsed = parseExactRevision(value);
  if (parsed === null) throw new Error("Fixture revision must be exact.");
  return parsed.value;
}

const TARGET_REVISION = exactRevision(`sha256:${"c".repeat(64)}`);

interface RunRow {
  readonly id: string;
  readonly project_id: string;
  readonly target_identity: string;
  readonly target_revision: string;
  state: string;
  readonly parent_run_id: string | null;
}

interface EventRow {
  readonly id: string;
  readonly project_id: string;
  readonly run_id: string;
  readonly sequence: number;
  readonly kind: string;
  readonly source: string;
  readonly target_identity: string | null;
  readonly target_revision: string | null;
  readonly references_json: readonly string[];
}

function cloneRunRow(row: RunRow) {
  return {
    id: row.id,
    target_identity: row.target_identity,
    target_revision: row.target_revision,
    state: row.state,
    parent_run_id: row.parent_run_id,
  };
}

function cloneEventRow(row: EventRow) {
  return {
    id: row.id,
    run_id: row.run_id,
    sequence: row.sequence,
    kind: row.kind,
    source: row.source,
    target_identity: row.target_identity,
    target_revision: row.target_revision,
    references_json: [...row.references_json],
  };
}

function createDurableFakeClient(): SupabaseClient {
  const runs: RunRow[] = [];
  const events: EventRow[] = [];

  function runTable() {
    return {
      select() {
        const filters = new Map<string, unknown>();
        const query = {
          eq(column: string, value: unknown) {
            filters.set(column, value);
            return query;
          },
          maybeSingle() {
            const match = runs.find(
              (row) =>
                [...filters.entries()].every(
                  ([column, value]) => row[column as keyof RunRow] === value,
                ),
            );
            return Promise.resolve({ data: match === undefined ? null : cloneRunRow(match), error: null });
          },
        };
        return query;
      },
      insert(value: unknown) {
        const input = value as RunRow;
        const stored: RunRow = { ...input };
        runs.push(stored);
        return {
          select() {
            return {
              single() {
                return Promise.resolve({ data: cloneRunRow(stored), error: null });
              },
            };
          },
        };
      },
      update(value: unknown) {
        const patch = value as { readonly state: string };
        const filters = new Map<string, unknown>();
        const query = {
          eq(column: string, filterValue: unknown) {
            filters.set(column, filterValue);
            return query;
          },
          select() {
            return {
              maybeSingle() {
                const match = runs.find(
                  (row) =>
                    [...filters.entries()].every(
                      ([column, filterValue]) => row[column as keyof RunRow] === filterValue,
                    ),
                );
                if (match === undefined) return Promise.resolve({ data: null, error: null });
                match.state = patch.state;
                return Promise.resolve({ data: cloneRunRow(match), error: null });
              },
            };
          },
        };
        return query;
      },
    };
  }

  function eventTable() {
    return {
      insert(value: unknown) {
        const input = value as EventRow;
        const stored: EventRow = { ...input, references_json: [...input.references_json] };
        events.push(stored);
        return {
          select() {
            return {
              single() {
                return Promise.resolve({ data: cloneEventRow(stored), error: null });
              },
            };
          },
        };
      },
      select() {
        const filters = new Map<string, unknown>();
        const query = {
          eq(column: string, value: unknown) {
            filters.set(column, value);
            return query;
          },
          order(column: string, options: { readonly ascending: boolean }) {
            expect(column).toBe("sequence");
            expect(options).toEqual({ ascending: true });
            const rows = events
              .filter((row) =>
                [...filters.entries()].every(
                  ([filterColumn, value]) => row[filterColumn as keyof EventRow] === value,
                ),
              )
              .sort((left, right) => left.sequence - right.sequence)
              .map(cloneEventRow);
            return Promise.resolve({ data: rows, error: null });
          },
        };
        return query;
      },
    };
  }

  return {
    from(table: string) {
      if (table === "ineractive_runs") return runTable();
      if (table === "ineractive_run_events") return eventTable();
      throw new Error(`Unexpected durable table ${table}.`);
    },
  } as unknown as SupabaseClient;
}

function rootRun(): RunRecord {
  return {
    schemaVersion: 1,
    id: ROOT_RUN_ID,
    target: { identity: TARGET_ID, revision: TARGET_REVISION },
    state: "PLANNED",
    parentRunId: null,
  };
}

function childRun(): RunRecord {
  return {
    schemaVersion: 1,
    id: CHILD_RUN_ID,
    target: { identity: TARGET_ID, revision: TARGET_REVISION },
    state: "PLANNED",
    parentRunId: ROOT_RUN_ID,
  };
}

function events(): readonly [EventRecord, EventRecord] {
  return [
    {
      schemaVersion: 1,
      id: EVENT_ZERO_ID,
      runId: ROOT_RUN_ID,
      sequence: 0,
      kind: "run.started",
      source: SOURCE_ID,
      target: { identity: TARGET_ID, revision: TARGET_REVISION },
      references: ["artifact://request", "artifact://plan"],
    },
    {
      schemaVersion: 1,
      id: EVENT_ONE_ID,
      runId: ROOT_RUN_ID,
      sequence: 1,
      kind: "tool.completed",
      source: SOURCE_ID,
      target: null,
      references: ["artifact://result"],
    },
  ];
}

describe("durable Run/Event protocol round trip", () => {
  it("preserves exact protocol identity and ordering across RunStore and EventStore", async () => {
    const client = createDurableFakeClient();
    const runs = new SupabaseRunStore(client, PROJECT_ID);
    const history = new SupabaseRunEventStore(client, PROJECT_ID);
    const expectedRoot = rootRun();
    const [eventZero, eventOne] = events();

    const created = await runs.createRoot(expectedRoot);
    expect(created).toEqual({ ok: true, run: expectedRoot });

    const persistedRoot = await runs.read(ROOT_RUN_ID);
    expect(persistedRoot).toEqual({ ok: true, run: expectedRoot });

    const appendZero = await history.append(eventZero);
    const appendOne = await history.append(eventOne);
    expect(appendZero).toEqual({ ok: true, event: eventZero });
    expect(appendOne).toEqual({ ok: true, event: eventOne });

    const replay = await history.read(ROOT_RUN_ID);
    expect(replay).toEqual({
      ok: true,
      runId: ROOT_RUN_ID,
      events: [eventZero, eventOne],
    });
    if (replay.ok) {
      expect(replay.events.map((event) => event.sequence)).toEqual([0, 1]);
      expect(replay.events[0]).toMatchObject({
        id: EVENT_ZERO_ID,
        runId: ROOT_RUN_ID,
        kind: "run.started",
        source: SOURCE_ID,
        target: { identity: TARGET_ID, revision: TARGET_REVISION },
        references: ["artifact://request", "artifact://plan"],
      });
      expect(replay.events[1]).toMatchObject({
        id: EVENT_ONE_ID,
        runId: ROOT_RUN_ID,
        kind: "tool.completed",
        source: SOURCE_ID,
        target: null,
        references: ["artifact://result"],
      });
    }

    const running = await runs.transition(ROOT_RUN_ID, "RUNNING");
    expect(running.ok && running.run).toMatchObject({
      id: ROOT_RUN_ID,
      state: "RUNNING",
      parentRunId: null,
      target: { identity: TARGET_ID, revision: TARGET_REVISION },
    });

    const blocked = await runs.transition(ROOT_RUN_ID, "BLOCKED");
    expect(blocked.ok && blocked.run).toMatchObject({
      id: ROOT_RUN_ID,
      state: "BLOCKED",
      target: { identity: TARGET_ID, revision: TARGET_REVISION },
    });

    const continued = await runs.continue(ROOT_RUN_ID, childRun());
    expect(continued).toEqual({ ok: true, run: childRun() });

    const persistedChild = await runs.read(CHILD_RUN_ID);
    expect(persistedChild).toEqual({ ok: true, run: childRun() });
  });
});
