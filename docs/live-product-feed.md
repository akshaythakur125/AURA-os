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
