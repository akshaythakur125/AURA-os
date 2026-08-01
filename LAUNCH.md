# AuraCheck Launch Runbook

This file separates what is code-ready from what the owner must configure in live accounts. Do not paste secrets in chat.

## Code-Ready

- The app builds and serves the audit, unlock, Razorpay checkout, webhook, report, shop, legal, contact, and health-check routes.
- Public legal/support routes exist: `/terms`, `/privacy`, `/refund`, `/contact`.
- Footer links include terms, privacy, refund, contact, privacy center, local data, help, shop, dashboard, and orders.
- `/api/health` reports whether revenue and paid-value dependencies are wired without leaking secret values.
- `npm run check-env` reports launch env gaps before deploy.

## Blocking Owner Steps

- Razorpay live account and KYC: add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` in Vercel Production, Preview, and Development as needed.
- Razorpay webhook: create a webhook pointing to `https://<your-domain>/api/webhooks/razorpay`, enable `payment.captured` and `order.paid`, then add `RAZORPAY_WEBHOOK_SECRET`.
- Domain and deploy URL: connect the production domain in Vercel and set `NEXT_PUBLIC_APP_URL` to the live HTTPS origin.
- Support contact: set `NEXT_PUBLIC_SUPPORT_EMAIL` to a real monitored support inbox.
- Final money test: run one real Rs 21 Full Aura Report purchase in production, confirm instant unlock, confirm Razorpay dashboard shows the charge, then refund it from Razorpay if desired.

## Recommended Owner Steps

- Supabase persistence: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` so entitlements, orders, and sync paths can use the live database.
- PostHog analytics: set `NEXT_PUBLIC_POSTHOG_KEY` so funnel events are captured.
- Cron protection: set `CRON_SECRET` for scheduled catalog refresh calls.
- Google Maps paid value: set `GOOGLE_MAPS_API_KEY` so nearby salons/gyms can appear in paid reports.

## Optional Revenue Steps

- Amazon Associates: set `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` and/or `AMAZON_ASSOCIATE_TAG` to earn on Amazon links.
- Cuelinks or affiliate network wrapping: set `NEXT_PUBLIC_AFFILIATE_LINK_WRAP_TEMPLATE` to route Myntra, Flipkart, Ajio, Nykaa, and similar links through an affiliate redirect.
- Live shopping feed: set `RAPIDAPI_KEY`, optionally `RAPIDAPI_AMAZON_HOST`, and optionally `SHOP_FEED_PROVIDER` to upgrade curated shopping links to live product/price results.

## Pre-Launch Check

1. Run `npm run check-env` locally or in a Vercel shell with production env loaded.
2. Deploy production.
3. Open `/api/health`; blocking revenue should be `ok`, `razorpay.ready` should be true, and any missing recommended features should be intentional.
4. Run the real Rs 21 payment test end-to-end.
