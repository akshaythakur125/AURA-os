# AuraCheck

**Find your biggest status leak.**

AuraCheck is a first-impression and status-signal audit app for Indian youth. Upload photos or profile screenshots to receive an "Aura Score," status-leak analysis, archetype classification, and upgrade suggestions — all powered by local rule-based engines, no external AI APIs required.

## Current Build Stage

**Prompt 11 — Manual Monetization Operations System**

- [x] Next.js App Router + TypeScript + Tailwind CSS
- [x] Reusable UI components (dark premium theme)
- [x] All routes (/, /dashboard, /audit/new, /audit/[id], /pricing, /shop, /unlock, /success, /privacy, /terms, /admin)
- [x] Local storage architecture (localStorage)
- [x] Aura Engine v1 — image metrics, rule-based scoring, free report
- [x] Full Aura Report generator — premium report with visual breakdown, priority map, photo guidance, goal advice
- [x] Personalization engine — 11 status archetypes, signal mismatch detection, goal-specific strategy
- [x] Dating/Profile Audit (₹299) — bio/prompt text analysis, red-flag detection, suggested bios
- [x] 30-Day Glow-Up Plan (₹499) — 4-week roadmap, 30 daily missions, budget roadmap
- [x] Manual unlock flow — 3-stage payment request, submit details, unlock with code
- [x] UPI deep link and copy buttons for manual payment
- [x] WhatsApp payment request sharing (via environment variable)
- [x] Admin panel with local admin code gate
- [x] Order management — CRUD, status tracking, unlock code generation
- [x] Local analytics — event tracking for audit created, unlock views, conversions
- [x] Export tools — JSON, CSV for orders, audits, affiliate clicks
- [x] Multi-product unlock state (track unlocked products per audit)
- [x] Dashboard + audit history with unlocked product badges
- [x] Marketplace + product recommendations engine
- [ ] Real PDF generation (currently uses print-to-PDF)

## Manual Monetization MVP

AuraCheck uses a **manual unlock system** for payment. There is no Razorpay, Stripe, or any payment API integrated.

### Products

| Product                      | Price |
| ---------------------------- | ----- |
| Full Aura Report             | ₹99   |
| Dating / Profile Audit       | ₹299  |
| 30-Day Glow-Up Plan          | ₹499  |

### How the payment flow works

1. User creates an audit and generates a free Aura Score.
2. User clicks "Unlock" on any product.
3. **Stage 1:** User sees UPI payment details with copy buttons and UPI deep link.
4. **Stage 2:** User submits payment details (name, contact, UPI ref, note).
5. A `ManualOrder` is created in localStorage with status `payment_submitted`.
6. User sends the payment summary to the owner via WhatsApp or copy.
7. **Admin:** Owner/admin opens `/admin`, enters admin code, sees the order.
8. **Admin:** Admin clicks "Generate Code" — creates a product-specific unlock code (AURA-XXXXXX, DATE-XXXXXX, GLOW-XXXXXX).
9. **Admin:** Admin sends the code to the user manually.
10. **Stage 3:** User enters the code on the unlock page.
11. The app validates the code and generates the report.
12. The order status is updated to `unlocked`.

### Setting up for manual payments

Copy `.env.example` to `.env.local` and configure:

| Variable                       | Description                              | Required |
| ------------------------------ | ---------------------------------------- | -------- |
| `NEXT_PUBLIC_MANUAL_UPI_ID`    | Your UPI ID for receiving payments       | Yes      |
| `NEXT_PUBLIC_OWNER_WHATSAPP`   | Your WhatsApp number (digits only, no +) | Optional |
| `NEXT_PUBLIC_SUPPORT_EMAIL`    | Support email for user inquiries         | Optional |
| `NEXT_PUBLIC_DEMO_UNLOCK_CODE` | Demo code (default: AURADEMO)            | Optional |
| `NEXT_PUBLIC_LOCAL_ADMIN_CODE` | Admin panel code (default: ADMINDEMO)    | Optional |

### Accessing the admin panel

1. Navigate to `/admin`.
2. Enter the admin code (`NEXT_PUBLIC_LOCAL_ADMIN_CODE`, defaults to `ADMINDEMO`).
3. The admin session is stored in `sessionStorage` for the browser tab.

