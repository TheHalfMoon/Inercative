import {
  parseLogicalIdentityForKind,
  validateEventRecord,
  type EventRecord,
  type LogicalIdentity,
  type ProtocolRecordIssueCode,
} from "@ineractive/protocol";

export type EventStoreIssueCode =
  | "INVALID_EVENT_RECORD"
  | "INVALID_RUN_ID"
  | "DUPLICATE_EVENT_ID"
  | "CROSS_RUN_EVENT_ID"
  | "DUPLICATE_SEQUENCE"
  | "SEQUENCE_REGRESSION"
  | "SEQUENCE_GAP";

export interface EventStoreIssue {
  readonly code: EventStoreIssueCode;
  readonly path: string;
  readonly message: string;
  readonly protocolCode?: ProtocolRecordIssueCode;
}

export type EventStoreAppendResult =
  | { readonly ok: true; readonly event: EventRecord }
  | { readonly ok: false; readonly issues: readonly EventStoreIssue[] };

export type EventStoreReadResult =
  | {
      readonly ok: true;
      readonly runId: LogicalIdentity<"run">;
      readonly events: readonly EventRecord[];
    }
  | { readonly ok: false; readonly issues: readonly EventStoreIssue[] };

export interface EventStore {
  append(input: unknown): EventStoreAppendResult;
  read(runIdInput: unknown): EventStoreReadResult;
}

const EMPTY_EVENTS = Object.freeze([] as readonly EventRecord[]);

function freezeEvent(event: EventRecord): EventRecord {
  return Object.freeze({
    ...event,
    target: event.target === null ? null : Object.freeze({ ...event.target }),
    references: Object.freeze([...event.references]),
  });
}

export class InMemoryEventStore implements EventStore {
  readonly #historyByRun = new Map<LogicalIdentity<"run">, readonly EventRecord[]>();
  readonly #runByEvent = new Map<LogicalIdentity<"event">, LogicalIdentity<"run">>();

  append(input: unknown): EventStoreAppendResult {
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
    const existingRun = this.#runByEvent.get(event.id);
    if (existingRun !== undefined) {
      return {
        ok: false,
        issues: [
          {
            code: existingRun === event.runId ? "DUPLICATE_EVENT_ID" : "CROSS_RUN_EVENT_ID",
            path: "$.id",
            message:
              existingRun === event.runId
                ? "Event identity is already present in this Run history."
                : "Event identity is already bound to a different Run history.",
          },
        ],
      };
    }

    const history = this.#historyByRun.get(event.runId) ?? EMPTY_EVENTS;
    const expectedSequence = history.length;
    if (event.sequence > expectedSequence) {
      return {
        ok: false,
        issues: [
          {
            code: "SEQUENCE_GAP",
            path: "$.sequence",
            message: `Expected sequence ${expectedSequence}; received ${event.sequence}.`,
          },
        ],
      };
    }
    if (event.sequence < expectedSequence) {
      return {
        ok: false,
        issues: [
          {
            code: "DUPLICATE_SEQUENCE",
            path: "$.sequence",
            message: `Sequence ${event.sequence} is already occupied in this Run history.`,
          },
          {
            code: "SEQUENCE_REGRESSION",
            path: "$.sequence",
            message: `Sequence ${event.sequence} regresses behind next sequence ${expectedSequence}.`,
          },
        ],
      };
    }

    const stored = freezeEvent(event);
    this.#historyByRun.set(event.runId, Object.freeze([...history, stored]));
    this.#runByEvent.set(event.id, event.runId);
    return { ok: true, event: stored };
  }

  read(runIdInput: unknown): EventStoreReadResult {
    const runId =
      typeof runIdInput === "string" ? parseLogicalIdentityForKind("run", runIdInput) : null;
    if (runId === null) {
      return {
        ok: false,
        issues: [
          {
            code: "INVALID_RUN_ID",
            path: "$.runId",
            message: "EventStore read requires a canonical Run logical identity.",
          },
        ],
      };
    }

    return {
      ok: true,
      runId,
      events: this.#historyByRun.get(runId) ?? EMPTY_EVENTS,
    };
  }
}
