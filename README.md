# Hugo’s Stop Over

A production-oriented public website and secure content-management dashboard for **Hugo’s Stop Over**, a Filipino food and pasalubong business near the Sta. Fe–Alangalang boundary in Leyte, Philippines.

The public site showcases the menu and turns visits into calls, Facebook messages, and structured inquiries. It is intentionally catalog-first—there is no cart or checkout. The protected admin lets the owner manage products, prices, images, categories, homepage/page copy, contact details, hours, testimonials, promotions, inquiries, SEO fields, brand settings, and administrator roles without editing code.

> The included business story, product descriptions, phone, hours, address, map location, prices, and generated hero image are draft content. The dashboard marks the relevant records for owner confirmation before launch. No fake testimonials, reviews, awards, or sales claims are seeded.

## Technology

- Next.js 16 App Router, React 19, and strict TypeScript
- Tailwind CSS 4 with CSS-variable brand tokens
- Accessible Radix-based UI primitives, Lucide icons, and Framer Motion
- Supabase PostgreSQL, email/password Auth, Row Level Security, and Storage
- React Hook Form and Zod validation
- Server Components for public content; secure Server Actions/Route Handlers for mutations
- Vitest, React Testing Library, and Playwright
- ESLint and Prettier

## Project structure

```text
src/
  actions/                 authenticated auth/admin Server Actions
  app/                     public pages, admin routes, APIs, SEO files
  components/              public, admin, and accessible UI components
  data/                    repository boundary and local draft seed fallback
  lib/                     auth, Supabase clients, validation, security utilities
  types/                   shared domain types
supabase/migrations/       schema/RLS/storage migration and editable seed data
tests/e2e/                 Playwright public, auth, form, and responsive flows
public/images/             original local placeholder artwork
```

The data repository reads Supabase whenever the public project variables are configured. Without them, public routes use the same curated draft seed records so design review and production builds remain possible. Admin mutation paths never use the fallback and never bypass authentication.

## Local setup

### Requirements

- Node.js 24 LTS (Node 22 LTS is also suitable for Vercel)
- npm 11+
- A Supabase project
- Supabase CLI for local migration workflows (optional if using the hosted SQL editor)

### Install and run

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Fill `.env.local` before testing admin functionality or inquiry persistence.

## Environment variables

| Variable                               | Required                   | Purpose                                                    |
| -------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Production/admin           | Supabase Project URL                                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production/admin           | Supabase publishable key; access remains restricted by RLS |
| `NEXT_PUBLIC_SITE_URL`                 | Production                 | Canonical origin, e.g. `https://hugosstopover.com`         |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional                   | Search Console HTML-tag verification token                 |
| `SERVER_ACTION_ALLOWED_ORIGINS`        | Only behind a custom proxy | Reserved list of proxy/CDN origins                         |

Never expose or commit `SUPABASE_SERVICE_ROLE_KEY`. This application does not require it at runtime. `.env*` is ignored except for the safe `.env.example` template.

## Supabase setup

1. Create a Supabase project in the closest practical region and save the database password in a password manager.
2. In Project Settings → API, copy the Project URL and publishable key into `.env.local` (and later Vercel).
3. Apply migrations in filename order:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

   Or paste each file from `supabase/migrations/` into the hosted SQL Editor in order.

4. The first migration creates all tables, indexes, audit triggers, the database-backed rate limiter, RLS policies, and the public `media` storage bucket with a 5 MB/type allowlist. No manual bucket setup is needed after a successful migration.
5. The second migration seeds categories, every requested product, page sections, and draft business settings. It seeds no testimonials.
6. The third migration assigns clearly provisional peso prices to all seeded products and leaves each `needs_review` flag enabled. The fourth migration adds structured controls for the shared header/footer, product pages, catalog labels, visit content, and image descriptions. The fifth adds Owner/Editor/Staff access, owner-approved email invitations, invitation auditing, and Staff-specific RLS. The sixth gives Menu, About, and Visit uniform editable photo heroes and retires the optional Gallery page without deleting stored media. These migrations preserve later owner-confirmed values.
7. In Authentication → URL Configuration:
   - Set Site URL to the production origin.
   - Add `http://localhost:3000/auth/callback` and `https://YOUR_DOMAIN/auth/callback` as redirect URLs.
