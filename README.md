# AuraCheck

**Find your biggest status leak.**

AuraCheck is a first-impression and status-signal audit app for Indian youth. Upload photos or profile screenshots to receive an "Aura Score," status-leak analysis, and upgrade suggestions — all powered by local rule-based scoring, no external AI APIs required.

## Current Build Stage

**Prompt 6 — Local manual unlock system + full paid report generation.**

- [x] Next.js App Router + TypeScript + Tailwind CSS
- [x] Reusable UI components (dark premium theme)
- [x] All routes (/, /dashboard, /audit/new, /audit/[id], /pricing, /unlock, /success, /privacy, /terms, /admin)
- [x] Local storage architecture (localStorage)
- [x] Aura Engine v1 — image metrics, rule-based scoring, free report
- [x] Full Aura Report generator — premium report with visual breakdown, priority map, photo guidance, goal advice
- [x] Manual unlock flow — UPI payment instructions + unlock code validation
- [x] TypeScript data models for all entities
- [x] Dashboard + audit history with locked/unlocked status
- [ ] Real admin dashboard
- [ ] PDF report generation

## Manual Monetization MVP

AuraCheck uses a **manual unlock system** for payment. There is no Razorpay, Stripe, or any payment API integrated.

How it works:
1. User creates an audit and generates a free Aura Score.
2. User clicks "Unlock Full Aura Report — ₹99".
3. User sends ₹99 via UPI to the owner's UPI ID (configured in `.env`).
4. Owner provides an unlock code (manually or via a demo code).
5. User enters the unlock code on `/unlock?auditId=...&product=aura_report`.
6. The app validates the code locally and generates the full report.

**Important security notes:**
- The unlock mechanism is **not secure** against technical users. It is client-side only.
- This is intended for **MVP demand testing only**.
- A real payment provider (Razorpay/Stripe) + backend is required for production.
- See `src/lib/payments/manualUnlock.ts` for the code validation logic.

## Why No External APIs?

| Feature                 | Approach                                |
| ----------------------- | --------------------------------------- |
| App framework           | Next.js (React Server Components)       |
| Styling                 | Tailwind CSS v4                         |
| Scoring engine          | TypeScript rule-based logic             |
| AI-style reports        | Template-generated summaries            |
| Storage                 | Browser localStorage                    |
| Authentication          | None (local-first)                      |
| Payments                | Manual UPI + unlock code (MVP only)     |
| Deployment              | Vercel-ready                            |

This approach means:
- Zero API costs during development and MVP
- Full privacy — user data never leaves their browser
- Fast load times with no external dependencies
- Easy deployment to Vercel or any static host

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Storage:** Browser localStorage
- **Fonts:** Geist (via next/font)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## Required Environment Variables

| Variable                      | Description                          |
| ----------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_APP_URL`         | Your production URL                  |
| `NEXT_PUBLIC_MANUAL_UPI_ID`   | UPI ID for manual payments           |
| `NEXT_PUBLIC_SUPPORT_EMAIL`   | Support email                        |
| `NEXT_PUBLIC_DEMO_UNLOCK_CODE`| Demo unlock code (default: AURADEMO) |

All variables are optional during local development.

## Project Structure

```
src/
├── app/                      # App Router pages
│   ├── audit/[id]/           # Single audit report
│   ├── audit/new/            # New audit form
│   ├── dashboard/            # User dashboard
│   ├── pricing/              # Pricing plans
│   ├── unlock/               # Manual unlock flow
│   ├── success/              # Payment success
│   ├── privacy/              # Privacy policy
│   ├── terms/                # Terms of service
│   ├── admin/                # Admin panel
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   └── SectionHeading.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── aura-engine/          # Scoring & report logic
│   │   ├── imageMetrics.ts
│   │   ├── scoring.ts
│   │   ├── budgetPlans.ts
│   │   ├── generateAuraReport.ts
│   │   └── generateFullAuraReport.ts
│   ├── payments/             # Manual unlock logic
│   │   └── manualUnlock.ts
│   ├── storage/              # localStorage helpers
│   │   ├── localStore.ts
│   │   ├── auditStore.ts
│   │   ├── userStore.ts
│   │   ├── unlockStore.ts
│   │   └── storageKeys.ts
│   └── utils/
│       └── cn.ts
├── types/
│   ├── audit.ts              # Audit data models
│   ├── payment.ts            # Payment/unlock types
│   ├── user.ts               # User preferences
│   └── product.ts            # Product definitions
└── config/
    └── index.ts              # App configuration
```

## Important Notes

- AuraCheck is NOT a financial literacy or moral correction app
- Scores are algorithmic guidance, not objective truth
- No guaranteed dating, social, or financial outcomes are promised
- The app does not infer caste, religion, ethnicity, sexuality, income, disease, or other protected traits
- Language focuses on "visual signals," "first impressions," "presentation," and "upgrade paths"
- Unlock mechanism is MVP-only and not secure for production use
