import { describe, expect, it } from "vitest";

import { formatLogicalIdentity, type LogicalIdentity } from "@ineractive/protocol";

import { InMemoryEventStore, type EventStoreAppendResult } from "./event-store.ts";

const RUN_A = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789101");
const RUN_B = formatLogicalIdentity("run", "018f9f3a-7b2a-7f11-8a4c-123456789102");
const SOURCE = formatLogicalIdentity("tool", "018f9f3a-7b2a-7f11-8a4c-123456789103");

function eventId(suffix: string) {
  return formatLogicalIdentity("event", `018f9f3a-7b2a-7f11-8a4c-${suffix}`);
}

function event(runId: LogicalIdentity<"run">, sequence: number, suffix: string) {
  return {
    schemaVersion: 1,
    id: eventId(suffix),
    runId,
    sequence,
    kind: "tool.observed",
    source: SOURCE,
    target: null,
    references: [`artifact:${suffix}`],
  };
}

function issueCodes(result: EventStoreAppendResult): readonly string[] {
  return result.ok ? [] : result.issues.map((item) => item.code);
}

describe("InMemoryEventStore", () => {
  it("accepts zero-based contiguous events and replays them in ascending order", async () => {
    const store = new InMemoryEventStore();
    const first = event(RUN_A, 0, "000000000001");
    const second = event(RUN_A, 1, "000000000002");

    expect((await store.append(first)).ok).toBe(true);
    expect((await store.append(second)).ok).toBe(true);

    const replay = await store.read(RUN_A);
    expect(replay.ok).toBe(true);
    if (replay.ok) {
      expect(replay.events.map((item) => item.sequence)).toEqual([0, 1]);
      expect(replay.events.map((item) => item.id)).toEqual([first.id, second.id]);
    }
  });

  it("rejects duplicate event identity without mutating accepted history", async () => {
    const store = new InMemoryEventStore();
    const first = event(RUN_A, 0, "000000000003");
    expect((await store.append(first)).ok).toBe(true);

    const before = await store.read(RUN_A);
    const rejected = await store.append({ ...first, sequence: 1 });
    const after = await store.read(RUN_A);

    expect(issueCodes(rejected)).toEqual(["DUPLICATE_EVENT_ID"]);
    expect(after).toEqual(before);
  });

  it("rejects cross-Run reuse of an Event identity", async () => {
    const store = new InMemoryEventStore();
    const first = event(RUN_A, 0, "000000000004");
    expect((await store.append(first)).ok).toBe(true);

    const rejected = await store.append({ ...first, runId: RUN_B });
    expect(issueCodes(rejected)).toEqual(["CROSS_RUN_EVENT_ID"]);
    expect(await store.read(RUN_B)).toEqual({ ok: true, runId: RUN_B, events: [] });
  });

  it("rejects skipped sequence positions without mutation", async () => {
    const store = new InMemoryEventStore();
    const rejected = await store.append(event(RUN_A, 1, "000000000005"));

    expect(issueCodes(rejected)).toEqual(["SEQUENCE_GAP"]);
    expect(await store.read(RUN_A)).toEqual({ ok: true, runId: RUN_A, events: [] });
  });

  it("rejects occupied and regressed sequence positions deterministically", async () => {
    const store = new InMemoryEventStore();
    expect((await store.append(event(RUN_A, 0, "000000000006"))).ok).toBe(true);

    const candidate = event(RUN_A, 0, "000000000007");
    const first = await store.append(candidate);
    const second = await store.append(candidate);

    expect(issueCodes(first)).toEqual(["DUPLICATE_SEQUENCE", "SEQUENCE_REGRESSION"]);
    expect(second).toEqual(first);
    const replay = await store.read(RUN_A);
    expect(replay.ok && replay.events).toHaveLength(1);
  });

  it("rejects invalid EventRecord values through the protocol validator", async () => {
    const store = new InMemoryEventStore();
    const result = await store.append({ schemaVersion: 1, runId: RUN_A });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.every((item) => item.code === "INVALID_EVENT_RECORD")).toBe(true);
      expect(result.issues.some((item) => item.protocolCode === "MISSING_FIELD")).toBe(true);
    }
    expect(await store.read(RUN_A)).toEqual({ ok: true, runId: RUN_A, events: [] });
  });

  it("keeps replay isolated by Run identity", async () => {
    const store = new InMemoryEventStore();
    const eventA = event(RUN_A, 0, "000000000008");
    const eventB = event(RUN_B, 0, "000000000009");
    expect((await store.append(eventA)).ok).toBe(true);
    expect((await store.append(eventB)).ok).toBe(true);

    const replayA = await store.read(RUN_A);
    const replayB = await store.read(RUN_B);
    expect(replayA.ok && replayA.events.map((item) => item.id)).toEqual([eventA.id]);
    expect(replayB.ok && replayB.events.map((item) => item.id)).toEqual([eventB.id]);
  });

  it("stores immutable snapshots rather than caller-owned mutable input", async () => {
    const store = new InMemoryEventStore();
    const input = event(RUN_A, 0, "000000000010");
    expect((await store.append(input)).ok).toBe(true);

    input.kind = "mutated.kind";
    input.references.push("artifact:mutated");

    const replay = await store.read(RUN_A);
    expect(replay.ok).toBe(true);
    if (replay.ok) {
      expect(replay.events[0]?.kind).toBe("tool.observed");
      expect(replay.events[0]?.references).toEqual(["artifact:000000000010"]);
      expect(Object.isFrozen(replay.events)).toBe(true);
      expect(Object.isFrozen(replay.events[0])).toBe(true);
      expect(Object.isFrozen(replay.events[0]?.references)).toBe(true);
    }
  });

  it("rejects non-Run replay identities without exposing another history", async () => {
    const store = new InMemoryEventStore();
    expect((await store.append(event(RUN_A, 0, "000000000011"))).ok).toBe(true);

    expect(await store.read(SOURCE)).toEqual({
      ok: false,
      issues: [
        {
          code: "INVALID_RUN_ID",
          path: "$.runId",
          message: "EventStore read requires a canonical Run logical identity.",
        },
      ],
    });
  });
});
