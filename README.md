# AuraCheck

**Find your biggest status leak.**

AuraCheck is a first-impression and status-signal audit app for Indian youth. Upload photos or profile screenshots to receive an "Aura Score," status-leak analysis, archetype classification, and upgrade suggestions — all powered by local rule-based engines, no external AI APIs required.

## Current Build Stage

**Prompt 14 — Trust, Data Control, Safety, Backup/Restore, and Final UX Polish Layer**

- [x] Next.js App Router + TypeScript + Tailwind CSS (23 routes)
- [x] Reusable UI components (dark premium theme)
- [x] All routes: `/`, `/dashboard`, `/audit/new`, `/audit/[id]`, `/pricing`, `/shop`, `/unlock`, `/success`, `/privacy`, `/terms`, `/admin`, `/products/*`, `/examples`, `/challenges`, `/challenges/[slug]`, `/progress`, `/install`, `/data`, `/privacy-center`, `/help`
- [x] Local storage architecture (localStorage) with safe JSON parsing
- [x] Aura Engine v1 — image metrics, rule-based scoring, free report, full premium report
- [x] Personalization engine — 11 status archetypes, signal mismatch detection, goal-specific strategy
- [x] Dating/Profile Audit (₹299) — bio/prompt text analysis, red-flag detection, suggested bios
- [x] 30-Day Glow-Up Plan (₹499) — 4-week roadmap, 30 daily missions, budget roadmap
- [x] Manual unlock flow — 3-stage payment request, submit details, unlock with code
- [x] Admin panel with local admin code gate, founder launch checklist, growth dashboard
- [x] Order management — CRUD, status tracking, unlock code generation, discount tracking
- [x] Local analytics — 20+ event types tracked with conversion estimates
- [x] Export tools — JSON, CSV for orders, audits, affiliate clicks, leads, referrals, challenges, progress, full admin snapshot
- [x] Multi-product unlock state (track unlocked products per audit)
- [x] Dashboard + audit history with unlocked product badges, onboarding checklist, referral card, progress link
- [x] Marketplace + product recommendations engine
- [x] Product sales pages + sample report previews + comparison tables
- [x] Offer/discount code system (5 starter codes)
- [x] Lead capture with WhatsApp contact
- [x] Referral system (local-only, code-based)
- [x] Challenges (8 types, local leaderboard)
- [x] Before/after progress comparison with delta tracking
- [x] PWA support (manifest.json, install guidance page)
- [x] Onboarding checklist (5-step)
- [x] **Local data control center** (`/data`) — storage summary, export/import, selective clear with typed confirmation
- [x] **Privacy center** (`/privacy-center`) — transparent local-only explanations
- [x] **Help & FAQ** (`/help`) — 13 questions, troubleshooting, support contact
- [x] **Content safety** — unsafe text detection, consent reminders, safety warnings per audit type
- [x] **Report management** — delete audit, remove image only, regenerate free score, duplicate settings
- [x] **Storage health checks** — usage estimation, corruption detection, repair, private mode warning
- [x] **Empty/Error/Loading state components** — EmptyState, ErrorState, LoadingState, ConfirmDialog, Toast
- [x] **Founder launch checklist** — 16 items with progress tracking, admin snapshot export
- [x] Improved privacy/terms pages — comprehensive with all safety disclaimers
- [ ] Real PDF generation (currently uses print-to-PDF)

## Local Data Model

All data is stored in browser localStorage under versioned keys (`auracheck:v1:*`). The app has zero external APIs.

| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| Audits | `auracheck:v1:audits` | Audit records with images, scores, reports |
| User | `auracheck:v1:user` | Display name and city |
| Settings | `auracheck:v1:settings` | App preferences |
| Unlocks | `auracheck:v1:unlocks` | Unlock records |
| Orders | `auracheck:v1:orders` | Payment orders with status |
| Analytics | `auracheck:v1:analytics` | App event tracking |
| Leads | `auracheck:v1:leads` | Contact request leads |
| Referral Profile | `auracheck:v1:referral_profile` | Referral code and stats |
| Referral Claims | `auracheck:v1:referral_claims` | Referral claim records |
| Challenge Entries | `auracheck:v1:challenge_entries` | Challenge participation |
| Progress Comparisons | `auracheck:v1:progress_comparisons` | Before/after comparisons |
| Onboarding | `auracheck:v1:onboarding` | Onboarding step state |

## Data Export/Import

Visit `/data` to:
- View storage summary (count per data type, estimated size, last updated)
- Export all data as JSON backup
- Import from a previous backup (merge or replace mode)
- Clear specific data types or all data (requires typing DELETE to confirm)
- Check storage health (availability, usage, corruption)

## Safety Rules

