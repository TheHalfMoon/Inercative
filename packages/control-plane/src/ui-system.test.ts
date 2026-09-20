import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const TOKENS = readFileSync("packages/control-plane/app/tokens.css", "utf8");
const GLOBALS = readFileSync("packages/control-plane/app/globals.css", "utf8");
const PAGE = readFileSync("packages/control-plane/app/page.jsx", "utf8");

describe("control-plane UI system contracts", () => {
  it("defines semantic source-owned token groups for both color schemes", () => {
    for (const token of [
      "--font-body",
      "--text-md",
      "--space-4",
      "--radius-md",
      "--control-min",
      "--canvas",
      "--surface-1",
      "--text-1",
      "--brand",
      "--focus",
    ]) {
      expect(TOKENS).toContain(token + ":");
    }

    expect(TOKENS).toContain("@media (prefers-color-scheme: light)");
    expect(TOKENS).toContain("color-scheme: dark light");
  });

  it("keeps primary controls at the 44px minimum touch target", () => {
    expect(TOKENS).toContain("--control-min: 2.75rem");
    expect(GLOBALS).toContain("min-height: var(--control-min)");
  });

  it("has visible keyboard focus and invalid-state conventions", () => {
    expect(GLOBALS).toContain("button:focus-visible");
    expect(GLOBALS).toContain("input:focus-visible");
    expect(GLOBALS).toContain('input[aria-invalid="true"]');
    expect(GLOBALS).toContain("outline: 3px solid var(--focus)");
  });

  it("reflows at tablet and narrow viewport breakpoints without a fixed desktop body width", () => {
    expect(GLOBALS).toContain("@media (max-width: 68rem)");
    expect(GLOBALS).toContain("@media (max-width: 45rem)");
    expect(GLOBALS).toContain("min-width: 0");
    expect(GLOBALS).not.toContain("min-width: 1120px");
  });

  it("honors reduced-motion preference", () => {
    expect(GLOBALS).toContain("@media (prefers-reduced-motion: reduce)");
    expect(GLOBALS).toContain("transition-duration: 0.001ms");
  });

  it("keeps session-only and no-execution truth wired into accessible descriptions", () => {
    expect(PAGE).toContain('id="session-boundary"');
    expect(PAGE).toContain('aria-describedby="session-boundary"');
    expect(PAGE).toContain('id="intent-boundary"');
    expect(PAGE).toContain('aria-describedby="intent-boundary intent-status"');
    expect(PAGE).toContain('aria-live="polite"');
    expect(PAGE).toContain("SESSION_ONLY_NOTICE");
    expect(PAGE).toContain("CHANGE_INTENT_BOUNDARY");
  });

  it("exposes project selection state and a first-party brand mark", () => {
    expect(PAGE).toContain("aria-pressed={project.id === state.activeProjectId}");
    expect(PAGE).toContain('className="brandGlyph"');
    expect(PAGE).toContain('aria-label="Ineractive"');
  });
});
