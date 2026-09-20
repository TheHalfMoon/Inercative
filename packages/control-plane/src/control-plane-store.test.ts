import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  readControlPlaneSupabaseConfig,
  type ControlPlaneSupabaseConfig,
  type VerifiedControlPlaneActor,
} from "./control-plane-store.ts";

const ACTOR: VerifiedControlPlaneActor = {
  userId: "11111111-1111-4111-8111-111111111111",
  accessToken: "signed-user-access-token",
};

const CONFIG: ControlPlaneSupabaseConfig = {
  scope: "CONTROL_PLANE",
  url: "https://control-plane.example.supabase.co",
  publishableKey: "sb_publishable_control_plane",
};

const migrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260920192409_control_plane_user_project_store.sql",
    import.meta.url,
  ),
);

const configPath = fileURLToPath(new URL("../supabase/config.toml", import.meta.url));

function migrationSql(): string {
  return readFileSync(migrationPath, "utf8");
}

describe("control-plane Supabase configuration", () => {
  it("reads only dedicated server-side control-plane configuration", () => {
    expect(
      readControlPlaneSupabaseConfig({
        INERACTIVE_CONTROL_PLANE_SUPABASE_URL: CONFIG.url,
        INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: CONFIG.publishableKey,
      }),
    ).toEqual(CONFIG);
  });

  it("rejects service-role credentials", () => {
    expect(() =>
      readControlPlaneSupabaseConfig({
        INERACTIVE_CONTROL_PLANE_SUPABASE_URL: CONFIG.url,
        INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: CONFIG.publishableKey,
        SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
      }),
    ).toThrow(/forbidden/u);
  });

  it("rejects new-format Supabase secret keys even in the publishable-key slot", () => {
    expect(() =>
      readControlPlaneSupabaseConfig({
        INERACTIVE_CONTROL_PLANE_SUPABASE_URL: CONFIG.url,
        INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_privileged",
      }),
    ).toThrow(/forbidden/u);
  });

  it("rejects legacy service-role JWTs even in the publishable-key slot", () => {
    const payload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
    const legacyServiceRoleJwt = `header.${payload}.signature`;

    expect(() =>
      readControlPlaneSupabaseConfig({
        INERACTIVE_CONTROL_PLANE_SUPABASE_URL: CONFIG.url,
        INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: legacyServiceRoleJwt,
      }),
    ).toThrow(/forbidden/u);
  });

  it("rejects generated-application Supabase configuration at the trust boundary", () => {
    expect(() =>
      readControlPlaneSupabaseConfig({
        INERACTIVE_CONTROL_PLANE_SUPABASE_URL: CONFIG.url,
        INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: CONFIG.publishableKey,
        INERACTIVE_GENERATED_APP_SUPABASE_URL: "https://generated.example.supabase.co",
      }),
    ).toThrow(/Generated-application/u);
  });

  it("keeps the verified actor contract server-scoped", () => {
    expect(ACTOR.userId).toMatch(/^[0-9a-f-]{36}$/u);
    expect(ACTOR.accessToken.startsWith("NEXT_PUBLIC_")).toBe(false);
  });
});

describe("control-plane Supabase migration contract", () => {
  it("keeps Data API table exposure explicit", () => {
    const config = readFileSync(configPath, "utf8");

    expect(config).toContain("auto_expose_new_tables = false");
  });

  it("creates only the bounded control-plane profile/project/membership tables", () => {
    const sql = migrationSql();

    expect(sql).toContain("create table public.ineractive_profiles");
    expect(sql).toContain("create table public.ineractive_projects");
    expect(sql).toContain("create table public.ineractive_project_memberships");
    expect(sql).not.toMatch(/create\s+table\s+[^;]*(generated[_-](app|product)|product_data)/iu);
  });

  it("enables RLS on every exposed control-plane table", () => {
    const sql = migrationSql();

    for (const table of [
      "ineractive_profiles",
      "ineractive_projects",
      "ineractive_project_memberships",
    ]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("denies anon and grants authenticated roles explicitly", () => {
    const sql = migrationSql();

    expect(sql).toContain(
      "revoke all on table public.ineractive_projects from anon, authenticated",
    );
    expect(sql).toContain(
      "grant select, insert, update, delete on table public.ineractive_projects to authenticated",
    );
  });

  it("requires owner or membership predicates instead of role-only authorization", () => {
    const sql = migrationSql();

    expect(sql).toContain('create policy "projects_select_owner_or_member"');
    expect(sql).toContain("owner_user_id = (select auth.uid())");
    expect(sql).toContain("membership.user_id = (select auth.uid())");
    expect(sql).toContain('create policy "memberships_insert_owner"');
    expect(sql).toContain("project_owner_user_id = (select auth.uid())");
  });

  it("uses both USING and WITH CHECK for mutable owner-bound policies", () => {
    const sql = migrationSql();

    expect(sql).toMatch(
      /create policy "projects_update_owner"[\s\S]*using \(owner_user_id = \(select auth\.uid\(\)\)\)[\s\S]*with check \(owner_user_id = \(select auth\.uid\(\)\)\)/u,
    );
    expect(sql).toMatch(
      /create policy "memberships_update_owner"[\s\S]*using \(project_owner_user_id = \(select auth\.uid\(\)\)\)[\s\S]*with check \(project_owner_user_id = \(select auth\.uid\(\)\)\)/u,
    );
  });

  it("prevents owner membership duplication and binds membership rows to the project owner", () => {
    const sql = migrationSql();

    expect(sql).toContain("foreign key (project_id, project_owner_user_id)");
    expect(sql).toContain("references public.ineractive_projects(id, owner_user_id)");
    expect(sql).toContain("check (user_id <> project_owner_user_id)");
  });
});
