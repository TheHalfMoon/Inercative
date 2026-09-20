import { describe, expect, it } from "vitest";

import { validateEventRecord } from "@ineractive/protocol";

import { getActivityEvents } from "./activity.js";

describe("workspace activity fixtures", () => {
  it("are public EventRecord values rather than an ad hoc activity shape", () => {
    const events = getActivityEvents();

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.sequence)).toEqual([0, 1]);
    expect(events.every((event) => validateEventRecord(event).ok)).toBe(true);
  });

  it("keep activity ordering explicit", () => {
    const events = getActivityEvents();

    expect(events[0]?.kind).toBe("workspace.opened");
    expect(events[1]?.kind).toBe("preview.placeholder");
  });
});
