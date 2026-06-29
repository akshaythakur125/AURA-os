# AuraCheck

First-impression intelligence for the modern age.

AuraCheck analyzes photos, profiles, outfits, and visual presentation to identify status leaks and provide upgrade paths — all in your browser with no external APIs.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- ESLint

## Architecture

- All logic runs client-side
- localStorage for data persistence
- No external APIs, databases, or authentication
- Manual UPI payment flow (MVP)

## Routes

- `/` — Homepage
- `/dashboard` — User dashboard
- `/audit/new` — New aura check
- `/pricing` — Pricing & products
- `/unlock` — Unlock purchased report
- `/admin` — Admin panel
- `/privacy` — Privacy policy
- `/terms` — Terms of service

## Environment Variables

Copy `.env.example` to `.env.local` and fill in as needed. Most features work without configuration.
