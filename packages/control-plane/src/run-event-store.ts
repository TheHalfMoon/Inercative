import type {
  EventStore,
  EventStoreAppendResult,
  EventStoreIssue,
  EventStoreReadResult,
} from "@ineractive/harness";
import {
  PROTOCOL_RECORD_SCHEMA_VERSION,
  parseLogicalIdentityForKind,
  validateEventRecord,
  type EventRecord,
} from "@ineractive/protocol";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const EVENT_COLUMNS =
  "id,run_id,sequence,kind,source,target_identity,target_revision,references_json";

function issue(code: EventStoreIssue["code"], path: string, message: string): EventStoreIssue {
  return { code, path, message };
}

function freezeEvent(event: EventRecord): EventRecord {
  return Object.freeze({
    ...event,
    target: event.target === null ? null : Object.freeze({ ...event.target }),
    references: Object.freeze([...event.references]),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rowToEvent(row: unknown): EventRecord | null {
  if (!isRecord(row)) return null;

  const target =
    row.target_identity === null && row.target_revision === null
      ? null
      : { identity: row.target_identity, revision: row.target_revision };
  const validated = validateEventRecord({
    schemaVersion: PROTOCOL_RECORD_SCHEMA_VERSION,
    id: row.id,
    runId: row.run_id,
    sequence: row.sequence,
    kind: row.kind,
    source: row.source,
    target,
    references: row.references_json,
  });
  return validated.ok ? freezeEvent(validated.value) : null;
}

function appendIssues(error: PostgrestError): readonly EventStoreIssue[] {
  const diagnostic = `${error.code} ${error.message} ${error.details ?? ""}`;
  if (diagnostic.includes("ineractive_event_sequence_gap")) {
    return [issue("SEQUENCE_GAP", "$.sequence", "Durable EventStore rejected a sequence gap.")];
  }
  if (diagnostic.includes("ineractive_event_sequence_regression")) {
    return [
      issue(
        "DUPLICATE_SEQUENCE",
        "$.sequence",
        "Durable EventStore rejected an occupied sequence.",
      ),
      issue(
        "SEQUENCE_REGRESSION",
        "$.sequence",
        "Durable EventStore rejected a sequence regression.",
      ),
    ];
  }
  if (diagnostic.includes("ineractive_run_events_run_sequence_unique")) {
    return [
      issue(
        "DUPLICATE_SEQUENCE",
        "$.sequence",
        "Durable EventStore rejected an occupied sequence.",
      ),
    ];
  }
  if (diagnostic.includes("ineractive_run_events_pkey")) {
    return [
      issue(
        "DUPLICATE_EVENT_ID",
        "$.id",
        "Durable EventStore rejected a duplicate Event identity.",
      ),
    ];
  }
  return [issue("STORE_UNAVAILABLE", "$", "Durable EventStore could not persist the Event.")];
}

function normalizeRows(value: unknown): readonly unknown[] | null {
  return Array.isArray(value) ? value : null;
}

export class SupabaseRunEventStore implements EventStore {
  public constructor(
    private readonly client: SupabaseClient,
    private readonly projectId: string,
  ) {
    if (!UUID_PATTERN.test(projectId)) {
      throw new Error("Durable EventStore projectId must be a UUID.");
    }
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
        project_id: this.projectId,
        run_id: event.runId,
        sequence: event.sequence,
        kind: event.kind,
        source: event.source,
        target_identity: event.target?.identity ?? null,
        target_revision: event.target?.revision ?? null,
        references_json: [...event.references],
      })
      .select(EVENT_COLUMNS)
      .single();

    if (error !== null) {
      return { ok: false, issues: appendIssues(error) };
    }

    const stored = rowToEvent(data);
    if (stored === null || stored.id !== event.id || stored.runId !== event.runId) {
      return {
        ok: false,
        issues: [
          issue(
            "STORAGE_CORRUPTION",
            "$",
            "Durable EventStore returned an invalid persisted Event.",
          ),
        ],
      };
    }
    return { ok: true, event: stored };
  }

  public async read(runIdInput: unknown): Promise<EventStoreReadResult> {
    const runId =
      typeof runIdInput === "string" ? parseLogicalIdentityForKind("run", runIdInput) : null;
    if (runId === null) {
      return {
        ok: false,
        issues: [
          issue(
            "INVALID_RUN_ID",
            "$.runId",
            "EventStore read requires a canonical Run logical identity.",
          ),
        ],
      };
    }

    const { data, error } = await this.client
      .from("ineractive_run_events")
      .select(EVENT_COLUMNS)
      .eq("project_id", this.projectId)
      .eq("run_id", runId)
      .order("sequence", { ascending: true });

    if (error !== null) {
      return {
        ok: false,
        issues: [issue("STORE_UNAVAILABLE", "$", "Durable EventStore could not read Run history.")],
      };
    }

    const rows = normalizeRows(data);
    if (rows === null) {
      return {
        ok: false,
        issues: [
          issue(
            "STORAGE_CORRUPTION",
            "$",
            "Durable EventStore returned a malformed history payload.",
          ),
        ],
      };
    }

    const events: EventRecord[] = [];
    for (const row of rows) {
      const event = rowToEvent(row);
      if (event === null || event.runId !== runId || event.sequence !== events.length) {
        return {
          ok: false,
          issues: [
            issue("STORAGE_CORRUPTION", "$", "Durable EventStore returned invalid Run history."),
          ],
        };
      }
      events.push(event);
    }

    return { ok: true, runId, events: Object.freeze(events) };
  }
}
