# Control-Plane Framework Qualification Fixture

This directory is a disposable SG-000009 fixture. It is **not** the Ineractive product shell.

Pinned candidate:

- Next.js 16.3.5;
- React 19.3.0;
- React DOM 19.3.0;
- Node 24.x;
- pnpm 12.4.2.

Acceptance requires:

1. a clean pinned install;
2. `pnpm build`;
3. `pnpm start` on Node 24;
4. HTTP 200 containing `INERACTIVE_CONTROL_PLANE_FRAMEWORK_OK`.

The nested `pnpm-workspace.yaml` intentionally isolates this fixture from the root workspace. No production endpoint, secret, provider resource, or user data is used.
