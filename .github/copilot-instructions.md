# Project Guidelines

## Overview
Calendar Booking Website for Dungeons & Dragons Campaigns.
Players and Dungeon Masters can create/join campaigns and book session dates.
Stack: Next.js 14 (App Router) · Tailwind CSS · Prisma · PostgreSQL (Supabase) · NextAuth.js · Vercel.

## Architecture
- `src/app/` — Next.js App Router pages and layouts
- `src/app/api/` — API Routes (backend logic via Next.js route handlers)
- `src/components/` — Shared React components
- `src/lib/` — Prisma client singleton, NextAuth config, utility helpers
- `prisma/` — Schema (`schema.prisma`) and migrations

**Core entities:** `User`, `Campaign`, `Booking`, `Date`
- A `User` can be a Player or Dungeon Master
- A `Campaign` is owned by a DM (`User`)
- A `Booking` links a `User` + `Campaign` + `Date` with status `pending | confirmed | cancelled`
- A `Date` stores `starts_at`, `ends_at`, `timezone`, and `is_recurring`

## Build and Test
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- DB push (dev): `npx prisma db push`
- DB migrate (prod): `npx prisma migrate deploy`
- Prisma Studio: `npx prisma studio`
- Lint: `npm run lint`

## Conventions
- Use **server components** by default; add `"use client"` only when needed (event handlers, hooks)
- API routes live in `src/app/api/[resource]/route.ts` — one file per HTTP method group
- Prisma client imported from `src/lib/prisma.ts` (singleton pattern to avoid hot-reload leaks)
- Auth session accessed via `getServerSession(authOptions)` in server components/routes
- Booking status typed as Prisma enum `BookingStatus` — never use raw strings
- Environment variables: `.env.local` for dev, Vercel dashboard for prod (see `.env.example`)
- Supabase connection string uses `?pgbouncer=true&connection_limit=1` for serverless compatibility