AuraCheck includes local content safety validation:
- Unsafe text detection for harassment, shaming, protected trait requests
- Self-harm detection with supportive messages
- Per-audit-type safety warnings
- Consent reminders before audit creation
- Input sanitization (HTML removal)

The app does NOT:
- Claim objective truth
- Guarantee dating/social/career outcomes
- Use body-shaming language
- Infer protected traits (caste, religion, ethnicity, sexuality, health, income)
- Enable harassment or public shaming
- Claim automatic payment verification

## Manual Monetization MVP

AuraCheck uses a **manual unlock system** for payment. There is no Razorpay, Stripe, or any payment API integrated.

### Products

| Product | Price |
|---------|-------|
| Full Aura Report | ₹99 |
| Dating / Profile Audit | ₹299 |
| 30-Day Glow-Up Plan | ₹499 |

### Payment Flow

1. User creates audit → generates free Aura Score
2. User clicks "Unlock" → sees UPI payment details
3. User submits payment details (name, contact, UPI ref)
4. Admin generates unlock code via `/admin`
5. User enters code → report is unlocked

### Setting up for manual payments

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MANUAL_UPI_ID` | Your UPI ID for receiving payments | Yes |
| `NEXT_PUBLIC_OWNER_WHATSAPP` | WhatsApp number (digits only) | Optional |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email | Optional |
| `NEXT_PUBLIC_DEMO_UNLOCK_CODE` | Demo code (default: AURADEMO) | Optional |
| `NEXT_PUBLIC_LOCAL_ADMIN_CODE` | Admin code (default: ADMINDEMO) | Optional |

## Founder Launch Checklist

Available on `/admin`. 16 items covering:
- Environment setup (UPI ID, support email, WhatsApp, admin code)
- Feature testing (all 3 products, offer codes, exports)
- Experience review (mobile upload, share card, privacy/terms, examples/pricing, challenges/progress)

Completion is stored locally and persists across sessions.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Storage:** Browser localStorage
- **Fonts:** Geist (via next/font)
- **Zero external APIs, zero external databases, zero authentication providers**

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
npm run lint
```

## Project Structure

```
src/
├── app/                      # 23 App Router pages
│   ├── admin/                # Admin panel + founder checklist
│   ├── audit/[id]/           # Audit report + management
│   ├── audit/new/            # 6-step audit creation
│   ├── challenges/           # Challenge listing + detail
│   ├── dashboard/            # User dashboard + onboarding
│   ├── data/                 # Local data control center
│   ├── help/                 # Help & FAQ
│   ├── install/              # PWA install guidance
│   ├── privacy-center/       # Privacy explanations
│   ├── products/             # Sales pages (3 products)
│   ├── progress/             # Before/after comparisons
│   ├── unlock/               # 3-stage manual unlock
│   ├── page.tsx              # Landing page
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # EmptyState, ErrorState, LoadingState, ConfirmDialog, Toast, etc.
│   ├── Header.tsx / Footer.tsx
│   ├── share/                # Share card builder
│   ├── challenges/           # Local leaderboard
│   ├── onboarding/           # Onboarding checklist
│   └── products/             # Recommendations
├── lib/
│   ├── aura-engine/          # Scoring + reports
│   ├── payments/             # Manual unlock
│   ├── storage/              # All stores + storageHealth
│   ├── data/                 # Export, import, summary, clear
│   ├── safety/               # Content safety
│   ├── referrals/            # Referral utilities
│   ├── progress/             # Audit comparison
│   ├── offers/               # Discount codes
│   ├── audits/               # Upsell detection
│   ├── export/               # CSV/JSON download
│   └── image/                # Image processing
├── config/                   # Offers, challenges, sample reports
└── types/                    # TypeScript models
```

## Important Notes

- AuraCheck is NOT a financial literacy or moral correction app
- Scores are algorithmic guidance, not objective truth
- No guaranteed dating, social, or financial outcomes are promised
- The app does not infer caste, religion, ethnicity, sexuality, income, disease, or other protected traits
- Language focuses on "visual signals," "first impressions," "presentation," and "upgrade paths"
- Unlock mechanism is MVP-only and not secure for production use
- Manual payment flow does not automatically verify UPI payments
- Admin panel uses a static local code stored in environment variables — no real authentication
- All growth features (referral, challenges, leaderboards, progress) are local-only — no real social network
- Data is stored in browser localStorage — clearing browser data may remove all information

## What Must Be Added for Production

- Backend authentication (real user accounts)
- Real payment verification (Razorpay/Stripe integration)
- Secure database (PostgreSQL, SQLite via backend)
- Secure file storage (S3 or similar)
- Real privacy policy / legal review (this is an MVP template)
- Optional AI API integration (for richer analysis if desired)
- Server-side leaderboards for challenges
- Real referral tracking with server verification
- PDF generation on server side
- Email/SMS notifications for order updates
