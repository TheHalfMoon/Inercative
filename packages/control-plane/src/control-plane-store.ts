import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const CONTROL_PLANE_SCOPE = "CONTROL_PLANE" as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export interface ControlPlaneSupabaseConfig {
  readonly scope: typeof CONTROL_PLANE_SCOPE;
  readonly url: string;
  readonly publishableKey: string;
}

export interface VerifiedControlPlaneActor {
  readonly userId: string;
  readonly accessToken: string;
}

export interface ControlPlaneProject {
  readonly id: string;
  readonly ownerUserId: string;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateControlPlaneProjectInput {
  readonly name: string;
  readonly slug: string;
}

interface ProjectRow {
  readonly id: string;
  readonly owner_user_id: string;
  readonly name: string;
  readonly slug: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export type ControlPlaneEnvironment = Readonly<Record<string, string | undefined>>;

function requireServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new Error("Control-plane Supabase repository is server-only.");
  }
}

function requireNonEmpty(value: string | undefined, name: string): string {
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing required server-only environment variable ${name}.`);
  }
  return value;
}

export function readControlPlaneSupabaseConfig(
  environment: ControlPlaneEnvironment,
): ControlPlaneSupabaseConfig {
  const url = requireNonEmpty(
    environment.INERACTIVE_CONTROL_PLANE_SUPABASE_URL,
    "INERACTIVE_CONTROL_PLANE_SUPABASE_URL",
  );
  const publishableKey = requireNonEmpty(
    environment.INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY,
    "INERACTIVE_CONTROL_PLANE_SUPABASE_PUBLISHABLE_KEY",
  );

  if (
    environment.NEXT_PUBLIC_INERACTIVE_CONTROL_PLANE_SUPABASE_SECRET_KEY !== undefined ||
    environment.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY !== undefined ||
    environment.SUPABASE_SERVICE_ROLE_KEY !== undefined
  ) {
    throw new Error("Service-role/secret Supabase credentials are forbidden for this store.");
  }

  if (
    environment.INERACTIVE_GENERATED_APP_SUPABASE_URL !== undefined ||
    environment.INERACTIVE_GENERATED_APP_SUPABASE_KEY !== undefined
  ) {
    throw new Error("Generated-application Supabase configuration cannot initialize the control-plane store.");
  }

  return {
    scope: CONTROL_PLANE_SCOPE,
    url,
    publishableKey,
  };
}

function validateActor(actor: VerifiedControlPlaneActor): void {
  if (!UUID_PATTERN.test(actor.userId)) {
    throw new Error("Verified actor userId must be a UUID.");
  }
  if (actor.accessToken.trim().length === 0) {
    throw new Error("Verified actor access token must not be empty.");
  }
}

function normalizeProjectInput(input: CreateControlPlaneProjectInput): CreateControlPlaneProjectInput {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();

  if (name.length === 0 || name.length > 120) {
    throw new Error("Project name must contain 1-120 non-whitespace characters.");
  }
  if (slug.length === 0 || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    throw new Error("Project slug must be 1-80 lowercase kebab-case characters.");
  }
  return { name, slug };
}

function mapProject(row: ProjectRow): ControlPlaneProject {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function projectColumns(): string {
  return "id,owner_user_id,name,slug,created_at,updated_at";
}

export class SupabaseControlPlaneStore {
  public constructor(
    private readonly client: SupabaseClient,
    private readonly actor: VerifiedControlPlaneActor,
  ) {
    validateActor(actor);
  }

  public async ensureProfile(displayName: string | null): Promise<void> {
    const normalizedName = displayName?.trim() || null;
    const { error } = await this.client.from("ineractive_profiles").upsert(
      {
        user_id: this.actor.userId,
        display_name: normalizedName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error !== null) {
      throw new Error(`Control-plane profile upsert failed: ${error.message}`);
    }
  }

  public async listProjects(): Promise<readonly ControlPlaneProject[]> {
    const { data, error } = await this.client
      .from("ineractive_projects")
      .select(projectColumns())
      .order("created_at", { ascending: false });

    if (error !== null) {
      throw new Error(`Control-plane project list failed: ${error.message}`);
    }
    return (data as unknown as ProjectRow[]).map(mapProject);
  }

  public async getProject(projectId: string): Promise<ControlPlaneProject | null> {
    if (!UUID_PATTERN.test(projectId)) {
      throw new Error("Project id must be a UUID.");
    }
    const { data, error } = await this.client
      .from("ineractive_projects")
      .select(projectColumns())
      .eq("id", projectId)
      .maybeSingle();

    if (error !== null) {
      throw new Error(`Control-plane project read failed: ${error.message}`);
    }
    return data === null ? null : mapProject(data as unknown as ProjectRow);
  }

  public async createProject(
    input: CreateControlPlaneProjectInput,
  ): Promise<ControlPlaneProject> {
    const normalized = normalizeProjectInput(input);
    const { data, error } = await this.client
      .from("ineractive_projects")
      .insert({
        owner_user_id: this.actor.userId,
        name: normalized.name,
        slug: normalized.slug,
      })
      .select(projectColumns())
      .single();

    if (error !== null) {
      throw new Error(`Control-plane project create failed: ${error.message}`);
    }
    return mapProject(data as unknown as ProjectRow);
  }
}

export async function createVerifiedControlPlaneStore(
  config: ControlPlaneSupabaseConfig,
  actor: VerifiedControlPlaneActor,
): Promise<SupabaseControlPlaneStore> {
  requireServerRuntime();
  validateActor(actor);
  if (config.scope !== CONTROL_PLANE_SCOPE) {
    throw new Error("Invalid Supabase trust domain for control-plane store.");
  }

  const client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${actor.accessToken}`,
      },
    },
  });

  const { data, error } = await client.auth.getUser(actor.accessToken);
  if (error !== null || data.user?.id !== actor.userId) {
    throw new Error("Control-plane actor identity could not be verified by Supabase Auth.");
  }

  return new SupabaseControlPlaneStore(client, actor);
}
