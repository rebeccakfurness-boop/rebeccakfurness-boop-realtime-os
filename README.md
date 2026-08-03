# Realtime OS

The internal operating system for Rebecca Furness's speaking and advisory business,
"Realtime." One backend, three portals:

- **Staff Admin** (`/staff`) — 90-day goals, CRM customer cards, sales pipeline, calendar,
  time tracking, finance, internal documents.
- **Student Portal** (`/student`) — personal goals, scholarship search, resources, CV
  builder, scholarship application builder, cover letter builder.
- **Business Customer Portal** (`/business`) — scholarship search, resources, self-serve
  meeting booking, and a read-only status view of the relationship.

## Stack

- **Next.js 16** (App Router, Server Components + Server Actions), React 19, TypeScript
- **Tailwind CSS v4** for the design system (`src/app/globals.css` `@theme` tokens)
- **PostgreSQL + Prisma 6** (`prisma/schema.prisma`)
- **Auth.js v5** (`next-auth@beta`) — Credentials (email/password) and Email (magic link)
  providers, JWT sessions with a custom `role`/`orgId` claim, role-based route guarding in
  `src/middleware.ts`
- **dnd-kit** for drag-and-drop (goal task reordering, pipeline stage dragging)
- **Recharts** for the Finance cashflow chart
- **@anthropic-ai/sdk** for the AI rewrite/polish features

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000. Sign in as one of the seeded accounts (all `password123`):

| Role              | Email                            |
| ----------------- | --------------------------------- |
| Staff             | `rebecca@realtime.local`          |
| Staff             | `ops@realtime.local`              |
| Student           | `student@realtime.local`          |
| Business customer | `careers@northfield.school.nz`    |

## Environment variables

See `.env.example` for the full list with comments. Everything below `AUTH_SECRET` /
`NEXTAUTH_URL` is optional in development: the app runs fully against mock integrations
until real credentials are supplied.

| Variable                                  | Enables                                   |
| ------------------------------------------ | ------------------------------------------ |
| `EMAIL_SERVER_*`, `EMAIL_FROM`             | Real magic-link emails (dev prints to console instead) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Real Gmail sync and Google Calendar availability/booking |
| `XERO_CLIENT_ID` / `XERO_CLIENT_SECRET`     | Real Xero bank-feed sync (CSV import always works) |
| `ANTHROPIC_API_KEY`                        | Real "Customise with AI" / "Polish with AI" calls (`claude-opus-5`) |

## Integration abstraction layers

Every third-party integration that needs live credentials is implemented as a clean
interface + mock implementation + environment-gated factory, in `src/lib/integrations/`:

- `gmail.ts` — email threading on Customer Cards
- `calendar.ts` — meeting availability and booking (staff, business self-serve, and the
  public booking link all go through the same `createCalendarClient()`)
- `bank-feed.ts` — bank transaction sync (`syncBankFeed` action on the Finance page; CSV
  import is the primary path either way)
- `ai.ts` — brand-voice document rewriting and student writing polish

Each `create*Client()` factory returns a real client when the relevant environment
variables are set, and otherwise falls back to a mock that returns clearly-labelled
placeholder data (never silently fake output) so every feature is fully usable in
development without any real credentials.

## Known issues

- dnd-kit's internal `aria-describedby` id counter produces a benign SSR/CSR hydration
  mismatch warning in the browser console on pages using drag-and-drop (Goals, Pipeline).
  It doesn't affect functionality: drag state and persisted order are correct. Fixing it
  cleanly would mean deferring all dnd-kit rendering to a client-only mount, which wasn't
  judged worth the extra loading-state complexity for a cosmetic console warning.
- The Next.js "middleware" file convention is deprecated in favour of "proxy" as of this
  Next.js version; `src/middleware.ts` still works but will need renaming on a future
  Next.js upgrade.

## Project structure

```
prisma/schema.prisma       Data model
prisma/seed.ts             Seed data (staff, one school org, one student, scholarships, resources)
src/auth.ts                 Full Auth.js config (Node runtime)
src/auth.config.ts          Edge-safe Auth.js config, used by middleware
src/middleware.ts            Role-based route guarding
src/lib/actions/            Server Actions, one file per module
src/lib/integrations/       Third-party integration abstraction layers
src/components/             UI, grouped by module
src/app/staff/               Staff Admin routes
src/app/student/             Student Portal routes
src/app/business/            Business Customer Portal routes
```
