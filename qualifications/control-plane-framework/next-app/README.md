# Control-Plane Framework Qualification Fixture

This is a disposable SG-000009 qualification fixture, **not** the Ineractive product
shell.

Pinned candidate:

- Next.js 16.3.5;
- React 19.3.0;
- React DOM 19.3.0;
- Node 24.x;
- pnpm 12.4.2.

It exists only to prove the selected framework baseline can:

1. install from an exact lockfile;
2. produce a production build on the repository Node baseline;
3. emit a standalone self-hostable server;
4. return `INERACTIVE_CONTROL_PLANE_FRAMEWORK_QUALIFIED` over HTTP.

The real project/workspace shell remains owned by IN-P01-S03-T01.
