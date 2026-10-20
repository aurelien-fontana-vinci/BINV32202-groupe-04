# Instructions for coding agents

Gesta is an npm-workspaces project with a React/TypeScript frontend and an Express/TypeScript backend using SQLite.

## Start here

- Read [README.md](README.md) for setup, supported Node versions, and available commands.
- Read [docs/architecture.md](docs/architecture.md) before changing behavior across layers.
- Consult [backend/API.md](backend/API.md) for API contracts, [docs/seed.md](docs/seed.md) for demo data, and [docs/cdc_gesta_developpement.md](docs/cdc_gesta_developpement.md) for requirements.

## Working conventions

- Use the root npm scripts and workspace commands; Node.js 22.14 or newer is required. Run `npm run setup` once after `npm ci` to configure the local environment and database.
- Backend: keep HTTP validation/responses in controllers, business rules in services, SQL in repositories, and conversions in mappers. Services must not depend on Express `Request` or `Response`; report expected failures with `HttpError`.
- Database: add a new numbered SQL migration for schema changes; do not edit migrations that have already been applied.
- Frontend: follow the existing pages → hooks → services/utils → models structure. Keep reusable components independent of route details, and preserve the single `useAuth` owner in `App.tsx`.
- Add or update tests with behavior changes. Backend tests use an in-memory SQLite database; frontend tests use Vitest and Testing Library with mocked fetch. Never point tests at the development database.

## Validation

- Run the relevant workspace tests and typecheck/lint scripts for the area changed.
- Run `npm run check` for the full lint, typecheck, test, and build gate before significant integration changes.