export const INITIAL_PROJECTS = Object.freeze([
  Object.freeze({
    id: "project-demo-clinic",
    name: "Clinic operations",
    summary: "Ephemeral shell fixture for workspace navigation.",
  }),
  Object.freeze({
    id: "project-demo-commerce",
    name: "Commerce workspace",
    summary: "Ephemeral shell fixture. No backend is connected.",
  }),
]);

export function normalizeProjectName(value) {
  return value.trim().replace(/\s+/gu, " ");
}

export function createEphemeralProject(existing, name) {
  const normalized = normalizeProjectName(name);
  if (normalized.length === 0) {
    return {
      ok: false,
      reason: "Project name is required.",
    };
  }
  if (normalized.length > 80) {
    return {
      ok: false,
      reason: "Project name must be 80 characters or fewer.",
    };
  }

  const collision = existing.some(
    (project) => project.name.toLocaleLowerCase() === normalized.toLocaleLowerCase(),
  );
  if (collision) {
    return {
      ok: false,
      reason: "A project with this name already exists in this session.",
    };
  }

  return {
    ok: true,
    project: {
      id: "ephemeral-" + (existing.length + 1).toString().padStart(3, "0"),
      name: normalized,
      summary: "Created in this browser session. Persistence is not enabled yet.",
    },
  };
}
