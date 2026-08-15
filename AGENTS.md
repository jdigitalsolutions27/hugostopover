<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hugo’s Stop Over repository guide

## Structure

- `src/app`: App Router public pages, protected admin route group, route handlers, and SEO files.
- `src/actions`: authenticated Server Actions. Every mutation must validate input and authorize within the action.
- `src/data`: the Supabase repository boundary plus public-only draft seed fallback.
- `src/lib/supabase`: browser/server/proxy clients. Never introduce the service-role key into runtime code.
- `supabase/migrations`: immutable PostgreSQL schema, RLS, storage, audit, rate-limit, and seed migrations.
- `tests/e2e`: Playwright desktop/mobile public and auth flows.

## Commands

Use `npm run dev`, `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`. Run `npx next typegen` after adding or renaming routes if generated route helpers are stale.

## Conventions

- Strict TypeScript, Server Components by default, and small Client Component boundaries for interaction.
- Tailwind utility classes and brand CSS variables from `src/app/globals.css`; use accessible semantic markup and visible focus states.
- Validate client and server input with Zod. Store structured plain text/JSON; do not add raw HTML rendering.
- Use Philippine peso formatting and `Asia/Manila` for business-facing dates.
- Use Next/Image for raster media and require meaningful alt text for published uploads.
- Preserve the zero-price-as-“Ask for price” behavior until an owner confirms a price.

## Database and security

- RLS is mandatory on every public-schema table. Public access is limited to published/visible DTOs.
- Authenticate and authorize inside every Server Action/Route Handler; Proxy is only an optimistic redirect layer.
- Owners manage settings, users, invitations, and destructive actions. Editors manage catalog/content. Staff are limited to products, permitted media operations, and inquiry workflow; enforce this in both server authorization and RLS.
- Never commit secrets, `.env.local`, real customer data, or a service-role key.
- Preserve soft deletion and audit logging for important mutations. Validate upload MIME, extension, signature, and size.
- New tables require constraints, indexes, timestamps, RLS policies, and a migration.

## Completion checks

Before handoff run formatting check, ESLint, TypeScript, Vitest, Playwright, and an optimized production build. Review phone/tablet/laptop/desktop layouts, empty/error/loading states, auth redirects, and the final diff for secrets and authorization regressions.
