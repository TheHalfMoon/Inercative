import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  EventStore,
  EventStoreAppendResult,
  EventStoreIssue,
  EventStoreReadResult,
} from "@ineractive/harness";
import {
  parseLogicalIdentityForKind,
  validateEventRecord,
  validateRunRecord,
  validateRunStateTransition,
  type EventRecord,
  type RunRecord,
  type RunState,
} from "@ineractive/protocol";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

interface RunRow {
  readonly id: string;
  readonly project_id: string;
  readonly target_identity: string;
  readonly target_revision: string;
  readonly state: string;
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
  readonly references_json: unknown;
}

interface StoreErrorLike {
  readonly code?: string;
  readonly message?: string;
}

export type DurableRunStoreIssueCode =
  | "INVALID_PROJECT_ID"
  | "INVALID_RUN_ID"
  | "INVALID_RUN_RECORD"
  | "INVALID_TRANSITION"
  | "RUN_NOT_FOUND"
  | "RUN_CONFLICT"
  | "STORE_UNAVAILABLE"
  | "STORAGE_CORRUPTION";

export interface DurableRunStoreIssue {
  readonly code: DurableRunStoreIssueCode;
  readonly path: string;
  readonly message: string;
}

export type DurableRunMutationResult =
  | { readonly ok: true; readonly run: RunRecord }
  | { readonly ok: false; readonly issues: readonly DurableRunStoreIssue[] };

export type DurableRunReadResult =
  | { readonly ok: true; readonly run: RunRecord | null }
  | { readonly ok: false; readonly issues: readonly DurableRunStoreIssue[] };

function runColumns(): string {
  return "id,project_id,target_identity,target_revision,state,parent_run_id";
}

function eventColumns(): string {
  return "id,project_id,run_id,sequence,kind,source,target_identity,target_revision,references_json";
}

function eventStorageIssue(code: EventStoreIssue["code"], message: string): EventStoreIssue {
  return { code, path: "$", message };
}

function runStorageIssue(
  code: DurableRunStoreIssueCode,
  path: string,
  message: string,
): DurableRunStoreIssue {
  return { code, path, message };
}

function classifyEventInsertError(error: StoreErrorLike): EventStoreIssue {
  const message = error.message ?? "";
  if (error.code === "23505" && message.includes("ineractive_run_events_pkey")) {
    return eventStorageIssue("DUPLICATE_EVENT_ID", "Event identity already exists.");
  }
  if (error.code === "23505" && message.includes("ineractive_run_events_run_sequence_unique")) {
    return eventStorageIssue("DUPLICATE_SEQUENCE", "Run event sequence is already occupied.");
  }
  if (message.includes("ineractive_event_sequence_gap")) {
    return eventStorageIssue("SEQUENCE_GAP", "Run event sequence contains a gap.");
  }
  if (message.includes("ineractive_event_sequence_regression")) {
    return eventStorageIssue("SEQUENCE_REGRESSION", "Run event sequence regressed.");
  }
  return eventStorageIssue("STORE_UNAVAILABLE", "Durable EventStore append was rejected.");
}

function mapEventRow(row: EventRow): EventStoreAppendResult {
  const candidate = {
    schemaVersion: 1,
    id: row.id,
    runId: row.run_id,
    sequence: row.sequence,
    kind: row.kind,
    source: row.source,
    target:
      row.target_identity === null || row.target_revision === null
        ? null
        : { identity: row.target_identity, revision: row.target_revision },
    references: row.references_json,
  };
  const validated = validateEventRecord(candidate);
  if (!validated.ok) {
    return {
      ok: false,
      issues: [
        eventStorageIssue("STORAGE_CORRUPTION", "Durable EventStore returned invalid data."),
      ],
    };
  }
  return { ok: true, event: validated.value };
}

function mapRunRow(row: RunRow): DurableRunMutationResult {
  const candidate = {
    schemaVersion: 1,
    id: row.id,
    target: { identity: row.target_identity, revision: row.target_revision },
    state: row.state,
    parentRunId: row.parent_run_id,
  };
  const validated = validateRunRecord(candidate);
  if (!validated.ok) {
    return {
      ok: false,
      issues: [
        runStorageIssue(
          "STORAGE_CORRUPTION",
          "$",
          "Durable Run store returned invalid protocol data.",
        ),
      ],
    };
  }
  return { ok: true, run: validated.value };
}

export class SupabaseRunEventStore implements EventStore {
  public constructor(private readonly client: SupabaseClient) {}

