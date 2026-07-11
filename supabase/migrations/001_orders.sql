-- ponytail: orders table — stores every payment attempt
-- Run after Supabase is configured: supabase db push or supabase migration up

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  audit_id text not null,
  product_id text not null,
  customer_email text,
  currency text not null default 'INR',
  unit_amount integer not null, -- paise
  quantity integer not null default 1,
  total_amount integer not null, -- paise
  status text not null default 'created', -- created|pending|paid|failed|cancelled|refunded
  provider text not null default 'razorpay',
  provider_order_id text, -- Razorpay order_id
  provider_payment_id text, -- Razorpay payment_id
  payment_method text, -- upi|card|netbanking|wallet|unknown
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

-- Prevent duplicate orders for same audit+product
create unique index if not exists idx_orders_audit_product on orders (audit_id, product_id) where status in ('created', 'pending', 'paid');

-- Look up by Razorpay IDs
create index if not exists idx_orders_provider_order on orders (provider_order_id);
create index if not exists idx_orders_provider_payment on orders (provider_payment_id);
