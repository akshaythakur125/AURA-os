# AuraCheck — Launch Checklist

Use this checklist before sharing AuraCheck with real users for the first time.

**Launch Control Center available at `/admin/launch`** — automated readiness score, smoke tests, and environment checks.  
**System Health page at `/admin/system`** — service status, storage mode, configuration overview.

## 1. Environment Variables

- [ ] Set `NEXT_PUBLIC_APP_URL` to your deployed URL
- [ ] Set `NEXT_PUBLIC_MANUAL_UPI_ID` to your UPI ID (e.g. `name@upi`)
- [ ] Set `NEXT_PUBLIC_SUPPORT_EMAIL` to your support email
- [ ] Set `NEXT_PUBLIC_OWNER_WHATSAPP` to your WhatsApp number (with country code)
- [ ] Set `NEXT_PUBLIC_DEMO_UNLOCK_CODE` to a demo unlock code for testing
- [ ] Set `NEXT_PUBLIC_LOCAL_ADMIN_CODE` to a strong admin gate code (change from default)

## 2. Local Run Test

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at `http://localhost:3000`
- [ ] All routes navigate without crashing (walk through each route)

## 3. Mobile Test

- [ ] Homepage renders well on mobile (375px width)
- [ ] Audit creation form is usable on mobile
- [ ] Image upload works on mobile
- [ ] Unlock page is readable on mobile
- [ ] Admin tables scroll horizontally without breaking

## 4. Audit Creation

- [ ] Create a photo audit — all steps work
- [ ] Upload an image and generate free Aura Score
- [ ] Free score displays correctly with status leaks
- [ ] Dashboard updates with new audit
- [ ] Audit detail page persists on refresh

## 5. Paid Product Unlock Tests

### ₹99 Full Aura Report
- [ ] Click "Unlock Full Aura Report" from a scored audit
- [ ] Unlock page shows correct product and ₹99 price
- [ ] Apply an offer code — discount reflects
- [ ] UPI details display correctly
- [ ] Submit payment request — order created
- [ ] Enter unlock code — Full Aura Report generates
- [ ] Report persists after page refresh
- [ ] Dashboard shows "Full Report" badge

### ₹299 Dating/Profile Audit
- [ ] Unlock Dating/Profile Audit on a dating-type audit
- [ ] Dating audit generates with bio/prompt feedback
- [ ] Profile score, red flags, and strategy display
- [ ] No dating guarantee language appears

### ₹499 30-Day Glow-Up Plan
- [ ] Unlock Glow-Up Plan
- [ ] 4-week plan and daily missions display
- [ ] No guaranteed transformation language appears

## 6. Admin Operations

- [ ] `/admin` loads and gate code works
- [ ] Orders tab shows submitted orders
- [ ] Generate unlock code for an order — code appears
- [ ] Copy unlock code works
- [ ] Export orders as CSV works
- [ ] Leads tab shows collected leads
- [ ] Analytics tab shows event data
- [ ] Founder checklist tab saves/loads checkboxes
- [ ] Admin snapshot export downloads JSON

## 7. Data Control & Trust

- [ ] `/data` loads with storage summary
- [ ] Export all data downloads a valid JSON
- [ ] Import previously exported JSON — data restores
- [ ] Invalid JSON import shows error message (not crash)
- [ ] Clear data with "DELETE" confirmation works
- [ ] `/privacy-center` loads all 8 sections
- [ ] `/privacy` page is complete and accurate
- [ ] `/terms` page is complete
- [ ] `/help` page answers common questions

## 8. Share & Export

- [ ] Share card preview generates on dashboard
- [ ] "Download as PNG" works
- [ ] "Copy share text" works
- [ ] User image is not included in share card
- [ ] Print report hides navigation and buttons

## 9. Growth Features

- [ ] Referral code appears on dashboard
- [ ] Homepage handles `/?ref=TEST123` query parameter
- [ ] Challenges page loads and list of challenges displays
- [ ] Challenge entry works (enter an audit into a challenge)
- [ ] Progress comparison page loads
- [ ] Onboarding checklist updates after completing steps

## 10. Build & Deploy

- [ ] `npm run lint` passes with no errors
- [ ] `npm run typecheck` passes with no TypeScript errors
- [ ] `npm run build` produces successful production build
- [ ] All 21 routes are listed in the build output

## 11. Vercel Deployment

- [ ] Repo pushed to GitHub
- [ ] Vercel project created from GitHub repo
- [ ] All environment variables set in Vercel dashboard
- [ ] Deployment succeeds (no build errors)
- [ ] Deployed URL loads homepage
- [ ] All routes work on deployed URL
- [ ] Audit creation works on deployed version
- [ ] Free score generation works
- [ ] Unlock flow works with demo code
- [ ] Admin page loads and gate works

## Known Limitations (MVP)

- All data is stored in browser localStorage — cleared in private/incognito mode
- No actual payment verification — manual UPI flow only
- Admin gate uses a shared code — not production-secure
- Image analysis is local — not AI-powered
- Referral tracking is per-browser, not server-side
- No real authentication — no multi-device sync
- PWA works but icons may not display everywhere
