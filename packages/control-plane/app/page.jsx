"use client";

import { useMemo, useState } from "react";

import {
  CHANGE_INTENT_BOUNDARY,
  SESSION_ONLY_NOTICE,
  WORKSPACE_SHELL_MARKER,
  activeSessionProject,
  activityForActiveProject,
  createInitialWorkspaceShellState,
  createSessionProject,
  openSessionProject,
  recordChangeIntent,
} from "../src/shell-state.ts";

function makeCreateIds() {
  return {
    projectUuid: crypto.randomUUID(),
    runUuid: crypto.randomUUID(),
    eventUuid: crypto.randomUUID(),
  };
}

export default function WorkspaceShellPage() {
  const [state, setState] = useState(() => createInitialWorkspaceShellState());
  const [projectName, setProjectName] = useState("");
  const [intent, setIntent] = useState("");
  const [message, setMessage] = useState(SESSION_ONLY_NOTICE);

  const activeProject = activeSessionProject(state);
  const activity = useMemo(() => activityForActiveProject(state), [state]);

  function handleCreateProject(event) {
    event.preventDefault();
    try {
      const nextState = createSessionProject(state, projectName, makeCreateIds());
      setState(nextState);
      setProjectName("");
      setMessage("Project created for this browser session only.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create project.");
    }
  }

  function handleOpenProject(projectId) {
    try {
      setState((current) => openSessionProject(current, projectId, crypto.randomUUID()));
      setMessage(SESSION_ONLY_NOTICE);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open project.");
    }
  }

  function handleIntent(event) {
    event.preventDefault();
    try {
      setState((current) => recordChangeIntent(current, intent, crypto.randomUUID()));
      setIntent("");
      setMessage("Intent recorded locally. No model or build was started.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record intent.");
    }
  }

  return (
    <main className="shell" data-shell-marker={WORKSPACE_SHELL_MARKER}>
      <aside className="projects" aria-label="Projects">
        <div>
          <div className="brandLockup" aria-label="Ineractive">
            <span className="brandGlyph" aria-hidden="true" />
            <span className="brandWord">Ineractive</span>
          </div>
          <p className="eyebrow">Projects</p>
          <h1>Shape the product</h1>
          <p className="muted" id="session-boundary">
            {SESSION_ONLY_NOTICE}
          </p>
        </div>

        <nav aria-label="Session projects">
          <ul className="projectList">
            {state.projects.map((project) => (
              <li key={project.id}>
                <button
                  className={project.id === state.activeProjectId ? "project active" : "project"}
                  type="button"
                  aria-pressed={project.id === state.activeProjectId}
                  onClick={() => handleOpenProject(project.id)}
                >
                  <span>{project.name}</span>
                  <small>Session project</small>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <form className="stack" onSubmit={handleCreateProject}>
          <label htmlFor="project-name">New project</label>
          <input
            id="project-name"
            name="project-name"
            maxLength={80}
            aria-describedby="session-boundary"
            autoComplete="off"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Project name"
          />
          <button type="submit">Create project</button>
        </form>
      </aside>

      <section className="workspace" aria-label="Workspace">
        <header className="workspaceHeader">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>{activeProject?.name ?? "No project open"}</h2>
          </div>
          <span className="statusBadge">Not persisted</span>
        </header>

        <section className="preview" aria-labelledby="preview-title">
          <div>
            <p className="eyebrow">Preview</p>
            <h3 id="preview-title">Product preview placeholder</h3>
            <p>
              Generated-app preview arrives in later dependency-ordered work. This surface does not
              simulate generation.
            </p>
            <code>{WORKSPACE_SHELL_MARKER}</code>
          </div>
        </section>

        <form className="intent" onSubmit={handleIntent}>
          <label htmlFor="change-intent">Change intent</label>
          <div className="intentRow">
            <input
              id="change-intent"
              name="change-intent"
              maxLength={500}
              aria-describedby="intent-boundary intent-status"
              autoComplete="off"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="Describe the next change"
            />
            <button type="submit">Record intent</button>
          </div>
          <p className="muted" id="intent-boundary">
            {CHANGE_INTENT_BOUNDARY}
          </p>
          <p role="status" aria-live="polite" className="status" id="intent-status">
            {message}
          </p>
        </form>
      </section>

      <aside className="activity" aria-label="Activity">
        <div>
          <p className="eyebrow">Activity</p>
          <h2>Events</h2>
        </div>
        {activity.length === 0 ? (
          <p className="muted">No activity for this project.</p>
        ) : (
          <ol className="eventList">
            {activity.map((event) => (
              <li key={event.id}>
                <strong>{event.kind}</strong>
                <span>#{event.sequence}</span>
                <small>{event.references.join(" · ")}</small>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </main>
  );
}
