import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: supabaseMocks.createClient,
}));

import { createVerifiedControlPlaneStore, readControlPlaneSupabaseConfig } from "./control-plane-store.ts";
import { SupabaseRunEventStore } from "./run-event-store.ts";
import { SupabaseRunStore } from "./run-store.ts";

const ACTOR = {
  userId: "11111111-1111-4111-8111-111111111111",
  accessToken: "signed-user-access-token",
} as const;

const PROJECT_ID = "55555555-5555-4555-8555-555555555555";
const CONFIG = readControlPlaneSupabaseConfig({
  INERACTIVE_CONTROL_PLANE_SUPABASE_URL: "https://control-plane.example.supabase.co",
  INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_control_plane",
});

function fakeClient() {
  return {
    auth: {
      getUser: supabaseMocks.getUser,
    },
  };
}

describe("verified durable control-plane storage boundary", () => {
  beforeEach(() => {
    supabaseMocks.createClient.mockReset();
    supabaseMocks.getUser.mockReset();
    supabaseMocks.getUser.mockResolvedValue({
      data: { user: { id: ACTOR.userId } },
      error: null,
    });
    supabaseMocks.createClient.mockReturnValue(fakeClient());
  });

  it("creates Run/Event stores only after verified actor authentication", async () => {
    const controlPlane = await createVerifiedControlPlaneStore(CONFIG, ACTOR);
    const stores = controlPlane.durableStoresForProject(PROJECT_ID);

    expect(supabaseMocks.createClient).toHaveBeenCalledWith(
      CONFIG.url,
      CONFIG.publishableKey,
      expect.objectContaining({
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${ACTOR.accessToken}`,
          },
        },
      }),
    );
    expect(supabaseMocks.getUser).toHaveBeenCalledWith(ACTOR.accessToken);
    expect(stores.runs).toBeInstanceOf(SupabaseRunStore);
    expect(stores.events).toBeInstanceOf(SupabaseRunEventStore);
    expect(Object.isFrozen(stores)).toBe(true);
  });

  it("rejects project identifiers before constructing project-scoped stores", async () => {
    const controlPlane = await createVerifiedControlPlaneStore(CONFIG, ACTOR);

    expect(() => controlPlane.durableStoresForProject("not-a-project-uuid")).toThrow(
      /Project id must be a UUID/u,
    );
  });

  it("does not expose durable stores when Supabase Auth disagrees with the verified actor", async () => {
    supabaseMocks.getUser.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null,
    });

    await expect(createVerifiedControlPlaneStore(CONFIG, ACTOR)).rejects.toThrow(
      /identity could not be verified/u,
    );
  });
});
