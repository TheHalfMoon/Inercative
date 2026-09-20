"use client";

import { useMemo, useState } from "react";

import { getActivityEvents } from "../lib/activity.js";
import {
  INITIAL_PROJECTS,
  createEphemeralProject,
} from "../lib/project-model.js";

const NAV_ITEMS = ["Workspace", "Preview", "Activity"];

export function WorkspaceShell() {
  const [projects, setProjects] = useState(() => [...INITIAL_PROJECTS]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [name, setName] = useState("");
  const [projectError, setProjectError] = useState("");
  const [intent, setIntent] = useState("");
  const [capturedIntent, setCapturedIntent] = useState("");
  const events = useMemo(() => getActivityEvents(), []);

  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? null;

  function submitProject(event) {
    event.preventDefault();
    const result = createEphemeralProject(projects, name);
    if (!result.ok) {
      setProjectError(result.reason);
      return;
    }

    setProjects((current) => [...current, result.project]);
    setActiveProjectId(result.project.id);
    setName("");
    setProjectError("");
  }

  function submitIntent(event) {
    event.preventDefault();
    const normalized = intent.trim();
    if (normalized.length === 0) return;
    setCapturedIntent(normalized);
    setIntent("");
  }

  if (activeProject === null) {
    return (
      <main className="project-index">
        <header className="hero">
          <p className="eyebrow">Ineractive control plane</p>
          <h1>Projects</h1>
          <p className="muted">
            This P01 shell uses browser-session state only. Supabase persistence and
            authentication are not enabled yet.
          </p>
        </header>

        <section aria-labelledby="project-list-title" className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Session workspace</p>
              <h2 id="project-list-title">Open a project</h2>
            </div>
            <span className="status-chip">Ephemeral</span>
          </div>
          <ul className="project-grid">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  className="project-card"
                  type="button"
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <strong>{project.name}</strong>
                  <span>{project.summary}</span>
                  <span className="project-action">Open workspace →</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="create-title" className="panel compact-panel">
          <h2 id="create-title">Create an ephemeral project</h2>
          <form onSubmit={submitProject} className="inline-form">
            <label>
              <span>Project name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={81}
                autoComplete="off"
              />
            </label>
            <button type="submit">Create and open</button>
          </form>
          <p className="form-message" role="status" aria-live="polite">
            {projectError || "Nothing created here is persisted across browser refreshes."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar" aria-label="Workspace navigation">
        <button
          type="button"
          className="back-button"
          onClick={() => setActiveProjectId(null)}
        >
          ← Projects
        </button>
        <div className="workspace-context">
          <p className="eyebrow">Current project</p>
          <h1>{activeProject.name}</h1>
          <p>Session-only workspace</p>
        </div>
        <nav aria-label="Primary">
          <ul className="nav-list">
            {NAV_ITEMS.map((item, index) => (
              <li key={item}>
                <a href={"#panel-" + item.toLowerCase()} aria-current={index === 0 ? "page" : undefined}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="capability-note">
          <strong>Capability boundary</strong>
          <span>No backend, AI execution, provider connection, or durable project store.</span>
        </div>
      </aside>

      <section className="workspace-main" id="panel-workspace" aria-labelledby="work-title">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2 id="work-title">Product work surface</h2>
          </div>
          <span className="status-chip">Shell only</span>
        </header>

        <div className="work-grid">
          <section className="panel work-surface" aria-labelledby="surface-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Change intent</p>
                <h3 id="surface-title">What should change?</h3>
              </div>
              <span className="status-chip quiet">Capture only</span>
            </div>
            <form onSubmit={submitIntent} className="intent-form">
              <label htmlFor="change-intent">Command or product intent</label>
              <textarea
                id="change-intent"
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                placeholder="Describe a bounded product change…"
                rows={5}
              />
              <button type="submit">Capture intent</button>
            </form>
            <div className="intent-status" role="status" aria-live="polite">
              {capturedIntent ? (
                <>
                  <strong>Captured locally:</strong>
                  <p>{capturedIntent}</p>
                  <span>
                    Execution is not enabled in this Grain. No model or repository action
                    was started.
                  </span>
                </>
              ) : (
                <span>
                  Intent stays in this browser session. No generation is executed yet.
                </span>
              )}
            </div>
          </section>

          <section className="panel preview-panel" id="panel-preview" aria-labelledby="preview-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Preview</p>
                <h3 id="preview-title">Runtime preview</h3>
              </div>
              <span className="status-chip quiet">Not connected</span>
            </div>
            <div className="preview-placeholder">
              <span aria-hidden="true">◇</span>
              <strong>Preview runtime is not implemented yet</strong>
              <p>
                This surface is reserved for a later proven runtime. It does not simulate
                a running generated product.
              </p>
            </div>
          </section>
        </div>
      </section>

      <aside className="activity-panel" id="panel-activity" aria-labelledby="activity-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence-backed activity</p>
            <h2 id="activity-title">Activity</h2>
          </div>
        </div>
        <ol className="activity-list">
          {events.map((event) => (
            <li key={event.id}>
              <span className="sequence">{event.sequence.toString().padStart(2, "0")}</span>
              <div>
                <strong>{event.kind}</strong>
                <span>{event.references.join(", ")}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="muted tiny">
          These fixtures are validated through the public EventRecord contract.
        </p>
      </aside>
    </main>
  );
}
