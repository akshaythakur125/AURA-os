-- ponytail: entitlements — explicit access grants, not inferred from order status

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  audit_id text not null,
  product_id text not null,
  status text not null default 'active', -- active|expired|revoked|refunded
  starts_at timestamptz not null default now(),
  expires_at timestamptz, -- null = never expires (one-time purchase)
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- One active entitlement per audit+product
create unique index if not exists idx_entitlements_audit_product on entitlements (audit_id, product_id) where status = 'active';

-- Fast lookup by audit
create index if not exists idx_entitlements_audit on entitlements (audit_id);
