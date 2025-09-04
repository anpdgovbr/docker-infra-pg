Title: feat: optional post-up hook to run root compose or custom command

Summary

- Adds a generic, optional post-up hook to docker-infra-pg that can trigger the project's root docker compose (or a custom command) right after infra up completes.
- Keeps behavior fully opt-in and safe, supporting auto/manual modes and easy disable via env.

Changes

- docker-helper.js
  - New helpers: detectRootCompose, detectComposeBin, promptYesNo, getUpMode, shouldDisableHook, runPostUpIfNeeded.
  - `up` command now calls `runPostUpIfNeeded` after bringing infra up.
- README.md
  - Documents the post-up hook feature, env vars, flags, and examples.
- docs/comandos.md
  - Highlights the optional post-up in daily workflows and adds `infra:up:manual` example.

Usage

- Defaults to auto if a root compose file exists:
  - `npm run infra:up` → infra-db up + root `docker compose up -d`.
- Manual mode:
  - `node .infra/docker-helper.js up --manual` or `INFRA_UP_MODE=manual npm run infra:up`.
- Disable completely:
  - `INFRA_POST_UP_DISABLE=1 npm run infra:up`.
- Custom command:
  - `INFRA_POST_UP_CMD="docker compose -f compose.override.yml up -d" npm run infra:up`.

Rationale

- Many ANPD projects (e.g., deploy of Keycloak) want to start dependent services as soon as the DB infra is up. A generic post-up hook solves this without hardcoding stack specifics, remaining useful for many other projects.

Notes

- Compose detection prefers `docker compose` and falls back to `docker-compose`.
- If no compose is present and no custom command is set, the hook is a no-op.
- Interactive prompt works only on TTY; in CI, it defaults to non-interactive behavior.

Checklist

- [x] Backward compatible (default behavior remains the same when no compose/custom cmd present)
- [x] Cross-platform (Windows, macOS, Linux)
- [x] Docs updated (README, docs/comandos.md)
- [x] Safe by default; explicit opt-out/in controls
