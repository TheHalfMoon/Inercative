import { describe, expect, it } from "vitest";

import {
  CHANGE_INTENT_BOUNDARY,
  SESSION_ONLY_NOTICE,
  activeSessionProject,
  activityForActiveProject,
  createInitialWorkspaceShellState,
  createSessionProject,
  openSessionProject,
  recordChangeIntent,
} from "./shell-state.ts";

const PROJECT_UUID = "10000000-0000-4000-8000-000000000001";
const RUN_UUID = "10000000-0000-4000-8000-000000000002";
const CREATE_EVENT_UUID = "10000000-0000-4000-8000-000000000003";
const OPEN_EVENT_UUID = "10000000-0000-4000-8000-000000000004";
const INTENT_EVENT_UUID = "10000000-0000-4000-8000-000000000005";

describe("workspace shell state", () => {
  it("starts with an explicit session-only starter project", () => {
    const state = createInitialWorkspaceShellState();

    expect(state.projects).toHaveLength(1);
    expect(activeSessionProject(state)?.name).toBe("Starter workspace");
    expect(SESSION_ONLY_NOTICE).toContain("not persisted");
  });

  it("creates and opens a session project with canonical protocol activity", () => {
    const created = createSessionProject(createInitialWorkspaceShellState(), "  Apollo   Desk  ", {
      projectUuid: PROJECT_UUID,
      runUuid: RUN_UUID,
      eventUuid: CREATE_EVENT_UUID,
    });

    expect(created.projects).toHaveLength(2);
    expect(activeSessionProject(created)?.name).toBe("Apollo Desk");
    expect(activityForActiveProject(created)[0]?.kind).toBe("project.created");
    expect(activityForActiveProject(created)[0]?.sequence).toBe(0);

    const starterId = created.projects[0]?.id;
    expect(starterId).toBeDefined();
    if (starterId === undefined) return;

    const reopened = openSessionProject(created, starterId, OPEN_EVENT_UUID);
    expect(activeSessionProject(reopened)?.name).toBe("Starter workspace");
    expect(activityForActiveProject(reopened)[0]?.kind).toBe("project.opened");
    expect(activityForActiveProject(reopened)[0]?.sequence).toBe(1);
  });

  it("records change intent as activity without creating execution state", () => {
    const state = recordChangeIntent(
      createInitialWorkspaceShellState(),
      "  Add a customer intake flow  ",
      INTENT_EVENT_UUID,
    );

    const activity = activityForActiveProject(state);
    expect(activity[0]?.kind).toBe("change-intent.recorded");
    expect(activity[0]?.references).toEqual([
      "intent:Add a customer intake flow",
      "session-only",
      "no-execution",
    ]);
    expect(state.projects).toHaveLength(1);
    expect(CHANGE_INTENT_BOUNDARY).toContain("does not run a model");
    expect(CHANGE_INTENT_BOUNDARY).toContain("deploy");
  });

  it("rejects empty project names and empty intents", () => {
    const state = createInitialWorkspaceShellState();

    expect(() =>
      createSessionProject(state, "   ", {
        projectUuid: PROJECT_UUID,
        runUuid: RUN_UUID,
        eventUuid: CREATE_EVENT_UUID,
      }),
    ).toThrow("Project name must not be empty");

    expect(() => recordChangeIntent(state, "   ", INTENT_EVENT_UUID)).toThrow(
      "Change intent must not be empty",
    );
  });

  it("rejects opening a project that is not in the session", async () => {
    const { formatLogicalIdentity } = await import("@ineractive/protocol");
    const missingId = formatLogicalIdentity(
      "project",
      "20000000-0000-4000-8000-000000000001",
    );

    expect(() =>
      openSessionProject(createInitialWorkspaceShellState(), missingId, OPEN_EVENT_UUID),
    ).toThrow("Cannot open a project");
  });
});
