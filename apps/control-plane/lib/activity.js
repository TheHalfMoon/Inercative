import {
  formatLogicalIdentity,
  validateEventRecord,
} from "@ineractive/protocol";

const RUN_ID = formatLogicalIdentity(
  "run",
  "018f9f3a-7b2a-7f11-8a4c-1234567890ab",
);
const SOURCE_ID = formatLogicalIdentity(
  "workspace",
  "550e8400-e29b-41d4-a716-446655440001",
);

const candidates = [
  {
    schemaVersion: 1,
    id: formatLogicalIdentity(
      "event",
      "018f9f3a-7b2a-7f11-8a4c-1234567890ad",
    ),
    runId: RUN_ID,
    sequence: 0,
    kind: "workspace.opened",
    source: SOURCE_ID,
    target: null,
    references: ["shell:workspace"],
  },
  {
    schemaVersion: 1,
    id: formatLogicalIdentity(
      "event",
      "018f9f3a-7b2a-7f11-8a4c-1234567890ae",
    ),
    runId: RUN_ID,
    sequence: 1,
    kind: "preview.placeholder",
    source: SOURCE_ID,
    target: null,
    references: ["shell:preview"],
  },
];

export function getActivityEvents() {
  return candidates.map((candidate) => {
    const result = validateEventRecord(candidate);
    if (!result.ok) {
      throw new Error(
        "Invalid control-plane activity fixture: " +
          result.issues.map((issue) => issue.path + " " + issue.message).join("; "),
      );
    }
    return result.value;
  });
}
