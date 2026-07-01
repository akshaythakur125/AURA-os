-- ============================================================
-- AuraCheck — Row Level Security Policies
-- Run AFTER schema.sql.
--
-- IMPORTANT:
-- Full auth/user system will be added later.
-- For now, all table access is restricted to the service role.
-- The anon key has minimal to no direct table access.
-- Production should use authenticated users + server actions / API routes.
-- ============================================================

-- Enable RLS on all tables
alter table if exists public.app_users enable row level security;
alter table if exists public.audits enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.leads enable row level security;
alter table if exists public.analytics_events enable row level security;
alter table if exists public.affiliate_clicks enable row level security;
alter table if exists public.referrals enable row level security;
alter table if exists public.challenge_entries enable row level security;
alter table if exists public.progress_comparisons enable row level security;
alter table if exists public.product_unlocks enable row level security;

-- ============================================================
-- Service role policies — full access for server-side operations
-- ============================================================

create policy "service_role_all_app_users"
  on public.app_users for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_audits"
  on public.audits for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_orders"
  on public.orders for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_leads"
  on public.leads for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_analytics_events"
  on public.analytics_events for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_affiliate_clicks"
  on public.affiliate_clicks for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_referrals"
  on public.referrals for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_challenge_entries"
  on public.challenge_entries for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_progress_comparisons"
  on public.progress_comparisons for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_product_unlocks"
  on public.product_unlocks for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- Anon (public) policies — intentionally minimal for now
-- These are safe starter policies for the MVP phase.
-- In production, replace with authenticated-user policies.
-- ============================================================

-- Allow anyone to insert leads (contact forms)
create policy "anon_insert_leads"
  on public.leads for insert
  to anon
  with check (true);

-- Allow anyone to insert analytics events
create policy "anon_insert_analytics_events"
  on public.analytics_events for insert
  to anon
  with check (true);

-- No select/update/delete for anon on any table.
-- All reads go through server actions / API routes using service role.