  public async createRun(projectId: string, input: unknown): Promise<DurableRunMutationResult> {
    if (!UUID_PATTERN.test(projectId)) {
      return {
        ok: false,
        issues: [
          runStorageIssue("INVALID_PROJECT_ID", "$.projectId", "Project id must be a UUID."),
        ],
      };
    }

    const validated = validateRunRecord(input);
    if (!validated.ok || validated.value.state !== "PLANNED") {
      return {
        ok: false,
        issues: [
          runStorageIssue(
            "INVALID_RUN_RECORD",
            "$.run",
            "A durable Run must be a valid RunRecord beginning in PLANNED state.",
          ),
        ],
      };
    }
    const run = validated.value;
    const { data, error } = await this.client
      .from("ineractive_runs")
      .insert({
        id: run.id,
        project_id: projectId,
        target_identity: run.target.identity,
        target_revision: run.target.revision,
        state: run.state,
        parent_run_id: run.parentRunId,
      })
      .select(runColumns())
      .single();

    if (error !== null) {
      return {
        ok: false,
        issues: [runStorageIssue("STORE_UNAVAILABLE", "$", "Durable Run create was rejected.")],
      };
    }
    return mapRunRow(data as unknown as RunRow);
  }

  public async getRun(runIdInput: unknown): Promise<DurableRunReadResult> {
    const runId =
      typeof runIdInput === "string" ? parseLogicalIdentityForKind("run", runIdInput) : null;
    if (runId === null) {
      return {
        ok: false,
        issues: [
          runStorageIssue(
            "INVALID_RUN_ID",
            "$.runId",
            "Run read requires a canonical Run identity.",
          ),
        ],
      };
    }

    const { data, error } = await this.client
      .from("ineractive_runs")
      .select(runColumns())
      .eq("id", runId)
      .maybeSingle();
    if (error !== null) {
      return {
        ok: false,
        issues: [runStorageIssue("STORE_UNAVAILABLE", "$", "Durable Run read failed.")],
      };
    }
    if (data === null) {
      return { ok: true, run: null };
    }
    const mapped = mapRunRow(data as unknown as RunRow);
    return mapped.ok ? { ok: true, run: mapped.run } : mapped;
  }

  public async transitionRun(
    runIdInput: unknown,
    nextState: RunState,
  ): Promise<DurableRunMutationResult> {
    const currentResult = await this.getRun(runIdInput);
    if (!currentResult.ok) {
      return currentResult;
    }
    if (currentResult.run === null) {
      return {
        ok: false,
        issues: [
          runStorageIssue("RUN_NOT_FOUND", "$.runId", "Run does not exist or is not visible."),
        ],
      };
    }

    const current = currentResult.run;
    const transition = validateRunStateTransition(current.state, nextState);
    if (!transition.ok) {
      return {
        ok: false,
        issues: [
          runStorageIssue(
            "INVALID_TRANSITION",
            "$.state",
            `Run state transition ${current.state} -> ${nextState} is not allowed.`,
          ),
        ],
      };
    }

    const { data, error } = await this.client
      .from("ineractive_runs")
      .update({ state: nextState })
      .eq("id", current.id)
      .eq("state", current.state)
      .select(runColumns())
      .maybeSingle();
    if (error !== null) {
      return {
        ok: false,
        issues: [runStorageIssue("STORE_UNAVAILABLE", "$", "Durable Run transition failed.")],
      };
    }
    if (data === null) {
      return {
        ok: false,
        issues: [
          runStorageIssue(
            "RUN_CONFLICT",
            "$.state",
            "Run state changed concurrently; no transition was committed.",
          ),
        ],
      };
    }
    return mapRunRow(data as unknown as RunRow);
  }

  public async append(input: unknown): Promise<EventStoreAppendResult> {
    const validated = validateEventRecord(input);
    if (!validated.ok) {
      return {
        ok: false,
        issues: validated.issues.map((item) => ({
          code: "INVALID_EVENT_RECORD" as const,
          path: item.path,
          message: item.message,
          protocolCode: item.code,
        })),
      };
    }
    const event = validated.value;
    const { data, error } = await this.client
      .from("ineractive_run_events")
      .insert({
        id: event.id,
        run_id: event.runId,
        sequence: event.sequence,
        kind: event.kind,
        source: event.source,
        target_identity: event.target?.identity ?? null,
        target_revision: event.target?.revision ?? null,
        references_json: event.references,
      })
      .select(eventColumns())
      .single();

    if (error !== null) {
      return { ok: false, issues: [classifyEventInsertError(error)] };
    }
    return mapEventRow(data as unknown as EventRow);
  }

  public async read(runIdInput: unknown): Promise<EventStoreReadResult> {
    const runId =
      typeof runIdInput === "string" ? parseLogicalIdentityForKind("run", runIdInput) : null;
    if (runId === null) {
      return {
        ok: false,
        issues: [
          eventStorageIssue("INVALID_RUN_ID", "EventStore read requires a canonical Run identity."),
        ],
      };
    }

    const { data, error } = await this.client
      .from("ineractive_run_events")
      .select(eventColumns())
      .eq("run_id", runId)
      .order("sequence", { ascending: true });
    if (error !== null) {
      return {
        ok: false,
        issues: [eventStorageIssue("STORE_UNAVAILABLE", "Durable EventStore read failed.")],
      };
    }

    const events: EventRecord[] = [];
    for (const raw of (data ?? []) as unknown as EventRow[]) {
      const mapped = mapEventRow(raw);
      if (!mapped.ok) {
        return mapped;
      }
      events.push(mapped.event);
    }
    return { ok: true, runId, events: Object.freeze(events) };
  }
}