8. Keep the application free of any public sign-up page. To let an Owner add a brand-new administrator without a runtime secret key, Supabase Auth’s **Allow new users to sign up** setting must be enabled. Every account created outside an owner-approved invitation receives an inactive profile and cannot enter the dashboard or access protected data.

### Create the first administrator securely

Do not hard-code credentials and do not add a service-role key to the website.

1. In Supabase Dashboard → Authentication → Users, choose **Add user** and create/invite the owner’s email with a strong temporary password. The database trigger creates an inactive `editor` profile automatically.
2. In the Supabase SQL Editor, run this one-time privileged statement, replacing the email:

   ```sql
   update public.profiles
   set role = 'owner', is_active = true
   where id = (
     select id from auth.users where lower(email) = lower('owner@example.com')
   );
   ```

3. Sign in at `/admin/login`, use **Forgot password** if the user was invited, and set a unique password of at least 12 characters.
4. For later administrators, sign in as an Owner and open **Team access**. Enter the person’s email, choose Staff, Editor, or Owner, and send the invitation. The recipient opens the Supabase email, the site verifies the owner-approved invitation at `/admin/accept-invite`, and the recipient creates a private password before opening the dashboard. Owners can revoke a pending invitation, use **Remove access** to block an account immediately, and restore a removed account later. Removal is deliberately reversible and retains the audit record. If an invitation created before this recipient-safe flow fails, send a new invitation to the same email to replace the old link.

## Database and security model

- Public/anonymous access can only select published/visible catalog and CMS records, and insert a tightly constrained inquiry.
- Authenticated profiles must be active and have an `owner`, `editor`, or `staff` role. Uninvited Auth accounts remain inactive.
- Owner-only policies protect business settings, administrator management, audit logs, and irreversible deletes.
- Staff can manage products, their own uploaded media, media descriptions, and inquiry workflow. Staff cannot manage categories, page content, testimonials, business settings, CSV exports, administrators, or permanent deletes.
- Editors add category, page, and testimonial management but still cannot manage Owners, business settings, or irreversible Owner-only actions.
- Server Actions re-check roles near every mutation; UI visibility is never treated as authorization.
- Product/category relations use `ON DELETE RESTRICT`; a category cannot be deleted while active products reference it.
- Important product, category, setting, and administrator changes are recorded in `audit_logs` by database triggers.
- Inquiry and login throttling uses the PostgreSQL `check_rate_limit` function with an in-process fallback only during database outages/local preview.
- Uploads are capped at 5 MB and validated by allowed extension, browser MIME, server-side MIME allowlist, and binary file signature before storage.
- Content is structured plain text/JSON; unsafe raw HTML is not rendered.
- Security headers cover CSP, frame protection, MIME sniffing, referrers, and browser permissions.

## Content administration

After signing in at `/admin/login`:

- **Overview:** review totals, unread inquiries, and products missing photos/descriptions/prices.
- **Products:** create/edit/duplicate, publish/draft, bulk availability, archive/restore/delete, badges, price, tags, SEO, visually selected main/gallery images, and drag-and-drop order.
- **Categories:** create/edit/hide/reorder/delete with relationship protection and a visual cover-image picker.
- **Pages & homepage:** work page-by-page on all public text, images, image descriptions, CTAs, section order/visibility, publication state, SEO, navigation, footer, product labels, and contact-form labels. Content stays structured—raw HTML is not accepted.
- **Business settings:** owner-only name, tagline, visually selected logo/favicon/default SEO image, colors, phone, email, address, map, hours, social links, announcement, and confirmation checklist.
- **Inquiries:** private inbox, read/status/notes, archive/delete, and CSV export.
- **Testimonials:** add only real sourced quotes, select an optional customer photo, then publish/unpublish/reorder/delete.
- **Media:** validated Supabase uploads, previews, search, alt text/caption, same-type file replacement, reusable URLs, and owner deletion.
- **Team access:** Owners send verified email invitations, assign Owner/Editor/Staff roles, revoke pending invitations, update roles, and disable accounts. No runtime Supabase secret key is used.

## Commands

```bash
npm run dev             # local development
npm run build           # optimized production build
npm run start           # serve the production build
npm run format          # write Prettier formatting
npm run format:check    # verify formatting
npm run lint            # ESLint with zero warnings
npm run typecheck       # strict TypeScript
npm run test            # Vitest + React Testing Library
npm run test:watch      # watch unit tests
npm run test:e2e        # desktop/mobile Playwright flows
npm run test:e2e:ui     # interactive Playwright runner
npm run verify          # formatting, lint, types, unit tests, build
npx playwright install chromium
```

