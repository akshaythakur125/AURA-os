# AuraCheck — Go-Live QA Checklist

A tick-through list to run **on the live site** (fixmyaura.shop), on a **phone**
(that's your audience). Most of the recent work is built and building green but
has never run in a real browser — this is the pass that confirms it actually
works. Do the sections top-to-bottom; the first two are blockers.

---

## 0. Is it even live? (blocker)
- [ ] fixmyaura.shop loads the **new homepage** (animated scan hero with a real face, not a grey silhouette).
- [ ] Confirm **where it deploys from** — pushing `main` should trigger it. If not, you deploy manually. (This was never confirmed.)
- [ ] `/api/health` returns OK and shows whether Razorpay keys are detected.

## 1. Payments — Razorpay only (blocker)
Env needed: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (+ webhook secret).
- [ ] From a free result, tap **Unlock — ₹21**. Razorpay opens (UPI/card), **not** a manual "paste UPI reference" screen.
- [ ] Complete **one real ₹21 payment** → the report **unlocks instantly**.
- [ ] Amount at checkout is **₹21** (not ₹25).
- [ ] Dating Audit shows **₹200**, Glow-Up Plan shows **₹400** at checkout.
- [ ] Register the **webhook** (`/api/webhooks/razorpay`) in the Razorpay dashboard — the safety net if the browser closes before verify.
- [ ] Confirm **UPI is enabled** as a method in Razorpay (how most ₹ payments will happen).

## 2. Core free scan
- [ ] Upload a photo → free score + verdict appears.
- [ ] Try a **dark-skinned face** and a **low-light photo** — the undertone read should hedge ("leans warm") when it's unsure, not state it flatly.
- [ ] Paywall shows the personalized tease ("your undertone reads warm → your … palette is ready").

## 3. Shop personalization (undertone matching)
- [ ] In an unlocked report, the shop picks lean into the **detected undertone** (warm → olive/rust/camel; cool → navy/burgundy) with reasons like "Olive flatters your warm undertone".
- [ ] "Complete the Look" outfits and the glasses frame-colours match the undertone too.
- [ ] Product **images match their names** (no red shoe for "White Sneakers", no necklace for "Bag").

## 4. CLIP Photo Ranker + AI photo read
Env (optional self-host): run `npm run clip:fetch` + set `NEXT_PUBLIC_LOCAL_CLIP=1`. Otherwise loads from the HF CDN.
- [ ] Open **/photo-ranker**, upload 3–4 photos → they rank (lead / supporting / cut) with per-photo reasons.
- [ ] Confirm the **model actually loads** (first run downloads it; watch for the "loading AI" state resolving). If it stalls, the HF CDN may be blocked by CSP → self-host the weights.
- [ ] Rankings feel **sensible on real faces**, including darker skin tones.
- [ ] In a **paid report**, the **AI photo read** button runs and shows outfit/grooming/expression/lighting/background.

## 5. Voice dating coach
Env needed: `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL` (Groq/Gemini free tier — see `.env.example`).
- [ ] Before setting a key: the voice widget says **"not switched on yet"** (dormant, ₹0). ✔ good.
- [ ] After setting the key + redeploy: in a **paid dating report**, tap **Practice date** → it greets you and **speaks**.
- [ ] Talk (mic) — it transcribes and replies **in character**, short and natural.
- [ ] **Coach** mode gives feedback.
- [ ] Typing fallback works if the mic isn't supported.
- [ ] Session **caps at 15 turns** and wraps up. Voice/accent (`en-IN`) sounds OK — tell me if you want it tuned.

## 6. Glow-Up — trackable + keepable + proof
- [ ] Missions have **checkboxes**; ticking one **persists** across refresh.
- [ ] Progress bar + "X/30 done" fills; **"Do this next"** points at the first unfinished mission.
- [ ] **Download checklist** produces a printable HTML file that opens/saves fine on a phone.
- [ ] Re-scan (a second audit) → the **before/after proof card** appears in the report showing "before → after, +N pts" with improved signals.

## 7. Dating audit depth
- [ ] Report shows **photo strategy** (lead + 5-slot order), **platform playbook** (Hinge/Bumble/Tinder), **opening hooks**.
- [ ] **Download my profile playbook** produces the HTML doc with bios + hooks + photo order.

## 8. SEO pages (crawl + funnel)
- [ ] `/colours-for-your-skin-tone/warm|cool|neutral` and `/haircuts-for-your-face-shape/<shape>` load with real content + a scan CTA.
- [ ] `/sitemap.xml` includes them + `/photo-ranker`.

## 9. Mobile & performance
- [ ] Homepage hero on a phone: the scan card has **live 3D depth** (ambient sway; tilt the phone → it responds) and the score chip pops.
- [ ] First paint feels fast (the hero photo is `next/image`, optimized).
- [ ] No layout jank; nothing scrolls sideways.

---

## Activation summary (env vars to set on your host)
| Feature | Env vars |
|---|---|
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Voice coach | `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL` |
| Self-host CLIP | `NEXT_PUBLIC_LOCAL_CLIP=1` (+ `npm run clip:fetch` in build) |
| Kill-switch | `VOICE_COACH_DISABLED=1` (emergency off) |

**Never** paste keys in chat or commit them — set them in your host's env settings.

## If something's off
Note which checkbox failed and what you saw — most are small tuning fixes
(mic sensitivity, voice accent, a CLIP CSP allow-rule, a ranking weight). The
build is green; the fixes live in the real-browser gap this checklist closes.
