# Live Site Activation Checklist

Run this on your phone against the live production URL. Start at the top; do not skip blocker checks.

## 0. Is It Live?

- [ ] Open the production URL in a private/incognito mobile browser.
- [ ] Confirm the new homepage loads.
- [ ] Confirm the deployed build is coming from the intended branch/repo.
- [ ] Open `/api/health` and note any warnings.

## 1. Payments Blocker

- [ ] Make one real Rs 21 transaction.
- [ ] Confirm the Rs 21 unlock works.
- [ ] Confirm Rs 21, Rs 200, and Rs 400 are the only visible payment amounts where expected.
- [ ] Confirm Razorpay is the only payment path.
- [ ] Confirm there is no manual UPI fallback.
- [ ] Confirm the Razorpay webhook is registered in the Razorpay dashboard.
- [ ] Confirm the webhook event reaches the app and logs a successful payment/unlock.

## 2. Free Scan

- [ ] Run a free scan from a fresh mobile session.
- [ ] Confirm uncertain undertone reads use hedged language.
- [ ] Confirm the result does not overclaim on low-confidence reads.
- [ ] Confirm the scan still gives useful next steps.

## 3. Shop

- [ ] Open `/shop` on mobile.
- [ ] Confirm celebrity-inspired looks are visible.
- [ ] Open at least three look detail pages.
- [ ] Confirm product images visually match the product names closely enough.
- [ ] Confirm each look has individually shoppable pieces.
- [ ] Confirm personalized picks appear from a scan/report flow.
- [ ] Confirm affiliate links open the intended retailer/product pages.

## 4. CLIP Photo Ranker

- [ ] Open `/photo-ranker`.
- [ ] Confirm the model loads without console-visible failure.
- [ ] Upload multiple real photos.
- [ ] Confirm the photos are ranked.
- [ ] Test photos across darker skin tones.
- [ ] Confirm rankings do not obviously degrade or produce biased language.

## 5. Voice Coach

- [ ] Confirm required env vars are set: `OPENAI_API_KEY`, voice/realtime model key if separate, and any voice feature flag.
- [ ] Open a paid dating report.
- [ ] Start the voice coach.
- [ ] Speak to it naturally for at least one minute.
- [ ] Confirm mic permission, listening state, response latency, and audio playback all work.

## 6. Glow-Up

- [ ] Open the glow-up checklist.
- [ ] Tick several checklist items.
- [ ] Refresh the page and confirm checkboxes persist.
- [ ] Download the checklist.
- [ ] Confirm the downloaded file opens and matches the checklist.
- [ ] Complete the before/after path.
- [ ] Confirm the proof card appears.

## 7. Dating Depth

- [ ] Run or open a paid dating report.
- [ ] Confirm the recommendations are specific, not generic.
- [ ] Confirm advice changes with different inputs/photos.
- [ ] Confirm the report has clear next actions.

## 8. SEO Pages

- [ ] Open core public pages on mobile.
- [ ] Confirm titles and descriptions are specific.
- [ ] Confirm pricing/product pages have structured content.
- [ ] Confirm social previews/OG images work for important routes.

## 9. Mobile 3D And Performance

- [ ] Open the homepage on a real phone.
- [ ] Confirm 3D/animated areas render and do not appear blank.
- [ ] Confirm scrolling remains smooth.
- [ ] Confirm tap targets are usable.
- [ ] Confirm no text overlaps or clips on small screens.
- [ ] Run a basic mobile Lighthouse/performance pass.

## Activation Summary

| Capability | Required config | How to verify |
| --- | --- | --- |
| Live app | Production deployment connected to intended repo/branch | Homepage and `/api/health` load |
| Payments | Razorpay live key, secret, webhook secret | Real Rs 21 payment unlocks |
| Payment webhooks | Razorpay webhook URL registered | Payment event appears in app logs |
| Supabase-backed features | Supabase URL, anon key, service role where required | `/api/health` shows connected state |
| Email notifications | Resend API key and verified sender domain | Test payment email arrives |
| Voice coach | OpenAI/voice env vars and feature flag | Paid dating report can hold a voice session |
| Shop affiliate links | Amazon Associate tag | Product links include/redirect with affiliate tag |
| Live product feed | RapidAPI key if enabled | `/api/health` reports live product feed set |
| App URLs | `NEXT_PUBLIC_APP_URL` | Generated links point to production |

Never paste API keys, webhook secrets, payment credentials, or private tokens in chat. Set them only in the provider dashboard or Vercel environment variables.