Playwright covers public conversion content, menu search/detail visibility, contact validation, protected admin routing, mobile navigation, and 320/768/1366/1920 horizontal-overflow checks.

## Deploy to Vercel

1. Push the repository to a private or business-owned Git provider repository.
2. Import it into Vercel as a Next.js project; keep the default build command `npm run build`.
3. Add the three required production variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`) to Production and Preview as appropriate.
4. Apply Supabase migrations before promoting the Vercel deployment.
5. Add the final Vercel/custom domains to Supabase Auth redirect URLs.
6. Deploy, sign in, replace the generated/local placeholder image with owner-approved photography, confirm every dashboard review flag, and submit a real test inquiry.
7. Run Lighthouse against the production URL in an incognito window. Image-heavy scores depend on replacing uploads with correctly cropped, compressed WebP/AVIF owner photos.

## Local SEO and search indexing

The site publishes canonical metadata, crawl rules, an XML sitemap, a specific
Leyte food-stop landing page, exact geographic structured data, and editable
local-business content. These signals help search engines understand the
business, but no website can guarantee a particular Google position.

After deployment, the business owner should:

1. Create or open a Google Search Console **Domain property** for
   `hugostopover.com` and verify it with the DNS TXT record Google supplies.
2. Submit `https://hugostopover.com/sitemap.xml` in Search Console, then inspect
   and request indexing for `/`, `/food-stop-over-leyte`, `/menu`, and `/visit`.
3. Claim and verify the Hugo's Stop Over Google Business Profile. Keep its name,
   category, exact pin, phone, hours, website, and menu URL consistent with the
   website.
4. Add recent owner-approved food, storefront, signboard, and interior photos to
   both the website and Business Profile. Update changed hours promptly.
5. Ask real customers for honest Google reviews without incentives or prepared
   wording, and reply professionally. Never create or purchase reviews.
6. Seek relevant, genuine links and mentions from Leyte tourism, local business,
   community, and supplier sites. Avoid bulk directory or paid-link schemes.

Search Console discovery and ranking changes are not immediate. Monitor its
Indexing and Performance reports instead of repeatedly changing titles or
stuffing pages with the same phrase.

## Backup and restore

- Enable Supabase Point-in-Time Recovery for the production plan if available.
- Schedule `supabase db dump` or `pg_dump` backups before bulk content changes and before migrations.
- Export/copy the `media` storage bucket separately; database backups do not include Storage objects.
- Test restores in a separate Supabase project, then update environment variables only after validation.
- Keep the generated migration files immutable after production use; create a new migration for schema changes.

## Troubleshooting

- **Admin loops to login:** confirm the user’s `profiles.is_active = true`, role is `owner`/`editor`, environment variables are correct, and Site/redirect URLs match the browser origin.
- **Public content shows draft fallback:** Supabase variables are absent/unavailable or migrations were not applied.
- **Upload rejected:** use JPEG/PNG/WebP/AVIF below 5 MB; renaming a non-image extension will not bypass binary validation.
- **Inquiry returns 503 locally:** connect Supabase. The fallback intentionally does not pretend to persist submissions.
- **Password email does not arrive:** verify Supabase SMTP/Auth email settings and allowed redirect URLs; the UI intentionally never confirms whether an email exists.
- **Administrator invite fails:** confirm Auth allows new users, the local/production `/admin/accept-invite` URL is allowed, and Supabase’s email rate limit has not been reached. The redirect allowlist may use `https://YOUR_DOMAIN/**` to cover both invitation acceptance and password recovery. Production should use configured custom SMTP for reliable delivery. Resend invitations created before the current recipient-safe flow.
- **Build font/network issue:** retry with network access so `next/font` can resolve Fraunces and Manrope, or self-host those fonts if the build environment is offline.
- **Migration category delete error:** reassign or archive referenced products first.

## Launch confirmation checklist

- Official logo, favicon, and owned food/store photography
- Exact address/map pin and visit directions
- Phone, email, regular hours, and holiday schedule
- Product prices, serving/package sizes, ingredients/allergens, availability, and pre-order lead times
- Official founding story, mission, values, and team/store photos
- Permission and exact source for each testimonial/customer photo
- Final domain, analytics/consent decision, and Facebook Messenger behavior
