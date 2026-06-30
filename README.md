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

## Manual Monetization (MVP)

AuraCheck uses a **manual UPI payment flow** — no Razorpay, no Stripe, no payment API.

### How it works

1. User clicks "Unlock" on a product (₹99 / ₹299 / ₹499).
2. User sees UPI payment instructions with the owner's UPI ID.
3. User copies UPI details, opens their UPI app, and pays.
4. User submits payment details (name, contact, UPI ref) via the unlock page.
5. A local order is saved in the browser's localStorage.
6. User sends the payment summary to the owner/admin via WhatsApp or manually.
7. Admin (via `/admin`) sees the order, generates an unlock code, and shares it.
8. User enters the unlock code on the unlock page.
9. Product unlocks — report/audit/plan is generated locally.

### Products

| Product | Price | Code Prefix |
|---|---|---|
| Full Aura Report | ₹99 | AURA-XXXXXX |
| Dating/Profile Audit | ₹299 | DATE-XXXXXX |
| 30-Day Glow-Up Plan | ₹499 | GLOW-XXXXXX |

### Admin panel

- URL: `/admin`
- Gate code: `ADMINDEMO` (configurable via `NEXT_PUBLIC_LOCAL_ADMIN_CODE`)
- Shows all orders, analytics, and export tools
- Generate unlock codes per order
- Copy codes and mark statuses

### Important notes

- **No automatic payment verification.** UPI payments are not verified by this app. Users pay manually and share the summary with the owner.
- **No Razorpay or payment API.** This is a manual MVP flow for demand testing.
- **Not production-secure.** The admin gate uses a hardcoded code and sessionStorage. Do not use this as a real admin authentication system.
- **All data stays local.** Orders, audits, analytics — all stored in browser localStorage.
- **Scores are guidance, not objective truth.**
- **AuraCheck analyzes presentation, not human worth.**
- **No external AI service is used in this MVP.**

## Safety & Trust

- Do not claim automatic payment verification.
- Do not claim guaranteed dating, social, or career outcomes.
- Profile guidance is for presentation clarity, not dating guarantees.
- Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.
- No protected attributes (caste, religion, ethnicity, sexuality, health details, exact income) are collected.
- No body shaming. Archetypes describe presentation style, not identity or worth.
