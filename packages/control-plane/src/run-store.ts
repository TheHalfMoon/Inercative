import {
  PROTOCOL_RECORD_SCHEMA_VERSION,
  parseLogicalIdentityForKind,
  validateRunContinuation,
  validateRunRecord,
  validateRunStateTransition,
  type LogicalIdentity,
  type ProtocolRecordIssueCode,
  type RunLifecycleIssueCode,
  type RunRecord,
} from "@ineractive/protocol";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const RUN_COLUMNS = "id,target_identity,target_revision,state,parent_run_id";

export type RunStoreIssueCode =
  | "INVALID_RUN_RECORD"
  | "INVALID_RUN_ID"
  | "INVALID_ROOT_RUN"
  | "RUN_NOT_FOUND"
  | "LIFECYCLE_REJECTED"
  | "CONTINUATION_REJECTED"
  | "DUPLICATE_RUN_ID"
  | "STATE_CONFLICT"
  | "STORE_UNAVAILABLE"
  | "STORAGE_CORRUPTION";

export interface RunStoreIssue {
  readonly code: RunStoreIssueCode;
  readonly path: string;
  readonly message: string;
  readonly protocolCode?: ProtocolRecordIssueCode;
  readonly lifecycleCode?: RunLifecycleIssueCode;
}

export type RunStoreResult =
  | { readonly ok: true; readonly run: RunRecord }
  | { readonly ok: false; readonly issues: readonly RunStoreIssue[] };

