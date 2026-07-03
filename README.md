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
- **Webhook secret must stay server-side** — never expose to the browser
- **Verify amount and currency before unlocking via webhook**

### Razorpay Webhook Setup

Webhooks ensure successful payments unlock products even if the user closes the browser or the redirect fails after payment.

1. **Add `RAZORPAY_WEBHOOK_SECRET`** to `.env.local` and Vercel environment variables
2. **In Razorpay Dashboard** → Settings → Webhooks → Add webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Enter your webhook secret
3. **Test** in Razorpay test mode — complete a payment and verify the product unlocks even if the verify callback is skipped
4. **Confirm** `/admin` shows the webhook verification source on order cards

The webhook endpoint:
- Verifies the HMAC SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`
- Handles `payment.captured` — validates amount/currency, updates order, unlocks product
- Handles `payment.failed` — marks order as failed for admin visibility
- Handles `order.paid` — marks order for recovery if payment details are still pending
- Returns 200 for all events (including unsupported) to prevent Razorpay retries

### Payment Recovery

If a payment is captured but the verify callback or webhook failed to unlock the product:

1. User visits `/unlock` with their audit ID and product type
2. After Razorpay checkout closes, the page polls `/api/payments/status`
3. If status shows pending/failed, user can click **"Recover payment / Check again"**
4. The `/api/payments/recover` endpoint fetches payment status from Razorpay server-side
5. If payment is captured and amount matches, it updates the order and unlocks the product
6. If unrecoverable, user is shown contact-support instructions with their payment ID

### Payment Status API

`POST /api/payments/status` — Check payment status by `appOrderId` or `razorpayOrderId`.

Returns: order found, status, unlocked boolean, product type, audit ID.

### Payment Recovery API

`POST /api/payments/recover` — Attempt to recover a payment by checking Razorpay server-side.

Requires: `appOrderId` or `razorpayOrderId`, `auditId`, `productType`.

### Fallback Behavior

| Razorpay env vars | Razorpay webhook env | Supabase configured | Payment option shown |
|---|---|---|---|
| Yes | — | Yes | Razorpay checkout (primary) + manual UPI (fallback) |
| Yes | Yes | Yes | Razorpay checkout (webhook recovery enabled) + manual UPI |
| No | — | — | Manual UPI only |
| — | — | No | Manual UPI only (Supabase needed for order tracking) |

## Supabase Persistence Mode

When Supabase environment variables are configured, AuraCheck stores all data in Supabase tables and Storage. When not configured, the app falls back to browser localStorage.

### How It Works

| Feature | LocalStorage mode | Supabase mode |
|---|---|---|
| Audit storage | `auracheck:v1:audits` localStorage | `public.audits` table |
| Orders | `auracheck:v1:orders` localStorage | `public.orders` table |
| Leads | `auracheck:v1:leads` localStorage | `public.leads` table |
| Analytics | `auracheck:v1:analytics` localStorage | `public.analytics_events` table |
| Images | Browser memory (data URL) | `audit-images` private bucket |
| Image access | Direct data URL | Signed URL (60 min expiry) |
| Unlocks | `auracheck:v1:unlocks` localStorage | `public.product_unlocks` table |

### Data Flow

1. **Create audit** → saved to both localStorage (synchronous) and Supabase (async, fire-and-forget)
2. **Generate free score** → saved to localStorage + PATCH to Supabase via `/api/audits/[id]`
3. **Pay with Razorpay** → `/api/payments/create-order` creates Supabase order row + Razorpay order, verification via `/api/payments/verify`
4. **Manual UPI unlock** → creates local order + Supabase order if configured
5. **Admin panel** → reads localStorage; shows storage mode badge; future: reads Supabase
6. **Data page** → shows local data summary + migration card to copy data to cloud

### Image Storage

- Images are uploaded to the `audit-images` private bucket in Supabase Storage
- Path format: `anonymous/<anonymousId>/<timestamp>-<safeFileName>.ext`
- Images are **never public** — only accessible via signed URLs (60-minute expiry)
- Local fallback: images stay as `imageDataUrl` in localStorage audit records

### Local-to-Cloud Migration

Visit `/data` → **"Move local data to cloud database"** card appears when Supabase is configured:
- Shows preview of local audits, orders, leads, and analytics to migrate
- Uploads images to Supabase Storage
- Creates audit rows in Supabase
- Local data is preserved (not deleted)
- Duplicate audits (same ID) are skipped

### Vercel Environment Variables

For Supabase mode on Vercel, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

And for Razorpay:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

**Service role key must never be exposed to the browser.**

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
   | `RAZORPAY_WEBHOOK_SECRET` | `your_webhook_secret` | For Razorpay webhooks (server-only) |
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

## Aura Commerce Engine

AuraCheck's commerce engine analyzes your photo, identifies your biggest visual/status leak, and recommends clothing/accessory upgrades with Indian store price comparison.

### Features
- **Style Diagnosis** — Maps your photo analysis to 12 style directions (clean basic, premium minimal, dating warm, etc.) and 13 aura leak tags
- **Product Matching** — 70+ manually curated products across 18 categories, scored by leak match (30%), style match (25%), category priority (20%), budget fit (15%), and price value (10%)
- **Price Comparison** — Each product has 2–5 offers from different Indian stores. Best value scoring considers price (40%), store trust (30%), discount (20%), and availability (10%)
- **Outfit Bundles** — ₹0 Fix, Under ₹500, Under ₹2,000, Under ₹5,000, Under ₹10,000, and Premium bundles
- **Affiliate Link Support** — Store links with click tracking, affiliate commission support
- **LocalStorage + Supabase** — Click tracking stored locally and optionally persisted via `/api/commerce/click`

### Supported Stores
Myntra, AJIO, Amazon Fashion, Flipkart Fashion, Tata CLiQ, Nykaa Fashion, Meesho, Snitch, The Souled Store, Bewakoof, H&M India, and manual/custom store placeholders.

### Important Notes
- All product data is manually curated — no scraping of any store
- Prices are "Best listed price in AuraCheck catalog" — verify on store before buying
- Discounts are only shown when mathematically true (mrp and price both exist)
- Sponsored products get max 3% boost but only if already relevant — never rank first solely because sponsored

## Aura Commerce Search Engine

AuraCheck's search engine provides normalized product search across Indian shopping stores using an internal product index.

### Routes

| Route | Description |
|---|---|
| `/wardrobe/search` | Public product search — query by style, budget, aura leak |
| `/admin/commerce/search` | Admin search console — test ranking, import feeds, manage index |

### Architecture

```
Store feeds/CSV/Admin catalog → normalizeProduct → buildSearchIndex → searchCommerceIndex → rank by aura + price + freshness → group comparable items → show store comparison
```

### Search Ranking Formula
| Factor | Weight |
|---|---|
| Aura leak match | 30% |
| Style/goal match | 25% |
| Category priority | 15% |
| Budget fit | 15% |
| Price value | 10% |
| Freshness/availability | 5% |
| Sponsored boost | Max 3% (only if relevance ≥ 0.3) |

### Price Freshness
| Status | Condition | UI Label |
|---|---|---|
| Fresh | Checked within 24h | "Recently checked" |
| Recent | Checked within 7 days | "Verify before buying" |
| Stale | Older than 7 days | "Price may be outdated" |
| Manual | Manually entered | "Manual MVP price" |
| Unknown | No timestamp | "Verify on store" |

### Comparable Product Grouping
Products are grouped by: `category:color_family:style_direction:use_case:fit`
- Black overshirt + Black overshirt from different stores → same group
- Black overshirt + Hoodie → different groups

### Best Value Score (for price comparison)
| Factor | Weight |
|---|---|
| Price score | 35% |
| Aura match | 25% |
| Store trust | 15% |
| Price freshness | 15% |
| Availability | 10% |

### Connector Stubs
Amazon Fashion, Flipkart Fashion, Myntra, AJIO, Nykaa Fashion use connector stubs that document future API/feed requirements without scraping or calling external APIs.

### Key Principles
- AuraCheck searches its own product index, not live websites
- Prices may change — verify on the store before buying
- Best listed price means best price in AuraCheck's current catalog
- Sponsored items do not automatically rank first
- AuraCheck may earn affiliate commission from some links
- No scraping is used
- No external AI (OpenAI, Gemini) is used
- No fake discount claims, fake scarcity, or fake testimonials
- Recommendations are based on presentation goals and visual signal, not human worth
- Click tracking fails safely if commerce_clicks Supabase table does not exist

## Commerce Feed Import and Price Freshness

AuraCheck maintains product prices by importing official/manual affiliate feeds, validating prices, storing price snapshots, detecting stale prices, and rebuilding the searchable product index.

### How It Works
```
Affiliate/API/manual feed → normalize products → validate prices →
save catalog → save price snapshots → rebuild search index →
show freshness and confidence → compare prices safely
```

### Supported Import Sources
| Source | Status |
|---|---|
| Manual CSV upload | Working |
| Manual JSON upload | Working |
| Generic affiliate feed CSV | Working |
| Generic affiliate feed JSON | Working |
| Amazon PA-API | Placeholder (documented) |
| Flipkart Affiliate API | Placeholder (documented) |
| Myntra affiliate feed | Placeholder (documented) |
| AJIO affiliate feed | Placeholder (documented) |
| Cuelinks/Admitad feed | Placeholder (documented) |

### Price Freshness Labels
| Status | Condition | UI Label |
|---|---|---|
| Fresh | Checked within 24h | "Recently checked" |
| Recent | Checked within 7 days | "Verify before buying" |
| Stale | Older than 7 days | "Price may be outdated" |
| Manual | Manually entered | "Manual MVP price" |
| Unknown | No timestamp | "Verify on store" |

### Price Confidence Score (0-100)
| Source | Last Checked | Score Range |
|---|---|---|
| Official API | < 24h | 90–100 |
| Affiliate feed | < 24h | 80–90 |
| Affiliate feed | < 7 days | 65–80 |
| Manual CSV/JSON | — | 40–60 |
| Stale/unknown | — | 20–40 |

### Admin Routes
| Route | Description |
|---|---|
| `/admin/commerce/feeds` | Import wizard — upload CSV/JSON, preview mapping, validate, import, rebuild index |
| `/admin/commerce/quality` | Data quality dashboard — freshness, anomalies, warnings, export |

### API Routes
| Route | Method | Description |
|---|---|---|
| `/api/commerce/feed/import` | POST | Import CSV/JSON feed (admin-gated) |
| `/api/commerce/feed/history` | GET | Import history and stats |
| `/api/commerce/feed/template` | GET | Download CSV/JSON template |
| `/api/commerce/price-refresh` | POST | Refresh all price freshness labels |
| `/api/commerce/price-snapshots` | GET | Price snapshot history |
| `/api/commerce/data-quality` | GET | Quality summary and anomaly details |

### Key Principles
- AuraCheck does not scrape stores
- Use official APIs, affiliate feeds, CSV/JSON imports, or manual admin catalog
- Prices are stored in AuraCheck product index
- Price freshness labels are shown on all search results
- Admin can import feeds and review anomalies
- Public users must verify prices on the final store
- No scraping, no fake discounts, no guaranteed cheapest claims

### Live Feed Setup (Scheduled Refresh)

Two Vercel Cron jobs are configured in `vercel.json`:

| Cron | Path | Schedule | What it does |
|---|---|---|---|
| Catalog freshness | `/api/cron/refresh-catalog` | Every 72h (midnight UTC) | Re-derives freshness labels + confidence scores on persisted catalog rows (Supabase mode) |
| Feed refresh | `/api/commerce/refresh/run` | Daily 03:00 UTC | Runs all configured store connectors and imports fresh prices |

Both endpoints authenticate via `Authorization: Bearer ${CRON_SECRET}` (sent
automatically by Vercel Cron when `CRON_SECRET` is set) and also accept the
manual `x-refresh-secret: ${COMMERCE_REFRESH_SECRET}` header for hand-triggered
runs.

To wire a real live price feed, set in Vercel:

1. `CRON_SECRET` — long random value; protects both cron endpoints
2. One feed source:
   - `COMMERCE_GENERIC_CSV_FEED_URL` — URL of an affiliate CSV feed
   - or `COMMERCE_GENERIC_JSON_FEED_URL` — URL of an affiliate JSON feed
   - optional `COMMERCE_GENERIC_FEED_TOKEN` — bearer token sent when fetching the feed

With those set, the daily feed refresh imports real prices automatically. Until
a feed URL is configured, the connectors are documented stubs and the refresh
run reports honestly that no feed is available — nothing is invented in code.

Store-specific connectors (Amazon PA-API, Flipkart Affiliate, Cuelinks,
Admitad) are placeholder stubs; wire them when you have real credentials (see
`.env.example` for the variable names and `lib/commerce/connectors/*Stub.ts`
for the implementation points).

## Visual Wardrobe Diagnosis Engine

AuraCheck includes a browser-based visual wardrobe diagnosis engine that analyzes uploaded photos to identify wardrobe gaps and recommend clothing improvements — all locally, with no external AI or server uploads.

### How It Works
```
Upload photo → extract dominant colors → estimate outfit region →
analyze color harmony → detect wardrobe gaps → build palette advice →
generate commerce search intents → save diagnosis
```

### Analysis Signals
| Signal | Description |
|---|---|
| Dominant Colors | 6 primary colors extracted via canvas pixel sampling (16 color families) |
| Outfit Region | Estimated center/upper-body color region (heuristic, not body detection) |
| Background Region | Edge-sampled background colors for contrast analysis |
| Color Harmony | Palette consistency, saturation balance, neutral balance (0-100 score) |
| Wardrobe Gaps | 13 gap types detected from visual heuristics (dull_palette, too_plain, etc.) |
| Style Direction | Recommended direction (premium_minimal, dating_warm, corporate_sharp, etc.) |

### Wardrobe Gap Types
| Gap | Fix |
|---|---|
| dull_palette | Add white/black/navy/beige layer for contrast |
| too_plain | Add structured layer like overshirt or jacket |
| too_busy | Stick to 2-3 solid colors, replace loud patterns |
| low_contrast | Choose lighter top or better lighting |
| background_outfit_clash | Contrasting topwear or cleaner backdrop |
| weak_premium_signal | Neutral palette (black/white/navy/grey/beige) |
| weak_professional_signal | Oxford shirt, chinos, neutral palette |
| weak_dating_warmth | Warm neutrals (beige, soft brown, olive) |
| weak_creator_energy | Controlled bold layer with neutral base |
| color_mismatch | Choose warm OR cool direction, not both |

### Routes
| Route | Description |
|---|---|
| `/wardrobe/diagnosis` | Upload photo and run full visual diagnosis |
| `/wardrobe/diagnosis/[auditId]` | Run diagnosis from existing audit photo |

### Safety
- No face recognition, body rating, or protected trait inference
- All analysis runs locally in the browser using canvas
- "Estimated outfit region" — not "detected body"
- "AuraCheck analyzes presentation, not human worth"
- No image data is sent to any server

### Future Connectors (Placeholder)
- Amazon PA-API connector — requires `amazon_access_key`, `amazon_secret_key`, `amazon_associate_tag`
- Flipkart Affiliate connector — requires `flipkart_affiliate_id`, `flipkart_affiliate_token`
- Cuelinks/Admitad feed connector — requires feed URL and format
- Scheduled daily price refresh
- Webhook/feed sync endpoint
- Merchant dashboard

### Future Upgrade Path
- Official affiliate API integrations for Myntra, AJIO, Amazon
- Product feed import for live prices
- Price refresh jobs
- Sponsored listing dashboard
- Real inventory checks

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

## Commerce Admin

AuraCheck includes a full commerce administration system for managing the product catalog, affiliate links, sponsored listings, and click analytics.

### Features

- **Manual Product Catalog** — Add, edit, deactivate, and delete wardrobe products through the admin UI at `/admin/commerce`
- **CSV/JSON Import** — Bulk import products from CSV or JSON files with preview, validation, and merge support
- **CSV/JSON Export** — Export full catalog, affiliate links, sponsored listings, and click analytics
- **Affiliate Link Manager** — Track all affiliate links across products and stores; set assumed commission rate
- **Sponsored Listing Controls** — Mark products as sponsored; sponsored products get max 3% ranking boost only if relevant
- **Click Analytics** — Track clicks by store, category, product; show affiliate vs organic clicks; estimated revenue
- **Validation Warnings** — Auto-detect missing fields, invalid URLs, price > MRP, missing relevance tags
- **Store Performance Dashboard** — Top clicked stores, products with no clicks, broken links, inactive products

### Catalog Sources

The commerce engine loads products in this order:
1. **Supabase** — If configured, loads from `commerce_products` + `commerce_offers` tables
2. **Local admin catalog** — Products added/imported via `/admin/commerce` stored in localStorage
3. **Static config fallback** — Built-in catalog at `config/auraWardrobeCatalog.ts` (72 products)

### Rules

- **No scraping** — All product links are manually entered; no automatic scraping of Myntra, AJIO, Amazon, Flipkart, or any store
- **No fake discounts** — `discountPercent` is calculated automatically from price and MRP; admin cannot type fake discount percent
- **Best listed price** — Prices labelled "Best listed price in AuraCheck catalog"; prices may change on store
- **Sponsored items do not automatically rank first** — Max 3% boost, only if relevant to user's style/leak/goal
- **AuraCheck may earn affiliate commission** — Clearly disclosed on all affiliate links
- **No guarantee of cheapest** — "Verify price on store" label shown on all product offers
- **Manual MVP catalog prices may change** — Last checked text shows "Listed in AuraCheck catalog" or import date

### How to Add Affiliate Links

1. Go to **/admin/commerce** → **Add Product** tab
2. In the offer section, check the **Affiliate** checkbox and enter your **Affiliate URL**
3. The affiliate URL will be used for outbound clicks instead of the normal URL
4. Export affiliate links CSV from the **Export** tab to share with affiliate partners

### How to Add Myntra/AJIO/Amazon/Flipkart Links

1. Go to the product page on the store
2. Copy the product URL
3. In AuraCheck admin, add/edit an offer for the product with:
   - **Store Key** — Select the correct store (myntra, ajio, amazon_fashion, flipkart_fashion, etc.)
   - **URL** — Paste the product page URL
   - **Price** — Enter the current listed price on the store
   - **MRP** — Optional; enter the maximum retail price shown on the store

### Future Upgrade Path (Commerce)

- **Official Affiliate APIs** — Direct API integrations with affiliate networks (e.g., Myntra affiliate, Amazon affiliate)
- **Product Feeds** — Automated product feed import from CSV/API
- **Scheduled Price Refresh** — Periodic price updates via cron jobs
- **Inventory Checks** — Real-time availability status
- **Sponsored Dashboard** — Full sponsored campaign management
- **Auto Discount Calculation** — Live price comparison across stores

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
