import { describe, expect, it } from "vitest";

import {
  INITIAL_PROJECTS,
  createEphemeralProject,
  normalizeProjectName,
} from "./project-model.js";

describe("ephemeral project model", () => {
  it("normalizes whitespace without inventing persistence", () => {
    expect(normalizeProjectName("  Research   Hub  ")).toBe("Research Hub");
  });

  it("creates a session-only project with explicit ephemeral copy", () => {
    const result = createEphemeralProject(INITIAL_PROJECTS, "Research Hub");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.project.id).toBe("ephemeral-003");
      expect(result.project.summary).toContain("browser session");
      expect(result.project.summary).toContain("Persistence is not enabled");
    }
  });

  it("rejects empty, duplicate, and oversized names", () => {
    expect(createEphemeralProject(INITIAL_PROJECTS, "  ")).toEqual({
      ok: false,
      reason: "Project name is required.",
    });
    expect(createEphemeralProject(INITIAL_PROJECTS, "clinic operations")).toEqual({
      ok: false,
      reason: "A project with this name already exists in this session.",
    });
    expect(createEphemeralProject(INITIAL_PROJECTS, "x".repeat(81))).toEqual({
      ok: false,
      reason: "Project name must be 80 characters or fewer.",
    });
  });
});
