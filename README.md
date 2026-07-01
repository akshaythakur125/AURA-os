# AuraCheck

First-impression intelligence for the modern age.

AuraCheck analyzes photos, profiles, outfits, and visual presentation to identify status leaks and provide upgrade paths — all in your browser with no external APIs.

## What AuraCheck Is

AuraCheck is a **local-only MVP** for testing demand around first-impression analysis. It provides:

- Free Aura Score based on image analysis
- ₹99 Full Aura Report with detailed visual breakdown
- ₹299 Dating/Profile Audit with bio and prompt feedback
- ₹499 30-Day Glow-Up Plan with weekly missions
- Marketplace recommendations based on detected status leaks
- Referral, challenge, and progress tracking features

## Production Backend Setup

AuraCheck includes Supabase integration for production deployment. The app falls back to localStorage if Supabase env vars are missing.

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project. Note your project URL and anon key.

### 2. Run the Schema

Open your Supabase SQL Editor and run:

- First: `supabase/schema.sql` — creates all tables, indexes, and triggers
- Then: `supabase/rls.sql` — enables Row Level Security and sets up service role policies

### 3. Create the Storage Bucket

In Supabase Dashboard → Storage → Create a private bucket named `audit-images`.

SQL equivalent:
```sql
insert into storage.buckets (id, name, public) values ('audit-images', 'audit-images', false);
```

Image uploads are handled through server actions / API routes in production. For the MVP, images stay in the browser.

### 4. Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | For Supabase mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | For Supabase mode |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | For admin operations |
| `NEXT_PUBLIC_APP_URL` | Your app URL | Yes |

**Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.** It is only used in server-side files (`lib/supabase/admin.ts`, `lib/server/` repos, API routes).

### 5. Verify

After setup, visit `/api/health` to confirm:

```json
{
  "status": "ok",
  "app": "AuraCheck",
  "storageMode": "supabase",
  "supabaseConfigured": true,
  "timestamp": "..."
}
```

If Supabase env vars are missing, the app continues in localStorage mode with no errors.

### 6. Deploy to Vercel

Add the same env vars to your Vercel project dashboard → Settings → Environment Variables.

### Storage Mode Behavior

| Env vars set | Storage mode | Behavior |
|---|---|---|
| Yes | supabase | Server repos use Supabase. Client can use browser client. |
| No (or partial) | local | Everything uses localStorage. No crashes. |

## Razorpay Online Payments

AuraCheck supports **Razorpay** for instant online payments with automatic product unlock after server-side signature verification.

### Prerequisites

1. **Create a Razorpay account** at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys and generate Key ID and Key Secret
3. Use **test mode** first (toggle in Razorpay dashboard)

### Environment Variables

Add these to `.env.local`:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (used in browser checkout) | For online payments |
| `RAZORPAY_KEY_ID` | Razorpay key ID (server-only) | For online payments |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (server-only) | For online payments |

### How It Works

1. User clicks **"Pay with Razorpay"** on the unlock page
2. Client calls `/api/payments/create-order` — server creates a Razorpay order + Supabase order row
3. Razorpay Checkout modal opens in the browser
4. User completes payment (test or live)
5. Client callback sends payment details to `/api/payments/verify`
6. Server verifies the HMAC SHA256 signature
7. If valid — order is marked as unlocked, the correct paid report is generated, audit is updated, and `product_unlocks` row is created
8. If invalid — order is marked `payment_verification_failed`, no unlock happens

### Important Security Rules

- **Never expose `RAZORPAY_KEY_SECRET`** — server-only env var
- **Never trust the client amount** — server always calculates from the product catalog
- **Unlock only after signature verification** — the client callback alone is not trusted
- **Use test mode before going live** — toggle in Razorpay dashboard

### Fallback Behavior

| Razorpay env vars | Supabase configured | Payment option shown |
|---|---|---|
| Yes | Yes | Razorpay checkout (primary) + manual UPI (fallback) |
| No | — | Manual UPI only |
| — | No | Manual UPI only (Supabase needed for order tracking) |

## Local-Only Architecture

All logic runs exclusively in the browser:

- **Image analysis** — Canvas pixel analysis for brightness, contrast, saturation, sharpness
- **Data storage** — Browser localStorage
- **Payments** — Manual UPI flow with optional Razorpay online payments
- **No external APIs** — No Supabase, OpenAI, Gemini, or any server-side processing
- **No external database** — No MongoDB, PostgreSQL, or similar
- **No external authentication** — No Auth0, Clerk, or similar
- **Image/data never leaves the browser**

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MANUAL_UPI_ID=your-upi-id@upi
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
NEXT_PUBLIC_OWNER_WHATSAPP=+919999999999
NEXT_PUBLIC_DEMO_UNLOCK_CODE=DEMO123
NEXT_PUBLIC_LOCAL_ADMIN_CODE=your-admin-code
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

