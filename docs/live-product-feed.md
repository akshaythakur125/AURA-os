# Live product feed

The buy list in the report shows the **cheapest real product + a direct link**
when a product feed is configured. Until then it falls back to the curated buy
list (retailer *search* links with band-price estimates). No code changes are
needed to switch it on — just environment variables.

## Turn it on

Set these in your Vercel project env (Production):

| Variable | Required | Notes |
|---|---|---|
| `RAPIDAPI_KEY` | yes | Your RapidAPI key. Subscribe to an Amazon data API (e.g. "Real-Time Amazon Data") — the free tier is enough to start. |
| `RAPIDAPI_AMAZON_HOST` | no | Defaults to `real-time-amazon-data.p.rapidapi.com`. Set if your provider host differs. |
| `SHOP_FEED_PROVIDER` | no | Defaults to `rapidapi_amazon` when `RAPIDAPI_KEY` is set. |
| `AMAZON_ASSOCIATE_TAG` | no | Your Amazon Associates tag — appended to product links so purchases are attributed to you. |

After deploying, hit `/api/health` — `features.liveProductFeed` should read `set`.

## Verify the field mapping

Different RapidAPI Amazon providers use slightly different JSON field names. The
adapter (`src/app/api/shop/products/route.ts` → `rapidApiAmazon`) already accepts
the common aliases (`product_title`/`title`, `product_price`/`price`,
`product_url`/`url`, `product_photo`/`image`). If your provider returns other
names, add them there — it's a one-line change per field. If a response can't be
parsed, the row safely falls back to the curated link (never a broken price).

## Add another provider (Amazon PA-API, Flipkart, Cuelinks, …)

Write one adapter function returning `LiveProduct[]` and branch on it in the
`POST` handler by `SHOP_FEED_PROVIDER`. The client and UI need no changes.

---

# Earning commission (affiliate links)

Live prices and commission are **separate** — you can have either or both.
Every outbound retailer link (buy list, shop grid, and the report's product
links) runs through `src/lib/shop/affiliate.ts`, which is off by default.

## Amazon — direct
Sign up at **affiliate-program.amazon.in**, then set your tag:

    NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=yourtag-21

Every Amazon link now carries `?tag=yourtag-21`. Works immediately after signup.

## Myntra / Flipkart / Ajio / Nykaa — via one network
These have no direct self-serve tag. Join **one** affiliate network that covers
all of them (Cuelinks is the easiest link-kit signup; EarnKaro/Admitad also
work) and set its redirect template — keep the literal `{url}`:

    NEXT_PUBLIC_AFFILIATE_LINK_WRAP_TEMPLATE=https://linksredirect.com/?pub_id=YOURID&source=linkkit&url={url}

Now non-Amazon links are wrapped through your network and become commissionable.
Set `NEXT_PUBLIC_AFFILIATE_WRAP_AMAZON=true` to route Amazon through the network
too (default keeps Amazon on its direct tag, which usually pays better).

Note: EarnKaro generates per-link short URLs rather than a single wrap template,
so the template approach fits Cuelinks / link-kit networks best. `/api/health`
shows `features.affiliateLinks` = `set` once any of the above is configured.