Admin features:
- Dashboard with order stats (total, pending, unlocked, revenue)
- Orders table with status, customer details, unlock codes
- Generate unlock codes per product type
- Mark orders as unlocked/cancelled
- Local analytics (event tracking, conversion estimates)
- Export all data as JSON or CSV

### Unlock code formats

| Product           | Code Format     | Example         |
| ----------------- | --------------- | --------------- |
| Full Aura Report  | `AURA-XXXXXX`   | `AURA-ABC123`   |
| Dating/Profile    | `DATE-XXXXXX`   | `DATE-DEF456`   |
| 30-Day Glow-Up    | `GLOW-XXXXXX`   | `GLOW-GHI789`   |

Codes are computed deterministically from the audit ID (last 6 alphanumeric characters).

**Security limitation:** This is not production-secure. It is for MVP demand validation without external APIs.

## Why No External APIs?

| Feature                 | Approach                               |
| ----------------------- | -------------------------------------- |
| App framework           | Next.js (React Server Components)      |
| Styling                 | Tailwind CSS v4                        |
| Scoring engine          | TypeScript rule-based logic            |
| AI-style reports        | Template-generated summaries           |
| Personalization         | Rule-based archetype/mismatch engine   |
| Dating/Glow-Up reports  | Local text analysis + template engines |
| Storage                 | Browser localStorage                   |
| Authentication          | None (local-first)                     |
| Payments                | Manual UPI + unlock code (MVP only)    |
| Analytics               | localStorage event tracking            |
| Export                  | Browser Blob download (CSV/JSON)       |
| Deployment              | Vercel-ready                           |

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

## Project Structure

```
src/
├── app/                      # App Router pages
│   ├── audit/[id]/           # Single audit report
│   ├── audit/new/            # New audit form (6-step)
│   ├── dashboard/            # User dashboard
│   ├── pricing/              # Pricing plans
│   ├── shop/                 # Product marketplace
│   ├── unlock/               # 3-stage manual unlock flow
│   ├── success/              # Payment success placeholder
│   ├── privacy/              # Privacy policy
│   ├── terms/                # Terms of service
│   ├── admin/                # Admin panel (gate + orders + analytics + export)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Base UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── share/                # Share card builder
│   └── products/             # Product recommendations
├── lib/
│   ├── aura-engine/          # Scoring & report logic
│   │   ├── imageMetrics.ts   # Canvas pixel analysis
│   │   ├── scoring.ts        # Weighted scoring formula
│   │   ├── archetypes.ts     # 11 status archetypes
│   │   ├── signalMismatch.ts # 8 mismatch detectors
│   │   ├── goalStrategy.ts   # Goal-specific strategies
│   │   ├── generateAuraReport.ts
│   │   ├── generateFullAuraReport.ts
│   │   ├── datingAudit.ts    # Dating profile text analysis
│   │   └── glowupPlan.ts     # 30-day plan generator
│   ├── payments/             # Manual unlock logic
│   │   ├── manualUnlock.ts   # Validation + product config
│   │   └── unlockCodeGenerator.ts  # Code generation per product
│   ├── storage/              # localStorage helpers
│   │   ├── localStore.ts
│   │   ├── auditStore.ts
│   │   ├── userStore.ts
│   │   ├── unlockStore.ts
│   │   ├── orderStore.ts     # Manual order CRUD
│   │   ├── affiliateStore.ts
│   │   ├── analyticsStore.ts # Event tracking
│   │   └── storageKeys.ts
│   ├── export/               # Data export
│   │   ├── csv.ts            # CSV generation + download
│   │   └── downloadJson.ts   # JSON Blob download
│   └── image/                # Image processing
└── types/                    # TypeScript data models
```

## Important Notes

- AuraCheck is NOT a financial literacy or moral correction app
- Scores are algorithmic guidance, not objective truth
- No guaranteed dating, social, or financial outcomes are promised
- The app does not infer caste, religion, ethnicity, sexuality, income, disease, or other protected traits
- Language focuses on "visual signals," "first impressions," "presentation," and "upgrade paths"
- Unlock mechanism is MVP-only and not secure for production use
- Manual payment flow does not automatically verify UPI payments — communication with owner/admin is required
- Admin panel uses a static local code stored in environment variables — no real authentication
