# Project Guidelines

## Overview
This is a **Calendar Booking Website for Dungeons & Dragons Campaigns**.
Players can browse campaigns, book sessions, and track their booking status.
Dungeon Masters can create and manage campaigns and session dates.

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes (`src/app/api/`)
- **Database:** PostgreSQL hosted on Supabase, accessed via Prisma ORM
- **Auth:** NextAuth.js (JWT strategy, login at `/login`)
- **Hosting:** Vercel (app) + Supabase (database)

## Database Schema
Four models defined in `prisma/schema.prisma`:

- **User** — `id`, `username`, `email`, `passwordHash`, `role (DM|PLAYER)`, `characterName`, `characterClass`
- **Campaign** — `id`, `dmId (→ User)`, `campaignName`, `description`, `difficulty (EASY|MEDIUM|HARD|DEADLY)`, `maxPartySize`
- **Date** — `id`, `startsAt`, `endsAt`, `timezone`, `isAvailable`, `isRecurring`, `location`
- **Booking** — `id`, `userId (→ User)`, `campaignId (→ Campaign)`, `dateId (→ Date)`, `status (pending|confirmed|cancelled)`, `notes`

Unique constraint: `Booking(userId, campaignId, dateId)` — no duplicate bookings.

## Code Style
- TypeScript strict mode throughout
- Tailwind CSS for all styling — no CSS modules or inline styles
- All shared types live in `src/types/index.ts`
- Prisma client singleton is in `src/lib/prisma.ts` — always import from there, never instantiate directly
- NextAuth config is in `src/lib/auth.ts` — export `authOptions`, import in the route handler

## Architecture
```
src/
├── app/               # Pages (Next.js App Router)
│   ├── (auth)/        # login, register
│   ├── dashboard/     # Player view
│   ├── campaigns/     # Browse, detail [id], new
│   ├── bookings/      # My bookings, detail [id]
│   ├── dm/            # DM dashboard, campaigns, sessions
│   └── api/           # API route handlers
├── components/        # ui/, layout/, campaigns/, bookings/, calendar/, auth/
├── lib/               # prisma.ts, auth.ts, supabase.ts, utils.ts
├── hooks/             # useBookings, useCampaigns, useSession
└── types/index.ts     # All shared TypeScript interfaces
```

API routes follow REST conventions:
- `GET/POST /api/campaigns` — list / create
- `GET/PATCH/DELETE /api/campaigns/[id]` — single resource
- Same pattern for `/api/bookings` and `/api/dates`

## Build and Test
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Push DB schema: `npx prisma db push`
- Regenerate Prisma client: `npx prisma generate`

## Conventions
- API routes live under `src/app/api/` (not `src/api/`) — required by Next.js App Router
- Difficulty enum values are uppercase: `EASY`, `MEDIUM`, `HARD`, `DEADLY`
- BookingStatus values are lowercase: `pending`, `confirmed`, `cancelled`
- Use `cuid()` for all primary keys (already set as default in schema)
- Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never commit `.env.local` — it is in `.gitignore`
