# AuraCheck / FixMyAura — Production Deployment Guide

## Prerequisites

- GitHub account with repo access
- Vercel account (Hobby or Pro)
- Supabase project (Free tier works)
- Razorpay account (test mode first)
- Domain: fixmyaura.shop (purchased and verified)

---

## 1. Push Code to GitHub

```bash
git push origin main
```

Verify all checks pass before deploying.

## 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Keep default settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next` (default)

## 3. Add Environment Variables

Add these in Vercel Project Settings → Environment Variables:

### Required for production:

| Variable | Location | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Both | `https://fixmyaura.shop` |
| `NEXT_PUBLIC_SUPABASE_URL` | Both | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | From Supabase project settings |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Both | From Razorpay API keys |
| `RAZORPAY_KEY_ID` | Server-only | Same as public key |
| `RAZORPAY_KEY_SECRET` | Server-only | From Razorpay API keys |
| `RAZORPAY_WEBHOOK_SECRET` | Server-only | Generate a random string |
| `LOCAL_ADMIN_CODE` | Server-only | Strong admin password |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Both | Your support email |
| `NEXT_PUBLIC_OWNER_WHATSAPP` | Both | With country code |

### Optional:

| Variable | Location | Notes |
|---|---|---|
| `COMMERCE_REFRESH_SECRET` | Server-only | For cron-triggered price refresh |
| `NEXT_PUBLIC_AFFILIATE_DISCLOSURE_ENABLED` | Both | Set to `true` |
| `NEXT_PUBLIC_MANUAL_UPI_ID` | Both | Your UPI ID for manual fallback |

## 4. Connect Domain

1. In Vercel dashboard → Project → Settings → Domains
2. Add `fixmyaura.shop`
3. Configure DNS:
   - Add CNAME record pointing `fixmyaura.shop` to `cname.vercel-dns.com`
   - Or use Vercel's nameservers
4. Wait for SSL certificate provisioning (automatic)

## 5. Set Supabase Configuration

1. Go to Supabase Dashboard → Authentication → Settings
2. Set **Site URL**: `https://fixmyaura.shop`
3. Add redirect URLs:
   - `https://fixmyaura.shop/auth/callback`
   - `https://fixmyaura.shop`

## 6. Configure Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://fixmyaura.shop/api/webhooks/razorpay`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Enter the same `RAZORPAY_WEBHOOK_SECRET` from env vars
5. Save and test

## 7. Apply Supabase Schema

1. Open Supabase SQL Editor
2. Run `supabase/schema.sql` first
3. Then run `supabase/production_rls.sql` for RLS policies
4. Create Storage bucket: `audit-images` (private)

## 8. Deploy

1. In Vercel dashboard, trigger a production deploy
2. Wait for build to complete
3. Visit `https://fixmyaura.shop`

## 9. Post-Deploy Verification

Open `/admin/deployment` and:

1. ✅ Deployment readiness score should be ≥ 75
2. ✅ Environment checklist all green
3. ✅ Domain shows as connected
4. ✅ Run post-deploy smoke tests — all pass
5. ✅ Open `/admin/launch` — check launch score
6. ✅ Open `/admin/security` — check security score

## 10. Test Payments (Razorpay Test Mode)

1. Ensure Razorpay is in **test mode** (toggle in Razorpay dashboard)
2. Test ₹49 Quick Fix flow from audit page
3. Test ₹99 Full Aura Report flow
4. Test ₹299 Dating Audit flow
5. Test ₹499 Glow-Up Plan flow
6. Test webhook recovery: complete payment, close browser, reopen — product should unlock
7. Test manual UPI fallback

## 11. Enable Live Payments

⚠️ **Do not enable live payments until:**

- All 4 products tested successfully in Razorpay test mode
- Webhook recovery tested successfully
- Admin security page has no critical blockers
- Launch score is ≥ 75
- RLS policies applied and reviewed

To enable live mode:
1. Toggle Razorpay dashboard to **live mode**
2. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live keys
3. Update `RAZORPAY_WEBHOOK_SECRET` with new webhook secret
4. Test ₹49 flow again with live keys in test payments

## Quick Reference

| Resource | URL |
|---|---|
| Production App | https://fixmyaura.shop |
| Admin Panel | https://fixmyaura.shop/admin |
| Launch Center | https://fixmyaura.shop/admin/launch |
| Security Dashboard | https://fixmyaura.shop/admin/security |
| Deployment Center | https://fixmyaura.shop/admin/deployment |
| Razorpay Webhook | https://fixmyaura.shop/api/webhooks/razorpay |
| Health API | https://fixmyaura.shop/api/health |