function issue(code: RunStoreIssueCode, path: string, message: string): RunStoreIssue {
  return { code, path, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function freezeRun(run: RunRecord): RunRecord {
  return Object.freeze({ ...run, target: Object.freeze({ ...run.target }) });
}

function rowToRun(row: unknown): RunRecord | null {
  if (!isRecord(row)) return null;
  const validated = validateRunRecord({
    schemaVersion: PROTOCOL_RECORD_SCHEMA_VERSION,
    id: row.id,
    target: { identity: row.target_identity, revision: row.target_revision },
    state: row.state,
    parentRunId: row.parent_run_id,
  });
  return validated.ok ? freezeRun(validated.value) : null;
}

function sameRun(left: RunRecord, right: RunRecord): boolean {
  return (
    left.id === right.id &&
    left.state === right.state &&
    left.parentRunId === right.parentRunId &&
    left.target.identity === right.target.identity &&
    left.target.revision === right.target.revision
  );
}

function storageIssue(error: PostgrestError, operation: string): RunStoreIssue {
  const diagnostic = `${error.code} ${error.message} ${error.details ?? ""}`;
  if (diagnostic.includes("ineractive_runs_pkey")) {
    return issue("DUPLICATE_RUN_ID", "$.id", "Durable RunStore rejected a duplicate Run identity.");
  }
  return issue("STORE_UNAVAILABLE", "$", `Durable RunStore could not ${operation}.`);
}

function invalidRunIssues(input: unknown): readonly RunStoreIssue[] | RunRecord {
  const validated = validateRunRecord(input);
  if (validated.ok) return validated.value;
  return validated.issues.map((item) => ({
    code: "INVALID_RUN_RECORD" as const,
    path: item.path,
    message: item.message,
    protocolCode: item.code,
  }));
}

function parseRunId(input: unknown): LogicalIdentity<"run"> | null {
  return typeof input === "string" ? parseLogicalIdentityForKind("run", input) : null;
}

export class SupabaseRunStore {
  public constructor(
    private readonly client: SupabaseClient,
    private readonly projectId: string,
  ) {
    if (!UUID_PATTERN.test(projectId)) {
      throw new Error("Durable RunStore projectId must be a UUID.");
    }
  }

  public async createRoot(input: unknown): Promise<RunStoreResult> {
    const parsed = invalidRunIssues(input);
    if (Array.isArray(parsed)) return { ok: false, issues: parsed };
    const run = parsed as RunRecord;
    if (run.parentRunId !== null || run.state !== "PLANNED") {
      return {
        ok: false,
        issues: [
          issue(
            "INVALID_ROOT_RUN",
            "$",
            "A root Run must start in PLANNED state with parentRunId set to null.",
          ),
        ],
      };
    }
    return this.insertValidated(run);
  }

  public async read(runIdInput: unknown): Promise<RunStoreResult> {
    const runId = parseRunId(runIdInput);
    if (runId === null) {
      return {
        ok: false,
        issues: [issue("INVALID_RUN_ID", "$.runId", "RunStore read requires a canonical Run identity.")],
      };
    }
    return this.readValidated(runId);
  }

  public async transition(runIdInput: unknown, toStateInput: unknown): Promise<RunStoreResult> {
    const runId = parseRunId(runIdInput);
    if (runId === null) {
      return {
        ok: false,
        issues: [
          issue("INVALID_RUN_ID", "$.runId", "RunStore transition requires a canonical Run identity."),
        ],
      };
    }

    const currentResult = await this.readValidated(runId);
    if (!currentResult.ok) return currentResult;
    const transition = validateRunStateTransition(currentResult.run.state, toStateInput);
    if (!transition.ok) {
      return {
        ok: false,
        issues: transition.issues.map((item) => ({
          code: "LIFECYCLE_REJECTED" as const,
          path: item.path,
          message: item.message,
          lifecycleCode: item.code,
        })),
      };
    }

    const { data, error } = await this.client
      .from("ineractive_runs")
      .update({ state: transition.value.to })
      .eq("project_id", this.projectId)
      .eq("id", runId)
      .eq("state", currentResult.run.state)
      .select(RUN_COLUMNS)
      .maybeSingle();

    if (error !== null) {
      return { ok: false, issues: [storageIssue(error, "transition the Run")] };
    }
    if (data === null) {
      return {
        ok: false,
        issues: [
          issue(
            "STATE_CONFLICT",
            "$.state",
            "Run state changed concurrently; the requested transition was not persisted.",
          ),
        ],
      };
    }

    const stored = rowToRun(data);
    if (
      stored === null ||
      stored.id !== runId ||
      stored.state !== transition.value.to ||
      stored.target.identity !== currentResult.run.target.identity ||
      stored.target.revision !== currentResult.run.target.revision ||
      stored.parentRunId !== currentResult.run.parentRunId
    ) {
      return {
        ok: false,
        issues: [issue("STORAGE_CORRUPTION", "$", "Durable RunStore returned an invalid transition row.")],
      };
    }
    return { ok: true, run: stored };
  }

  public async continue(parentRunIdInput: unknown, childInput: unknown): Promise<RunStoreResult> {
    const parentRunId = parseRunId(parentRunIdInput);
    if (parentRunId === null) {
      return {
        ok: false,
        issues: [
          issue("INVALID_RUN_ID", "$.parentRunId", "Run continuation requires a canonical parent Run identity."),
        ],
      };
    }

    const parentResult = await this.readValidated(parentRunId);
    if (!parentResult.ok) return parentResult;
    const continuation = validateRunContinuation(parentResult.run, childInput);
    if (!continuation.ok) {
      return {
        ok: false,
        issues: continuation.issues.map((item) => ({
          code: "CONTINUATION_REJECTED" as const,
          path: item.path,
          message: item.message,
          lifecycleCode: item.code,
        })),
      };
    }
    return this.insertValidated(continuation.value.child);
  }

  private async readValidated(runId: LogicalIdentity<"run">): Promise<RunStoreResult> {
    const { data, error } = await this.client
      .from("ineractive_runs")
      .select(RUN_COLUMNS)
      .eq("project_id", this.projectId)
      .eq("id", runId)
      .maybeSingle();

    if (error !== null) {
      return { ok: false, issues: [storageIssue(error, "read the Run")] };
    }
    if (data === null) {
      return { ok: false, issues: [issue("RUN_NOT_FOUND", "$.runId", "Run was not found in this project.")] };
    }
    const run = rowToRun(data);
    return run === null
      ? { ok: false, issues: [issue("STORAGE_CORRUPTION", "$", "Durable RunStore returned a malformed Run row.")] }
      : { ok: true, run };
  }

  private async insertValidated(run: RunRecord): Promise<RunStoreResult> {
    const { data, error } = await this.client
      .from("ineractive_runs")
      .insert({
        id: run.id,
        project_id: this.projectId,
        target_identity: run.target.identity,
        target_revision: run.target.revision,
        state: run.state,
        parent_run_id: run.parentRunId,
      })
      .select(RUN_COLUMNS)
      .single();

    if (error !== null) {
      return { ok: false, issues: [storageIssue(error, "persist the Run")] };
    }
    const stored = rowToRun(data);
    if (stored === null || !sameRun(stored, run)) {
      return {
        ok: false,
        issues: [issue("STORAGE_CORRUPTION", "$", "Durable RunStore returned an invalid persisted Run.")],
      };
    }
    return { ok: true, run: stored };
  }
}
