export interface SystemHealth {
  status: "ok" | "degraded" | "error";
  appVersion: string;
  buildMode: string;
  storageMode: string;
  supabase: HealthComponent;
  razorpay: HealthComponent;
  webhook: HealthComponent;
  commerceRefresh: HealthComponent;
  affiliate: HealthComponent;
  localStorage: boolean;
  latestEvents: HealthMetric;
  latestOrders: HealthMetric;
  timestamp: string;
}

export interface HealthComponent {
  configured: boolean;
  status: "ok" | "missing" | "error";
  message: string;
}

export interface HealthMetric {
  count: number;
  lastAt: string | null;
}
