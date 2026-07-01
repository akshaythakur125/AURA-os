-- ============================================================
-- AuraCheck — Supabase Production Schema
-- Run this in your Supabase SQL Editor to create all tables.
-- ============================================================

-- 1. app_users
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. audits
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete set null,
  anonymous_id text,
  audit_type text not null,
  goal text,
  budget_range text,
  image_url text,
  image_meta jsonb,
  deep_input jsonb,
  personalization jsonb,
  profile_text_input jsonb,
  free_score int,
  full_score int,
  report_status text,
  unlock_status text,
  unlocked_products text[] not null default '{}',
  free_result jsonb,
  quick_fix_report jsonb,
  full_report jsonb,
  dating_profile_report jsonb,
  glowup_plan jsonb,
  twin_result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.audits(id) on delete set null,
  user_id uuid references public.app_users(id) on delete set null,
  product_type text not null,
  product_name text not null,
  original_amount int not null,
  discount_code text,
  discount_amount int not null default 0,
  final_amount int not null,
  currency text not null default 'INR',
  status text not null,
  customer_name text,
  customer_contact text,
  upi_transaction_ref text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  generated_unlock_code text,
  recovery_state text,
  webhook_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unlocked_at timestamptz
);

-- 4. leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text,
  interest_product text,
  note text,
  source text,
  status text not null default 'new',
  contacted_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. analytics_events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  audit_id uuid,
  order_id uuid,
  product_type text,
  metadata jsonb,
  anonymous_id text,
  created_at timestamptz not null default now()
);

-- 6. affiliate_clicks
create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  audit_id uuid,
  source text,
  metadata jsonb,
  clicked_at timestamptz not null default now()
);

-- 7. referrals
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text,
  source text,
  metadata jsonb,
  claimed_at timestamptz not null default now()
);

-- 8. challenge_entries
create table if not exists public.challenge_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id text,
  audit_id uuid references public.audits(id) on delete set null,
  aura_score int,
  archetype text,
  biggest_status_leak text,
  share_card_data jsonb,
  created_at timestamptz not null default now()
);

-- 9. progress_comparisons
create table if not exists public.progress_comparisons (
  id uuid primary key default gen_random_uuid(),
  before_audit_id uuid references public.audits(id) on delete set null,
  after_audit_id uuid references public.audits(id) on delete set null,
  before_score int,
  after_score int,
  score_delta int,
  improved_signals jsonb,
  remaining_leaks jsonb,
  summary text,
  created_at timestamptz not null default now()
);

-- 10. product_unlocks
create table if not exists public.product_unlocks (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.audits(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  product_type text not null,
  unlock_method text,
  unlock_code text,
  unlocked_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_audits_anonymous_id on public.audits(anonymous_id);
create index if not exists idx_audits_user_id on public.audits(user_id);
create index if not exists idx_orders_audit_id on public.orders(audit_id);
create index if not exists idx_orders_product_type on public.orders(product_type);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_analytics_events_event_name on public.analytics_events(event_name);
create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at);
create index if not exists idx_leads_contact on public.leads(contact);
create index if not exists idx_product_unlocks_audit_id on public.product_unlocks(audit_id);

-- ============================================================
-- Updated-at trigger helper
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_app_users_updated_at
  before update on public.app_users
  for each row execute function public.set_updated_at();

create or replace trigger set_audits_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

create or replace trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- Commerce Engine Tables
-- ============================================================

create table if not exists public.commerce_products (
  id text primary key,
  title text not null,
  category text not null default 'tshirt',
  style_directions text[] default '{}',
  aura_leak_tags text[] default '{}',
  goal_tags text[] default '{}',
  color_tags text[] default '{}',
  fit_tags text[] default '{}',
  description text default '',
  why_it_improves_aura text default '',
  styling_tip text default '',
  avoid_if text,
  priority_score int default 50,
  is_sponsored boolean default false,
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_commerce_products_category on public.commerce_products(category);
create index if not exists idx_commerce_products_active on public.commerce_products(is_active);
create index if not exists idx_commerce_products_sponsored on public.commerce_products(is_sponsored);

create table if not exists public.commerce_offers (
  id text primary key,
  product_id text not null references public.commerce_products(id) on delete cascade,
  store_key text not null,
  store_name text not null,
  product_name text not null,
  price int not null,
  mrp int,
  discount_percent int,
  url text default '#',
  affiliate_url text,
  availability_status text default 'available',
  size_notes text,
  color_notes text,
  last_checked_text text default 'Listed in AuraCheck catalog',
  is_affiliate boolean default false,
  is_sponsored boolean default false,
  updated_at timestamptz default now()
);

create index if not exists idx_commerce_offers_product_id on public.commerce_offers(product_id);
create index if not exists idx_commerce_offers_store_key on public.commerce_offers(store_key);
create index if not exists idx_commerce_offers_affiliate on public.commerce_offers(is_affiliate);

create table if not exists public.commerce_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  offer_id text,
  store_key text not null,
  audit_id uuid,
  anonymous_id text,
  source text not null default 'unknown',
  price int default 0,
  affiliate_used boolean default false,
  is_sponsored boolean default false,
  metadata jsonb default '{}'::jsonb,
  clicked_at timestamptz default now()
);

create index if not exists idx_commerce_clicks_product_id on public.commerce_clicks(product_id);
create index if not exists idx_commerce_clicks_store_key on public.commerce_clicks(store_key);
create index if not exists idx_commerce_clicks_clicked_at on public.commerce_clicks(clicked_at);

create or replace trigger set_commerce_products_updated_at
  before update on public.commerce_products
  for each row execute function public.set_updated_at();

create or replace trigger set_commerce_offers_updated_at
  before update on public.commerce_offers
  for each row execute function public.set_updated_at();
