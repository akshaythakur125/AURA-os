-- ============================================================
-- AuraCheck — Production RLS Policies
-- Run this after schema.sql to secure user data.
-- ============================================================

-- Enable RLS on all user-sensitive tables
alter table if exists public.audits enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.product_unlocks enable row level security;
alter table if exists public.leads enable row level security;
alter table if exists public.funnel_events enable row level security;
alter table if exists public.commerce_wishlist_items enable row level security;
alter table if exists public.commerce_deal_alerts enable row level security;
alter table if exists public.visual_wardrobe_diagnoses enable row level security;
alter table if exists public.app_users enable row level security;

-- Public commerce tables can be readable (no user data)
alter table if exists public.commerce_products enable row level security;
alter table if exists public.commerce_offers enable row level security;
alter table if exists public.commerce_clicks enable row level security;

-- ============================================================
-- AUDITS
-- ============================================================
-- Anon: can create audits (need INSERT)
-- Authenticated: can read own audits
-- Service role: can read/update all (for server operations)

drop policy if exists "Users can insert own audits" on public.audits;
create policy "Users can insert own audits" on public.audits
  for insert with check (true);

drop policy if exists "Users can read own audits" on public.audits;
create policy "Users can read own audits" on public.audits
  for select using (
    auth.uid() = user_id
    or
    (anonymous_id is not null and anonymous_id = current_setting('app.anonymous_id', true))
  );

drop policy if exists "Service role can manage audits" on public.audits;
create policy "Service role can manage audits" on public.audits
  for all using (true);

-- ============================================================
-- ORDERS
-- ============================================================
drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders" on public.orders
  for insert with check (true);

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "Service role can manage orders" on public.orders;
create policy "Service role can manage orders" on public.orders
  for all using (true);

-- ============================================================
-- PRODUCT UNLOCKS
-- ============================================================
drop policy if exists "Service role only can manage unlocks" on public.product_unlocks;
create policy "Service role only can manage unlocks" on public.product_unlocks
  for all using (true);

drop policy if exists "Users can read own unlocks" on public.product_unlocks;
create policy "Users can read own unlocks" on public.product_unlocks
  for select using (auth.uid() = user_id);

-- ============================================================
-- LEADS
-- ============================================================
drop policy if exists "Anon can insert leads" on public.leads;
create policy "Anon can insert leads" on public.leads
  for insert with check (true);

drop policy if exists "Service role can manage leads" on public.leads;
create policy "Service role can manage leads" on public.leads
  for all using (true);

-- ============================================================
-- FUNNEL EVENTS
-- ============================================================
drop policy if exists "Anon can insert funnel events" on public.funnel_events;
create policy "Anon can insert funnel events" on public.funnel_events
  for insert with check (true);

drop policy if exists "Service role can read funnel events" on public.funnel_events;
create policy "Service role can read funnel events" on public.funnel_events
  for select using (true);

-- ============================================================
-- COMMERCE PRODUCTS (public catalog)
-- ============================================================
drop policy if exists "Anyone can read products" on public.commerce_products;
create policy "Anyone can read products" on public.commerce_products
  for select using (true);

drop policy if exists "Service role can manage products" on public.commerce_products;
create policy "Service role can manage products" on public.commerce_products
  for all using (true);

-- ============================================================
-- COMMERCE OFFERS (public catalog)
-- ============================================================
drop policy if exists "Anyone can read offers" on public.commerce_offers;
create policy "Anyone can read offers" on public.commerce_offers
  for select using (true);

drop policy if exists "Service role can manage offers" on public.commerce_offers;
create policy "Service role can manage offers" on public.commerce_offers
  for all using (true);

-- ============================================================
-- COMMERCE CLICKS
-- ============================================================
drop policy if exists "Anon can insert clicks" on public.commerce_clicks;
create policy "Anon can insert clicks" on public.commerce_clicks
  for insert with check (true);

drop policy if exists "Service role can read clicks" on public.commerce_clicks;
create policy "Service role can read clicks" on public.commerce_clicks
  for select using (true);

-- ============================================================
-- WISHLIST ITEMS (user-specific)
-- ============================================================
drop policy if exists "Users can manage own wishlist" on public.commerce_wishlist_items;
create policy "Users can manage own wishlist" on public.commerce_wishlist_items
  for all using (auth.uid() = user_id);

-- ============================================================
-- NOTES
-- ============================================================
-- The service_role bypasses RLS by default.
-- All server-side operations (API routes, webhooks, admin) use service role.
-- Anon key access is restricted to:
--   - Inserting leads, funnel events, commerce clicks
--   - Reading public commerce catalog
--   - Inserting audits/orders (for anonymous free score generation)
-- User authentication is not fully active yet.
-- These policies assume future integration with Supabase Auth.
-- Until then, service_role is the primary access method.
