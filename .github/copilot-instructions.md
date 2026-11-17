# Copilot instructions for Gesta

Gesta is an npm-workspaces application: a React/TypeScript frontend, an Express/TypeScript API, and SQLite. Node.js 22.14 or newer is required.

Pour tout ajout de fonctionnalité ou correction de bug, lis et applique
.github/skills/test-driven-development/SKILL.md avant de modifier le code
de l’application. Écris et exécute les tests d’abord, présente-les, puis attends
leur validation explicite avant l’implémentation. Cette règle ne concerne pas les
demandes d’explication ou de documentation seules.
## Setup and commands

Run commands from the repository root.

```bash
npm ci
npm run setup                 # once after install: creates backend/.env and initializes the database
npm run dev                   # API and Vite frontend
npm run check                 # lint, typecheck, tests, and builds for both workspaces
```

Run checks for one workspace when possible:

```bash
npm run lint -w backend
npm run typecheck -w backend
npm run test -w backend
npm run test -w backend -- tests/applications.test.ts
npm run test -w backend -- tests/applications.test.ts -t "refuse une offre non publiée"

npm run lint -w frontend
npm run typecheck -w frontend
npm run test -w frontend
npm run test -w frontend -- tests/ApplicationsPage.test.tsx
npm run test -w frontend -- tests/ApplicationsPage.test.tsx -t "affiche les statuts"
```

Tests use Vitest. Backend API tests use Supertest with an in-memory SQLite database and `tests/helpers/testApp.ts`; never run tests against the development database. Frontend tests use Vitest, Testing Library, jsdom, and mocked `fetch` from `tests/helpers/fetchMock.ts`.

## Architecture

The backend request path is `app.ts` → authentication/authorization middleware → controller → service → repository → SQLite. Controllers own HTTP parsing, validation, and response codes; services contain business rules and raise expected failures with `HttpError`; repositories own SQL; mappers convert database rows to domain objects and API DTOs. `app.ts` assembles these layers. Keep services independent of Express `Request` and `Response`; the central error handler formats errors as JSON.

The frontend follows `pages → hooks → services/utils → models`, with reusable components kept independent of route details. `App.tsx` is the sole owner of `useAuth` and passes the session token and unauthorized callback to pages. Frontend services call `/api/...`, check HTTP responses, and validate response JSON with the handwritten guards in `frontend/src/utils/guards.ts`; Vite proxies `/api` to the backend and removes that prefix.

The full layer map and implemented workflows are in [docs/architecture.md](../docs/architecture.md). Check [backend/API.md](../backend/API.md) for API contracts, [docs/cdc_gesta_developpement.md](../docs/cdc_gesta_developpement.md) for requirements, and [docs/seed.md](../docs/seed.md) for demo data.

## Repository-specific conventions

- Keep all HTTP-specific concerns in backend controllers, business rules in services, SQL in repositories, and DTO/domain/database conversions in mappers.
- Add a new numbered SQL migration for schema changes. Never edit a migration that may already have been applied.
- Backend relative TypeScript imports include the `.ts` extension; the build rewrites them to `.js`.
- The `Authorization` header contains the session token directly, without a `Bearer` prefix. Authentication reloads the account and its roles from the database on each request.
- Reuse stable IDs from `backend/src/db/seed/seedIds.ts` in backend tests.
- Preserve the single `useAuth` call in `frontend/src/App.tsx`. Keep route-specific behavior in pages and reusable UI in components.
- When changing behavior, update the nearest tests. Follow the project TDD workflow in [the test-driven-development skill](./skills/obrasuperpowersmainskills-test-driven-development/SKILL.md).
- Keep API status/error codes and response shapes consistent with [backend/API.md](../backend/API.md).

For general repository workflow and validation guidance, also follow [AGENTS.md](../AGENTS.md) and [README.md](../README.md).
