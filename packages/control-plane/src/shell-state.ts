import {
  formatLogicalIdentity,
  validateEventRecord,
  type EventRecord,
  type LogicalIdentity,
} from "@ineractive/protocol";

export const WORKSPACE_SHELL_MARKER = "INERACTIVE_WORKSPACE_SHELL_READY";
export const SESSION_ONLY_NOTICE =
  "Session-only workspace. Projects and activity are not persisted yet.";
export const CHANGE_INTENT_BOUNDARY =
  "Recording an intent does not run a model, change source files, save data, or deploy anything.";

const SHELL_SOURCE_ID = formatLogicalIdentity("shell", "00000000-0000-4000-8000-000000000001");

const SEED_PROJECT_ID = formatLogicalIdentity("project", "00000000-0000-4000-8000-000000000101");

const SEED_RUN_ID = formatLogicalIdentity("run", "00000000-0000-4000-8000-000000000201");

const SEED_EVENT_ID = formatLogicalIdentity("event", "00000000-0000-4000-8000-000000000301");

export interface SessionProject {
  readonly id: LogicalIdentity<"project">;
  readonly runId: LogicalIdentity<"run">;
  readonly name: string;
}

export interface WorkspaceShellState {
  readonly projects: readonly SessionProject[];
  readonly activeProjectId: LogicalIdentity<"project"> | null;
  readonly events: readonly EventRecord[];
}

export interface CreateProjectIds {
  readonly projectUuid: string;
  readonly runUuid: string;
  readonly eventUuid: string;
}

function canonicalProjectName(value: string): string {
  const name = value.trim().replace(/\s+/gu, " ");
  if (name.length === 0) {
    throw new TypeError("Project name must not be empty.");
  }
  if (name.length > 80) {
    throw new TypeError("Project name must not exceed 80 characters.");
  }
  return name;
}

function assertValidEvent(event: EventRecord): EventRecord {
  const validation = validateEventRecord(event);
  if (!validation.ok) {
    throw new TypeError(
      "Shell created an invalid protocol event: " +
        validation.issues.map((issue) => issue.path + " " + issue.message).join("; "),
    );
  }
  return validation.value;
}

function nextSequence(events: readonly EventRecord[], runId: LogicalIdentity<"run">): number {
  let maximum = -1;
  for (const event of events) {
    if (event.runId === runId && event.sequence > maximum) {
      maximum = event.sequence;
    }
  }
  return maximum + 1;
}

function shellEvent(
  state: WorkspaceShellState,
  runId: LogicalIdentity<"run">,
  eventUuid: string,
  kind: string,
  references: readonly string[],
): EventRecord {
  return assertValidEvent({
    schemaVersion: 1,
    id: formatLogicalIdentity("event", eventUuid),
    runId,
    sequence: nextSequence(state.events, runId),
    kind,
    source: SHELL_SOURCE_ID,
    target: null,
    references,
  });
}

export function createInitialWorkspaceShellState(): WorkspaceShellState {
  const project: SessionProject = {
    id: SEED_PROJECT_ID,
    runId: SEED_RUN_ID,
    name: "Starter workspace",
  };

  const event = assertValidEvent({
    schemaVersion: 1,
    id: SEED_EVENT_ID,
    runId: SEED_RUN_ID,
    sequence: 0,
    kind: "project.opened",
    source: SHELL_SOURCE_ID,
    target: null,
    references: ["session-only", "starter-workspace"],
  });

  return {
    projects: [project],
    activeProjectId: project.id,
    events: [event],
  };
}

export function createSessionProject(
  state: WorkspaceShellState,
  nameInput: string,
  ids: CreateProjectIds,
): WorkspaceShellState {
  const name = canonicalProjectName(nameInput);
  const project: SessionProject = {
    id: formatLogicalIdentity("project", ids.projectUuid),
    runId: formatLogicalIdentity("run", ids.runUuid),
    name,
  };

  if (state.projects.some((candidate) => candidate.id === project.id)) {
    throw new TypeError("Project identity already exists in this session.");
  }

  const nextState: WorkspaceShellState = {
    projects: [...state.projects, project],
    activeProjectId: project.id,
    events: state.events,
  };

  return {
    ...nextState,
    events: [
      ...nextState.events,
      shellEvent(nextState, project.runId, ids.eventUuid, "project.created", [
        "session-only",
        "project:" + project.id,
      ]),
    ],
  };
}

export function openSessionProject(
  state: WorkspaceShellState,
  projectId: LogicalIdentity<"project">,
  eventUuid: string,
): WorkspaceShellState {
  const project = state.projects.find((candidate) => candidate.id === projectId);
  if (project === undefined) {
    throw new TypeError("Cannot open a project that is not present in this session.");
  }

  const nextState: WorkspaceShellState = {
    ...state,
    activeProjectId: project.id,
  };

  return {
    ...nextState,
    events: [
      ...nextState.events,
      shellEvent(nextState, project.runId, eventUuid, "project.opened", [
        "session-only",
        "project:" + project.id,
      ]),
    ],
  };
}

export function recordChangeIntent(
  state: WorkspaceShellState,
  intentInput: string,
  eventUuid: string,
): WorkspaceShellState {
  const intent = intentInput.trim().replace(/\s+/gu, " ");
  if (intent.length === 0) {
    throw new TypeError("Change intent must not be empty.");
  }
  if (intent.length > 500) {
    throw new TypeError("Change intent must not exceed 500 characters.");
  }

  const project = state.projects.find((candidate) => candidate.id === state.activeProjectId);
  if (project === undefined) {
    throw new TypeError("A project must be open before recording change intent.");
  }

  return {
    ...state,
    events: [
      ...state.events,
      shellEvent(state, project.runId, eventUuid, "change-intent.recorded", [
        "intent:" + intent,
        "session-only",
        "no-execution",
      ]),
    ],
  };
}

export function activeSessionProject(state: WorkspaceShellState): SessionProject | null {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? null;
}

export function activityForActiveProject(state: WorkspaceShellState): readonly EventRecord[] {
  const active = activeSessionProject(state);
  if (active === null) {
    return [];
  }
  return state.events
    .filter((event) => event.runId === active.runId)
    .toSorted((left, right) => right.sequence - left.sequence);
}