This project is ready for Vercel deployment:

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Set these environment variables in Vercel dashboard:

   | Variable | Example | Required |
   |---|---|---|
   | `NEXT_PUBLIC_APP_URL` | `https://auracheck.vercel.app` | Yes |
   | `NEXT_PUBLIC_MANUAL_UPI_ID` | `your-upi@upi` | For UPI payments |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_xxxx` | For Razorpay |
   | `RAZORPAY_KEY_ID` | `rzp_test_xxxx` | For Razorpay (server-only) |
   | `RAZORPAY_KEY_SECRET` | `your_secret` | For Razorpay (server-only) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | For Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_anon_key` | For Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your_service_role_key` | For Supabase (server-only) |
   | `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@example.com` | No |
   | `NEXT_PUBLIC_OWNER_WHATSAPP` | `919999999999` | No |
   | `NEXT_PUBLIC_DEMO_UNLOCK_CODE` | `AURADEMO` | No (defaults to AURADEMO) |
   | `NEXT_PUBLIC_LOCAL_ADMIN_CODE` | `your-admin-code` | No (defaults to ADMINDEMO) |

4. Deploy — no build command or output directory changes needed
5. Set a custom domain in Vercel dashboard (optional)

**Important**: All data stays in the user's browser localStorage. Deploying to Vercel does not add a backend. The app remains fully client-side.

## npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Routes

| Route | Description |
|---|---|
| `/` | Homepage |
| `/dashboard` | User dashboard with audits, referrals, progress |
| `/audit/new` | Create a new aura check |
| `/audit/[id]` | Audit detail — score, report, management |
| `/pricing` | Pricing & comparison |
| `/unlock` | Unlock purchased report with code |
| `/admin` | Admin panel — orders, analytics, founder checklist |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/privacy-center` | User-facing privacy information hub |
| `/data` | Data control — export, import, clear |
| `/help` | Help & FAQ |
| `/install` | PWA install instructions |
| `/shop` | Marketplace recommendations |
| `/examples` | Sample reports and insights |
| `/products/aura-report` | ₹99 Full Aura Report product page |
| `/products/dating-audit` | ₹299 Dating/Profile Audit product page |
| `/products/glowup-plan` | ₹499 30-Day Glow-Up Plan product page |
| `/challenges` | Community challenges |
| `/challenges/[slug]` | Individual challenge detail |
| `/progress` | Before/after progress tracker |

## Manual Monetization Flow

AuraCheck uses a **manual UPI payment flow** — no payment API integration.

1. User unlocks a product (₹99 / ₹299 / ₹499)
2. User sees UPI payment instructions with the owner's UPI ID
3. User pays manually via their UPI app
4. User submits payment details on the unlock page
5. A local order is saved in localStorage
6. User sends payment summary to the owner/admin
7. Admin (at `/admin`) generates an unlock code
8. User enters the unlock code on the unlock page
9. Product is unlocked — report/audit/plan is generated locally

### Products

| Product | Price | Code Prefix |
|---|---|---|
| Quick Aura Fix | ₹49 | FIX |
| Full Aura Report | ₹99 | AURA |
| Dating/Profile Audit | ₹299 | DATE |
| 30-Day Glow-Up Plan | ₹499 | GLOW |

## Admin Unlock Code Flow

1. Go to `/admin` and enter the gate code
2. Open the **Orders** tab
3. Find a submitted order
4. Click **Generate Code** (auto-generates product-prefixed code)
5. Click **Copy Code** to share with the user
6. Click **Mark Unlocked** after confirming payment

## Export / Import Data

Users can export all their data from `/data`:

- **Export** — Downloads a JSON backup of all localStorage stores
- **Import** — Upload a previous export in merge or replace mode
- **Clear** — Clear specific data types or all data (with "DELETE" confirmation)

Admin can also export a full snapshot from the **Checklist** tab in `/admin`.

## How to Test All Four Paid Products

1. **Free Aura Score** — Create an audit → Generate Free Aura Score
2. **₹49 Quick Aura Fix** — From a scored audit, click "Quick Aura Fix" → unlock with `AURADEMO`
3. **₹99 Full Aura Report** — Use demo unlock code: `AURADEMO` on `/unlock`
4. **₹299 Dating/Profile Audit** — Create a dating-type audit → unlock with `AURADEMO`
5. **₹499 30-Day Glow-Up Plan** — Unlock on any scored audit → enter `AURADEMO`

The demo code unlocks any product for any audit. Change it via `NEXT_PUBLIC_DEMO_UNLOCK_CODE`.

## Tech Stack

- **Next.js 16** App Router (Turbopack)
- **TypeScript** — Strict mode
- **Tailwind CSS v4** — Dark premium theme
- **ESLint** — Flat config
- **localStorage** — All data persistence

## Known Limitations

- Private/incognito browsing may clear localStorage
- No real payment verification — manual UPI flow only
- Admin gate uses a shared code in sessionStorage
- Image analysis is rule-based, not AI-powered
- Referral tracking is per-browser only
- No multi-device sync or user accounts
- PWA icons require actual PNG files at `/public/icon-192.png` and `/icon-512.png`

## Production Upgrade Path

For a production-ready version, consider:

- **Authentication** — Add backend auth (Supabase Auth, Clerk, NextAuth)
- **Database** — PostgreSQL/MySQL for data persistence across devices
- **Real Payment Verification** — Razorpay/Stripe webhook integration
- **Secure File Storage** — Cloudinary/S3 for uploaded images
- **External AI** — OpenAI/Gemini API for richer analysis (optional)
- **Legal & Privacy Review** — Consult a lawyer for regulatory compliance
- **Server-Side Admin** — Proper admin authentication and dashboard
- **Email/Notifications** — Transactional emails for payment and unlock flows

## Safety & Trust

- AuraCheck analyzes presentation signals, not human worth.
- Scores are guidance, not objective truth.
- No external AI service is used in this MVP.
- Your image stays in this browser in the local-only MVP.
- Do not upload someone else's private image without permission.
- AuraCheck does not infer caste, religion, ethnicity, sexuality, health, exact income, or protected traits.
- Manual payment is not automatically verified.
- Profile guidance is for presentation clarity, not dating guarantees.
- Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.

## License

Private — All rights reserved.
