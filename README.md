# AuraCheck

**Find your biggest status leak.**

AuraCheck is a first-impression and status-signal audit app for Indian youth. Upload photos or profile screenshots to receive an "Aura Score," status-leak analysis, and upgrade suggestions — all powered by local rule-based scoring, no external AI APIs required.

## Current Build Stage

**No-API Foundation** — This is the initial project scaffold. All pages, components, and architecture are in place, but the full scoring engine, image upload, and payment flow are not yet implemented.

- [x] Next.js App Router + TypeScript + Tailwind CSS
- [x] Reusable UI components (dark premium theme)
- [x] All placeholder routes (/, /dashboard, /audit/new, /audit/[id], /pricing, /unlock, /success, /privacy, /terms, /admin)
- [x] Local storage architecture (localStorage)
- [x] Rule-based scoring engine stubs
- [x] Manual payment/unlock placeholder
- [x] TypeScript data models
- [ ] Full scoring engine
- [ ] Image upload & preview
- [ ] Real admin dashboard
- [ ] PDF report generation

## Why No External APIs?

| Feature                 | Approach                                |
| ----------------------- | --------------------------------------- |
| App framework           | Next.js (React Server Components)       |
| Styling                 | Tailwind CSS v4                         |
| Scoring engine          | TypeScript rule-based logic             |
| AI-style reports        | Template-generated summaries            |
| Storage                 | Browser localStorage                    |
| Authentication          | None (local-first)                      |
| Payments                | Manual UPI + unlock code (placeholder)  |
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

| Variable                    | Description                          |
| --------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_APP_URL`       | Your production URL                  |
| `NEXT_PUBLIC_MANUAL_UPI_ID` | UPI ID for manual payments           |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email                        |
| `ADMIN_UNLOCK_CODE`         | Admin code to unlock reports         |

All variables are optional during local development.

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── audit/[id]/         # Single audit report
│   ├── audit/new/          # New audit form
│   ├── dashboard/          # User dashboard
│   ├── pricing/            # Pricing plans
│   ├── unlock/             # Manual unlock flow
│   ├── success/            # Payment success
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   ├── admin/              # Admin panel
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Base UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   └── SectionHeading.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── aura-engine/        # Scoring & report logic
│   │   ├── types.ts
│   │   ├── scoring.ts
│   │   ├── reportTemplates.ts
│   │   └── generateAuraReport.ts
│   ├── payments/           # Manual unlock logic
│   │   └── manualUnlock.ts
│   ├── storage/            # localStorage helpers
│   │   ├── types.ts
│   │   └── localStore.ts
│   └── utils/
│       └── cn.ts
├── types/
│   └── audit.ts            # Data models
└── config/
    └── index.ts            # App configuration
```

## Next Planned Modules

1. **Full Scoring Engine** — Rule-based evaluation across visual, presentation, signal, and cohesion dimensions
2. **Image Upload & Preview** — Client-side image handling with EXIF-like metadata
3. **Real Admin Dashboard** — Unlock request management, manual code generation
4. **PDF Report Generation** — Downloadable reports using client-side libraries
5. **Expanded Upgrade Library** — 100+ actionable upgrade suggestions across categories

## Important Notes

- AuraCheck is NOT a financial literacy or moral correction app
- Scores are algorithmic guidance, not objective truth
- No guaranteed dating, social, or financial outcomes are promised
- The app does not infer caste, religion, ethnicity, sexuality, income, disease, or other protected traits
- Language focuses on "visual signals," "first impressions," "presentation," and "upgrade paths"
