import type { LaunchChecklistItem, ProductionWarning } from "@/types/launch";
import { getItem, setItem } from "@/lib/storage/localStore";

const CHECKLIST_KEY = "auracheck:v1:production_launch_checklist";

const DEFAULT_CHECKLIST: LaunchChecklistItem[] = [
  { id: "vercel_deploy", label: "Vercel deployment works", category: "deployment", checked: false },
  { id: "domain_connected", label: "fixmyaura.shop connected", category: "deployment", checked: false },
  { id: "app_url_set", label: "NEXT_PUBLIC_APP_URL set to https://fixmyaura.shop", category: "deployment", checked: false },
  { id: "supabase_project", label: "Supabase project created", category: "supabase", checked: false },
  { id: "supabase_schema", label: "Supabase schema applied", category: "supabase", checked: false },
  { id: "supabase_rls", label: "Supabase RLS reviewed", category: "supabase", checked: false },
  { id: "storage_bucket", label: "audit-images bucket exists", category: "supabase", checked: false },
  { id: "razorpay_test", label: "Razorpay test payment works", category: "razorpay", checked: false },
  { id: "razorpay_webhook", label: "Razorpay webhook configured", category: "razorpay", checked: false },
  { id: "razorpay_live_warning", label: "Razorpay live mode not enabled until test mode passes", category: "razorpay", checked: false },
  { id: "upi_fallback", label: "UPI fallback checked", category: "payments", checked: false },
  { id: "admin_code_changed", label: "Admin code changed from ADMINDEMO", category: "security", checked: false },
  { id: "demo_code_changed", label: "Demo unlock code changed from AURADEMO", category: "security", checked: false },
  { id: "support_whatsapp", label: "Support WhatsApp set", category: "support", checked: false },
  { id: "support_email", label: "Support email set", category: "support", checked: false },
  { id: "privacy_reviewed", label: "Privacy/terms reviewed", category: "legal", checked: false },
  { id: "affiliate_disclosure", label: "Affiliate disclosure visible", category: "legal", checked: false },
  { id: "product_links", label: "Product links checked", category: "commerce", checked: false },
  { id: "mobile_test", label: "Mobile upload tested", category: "testing", checked: false },
  { id: "test_49", label: "₹49 product tested", category: "testing", checked: false },
  { id: "test_99", label: "₹99 product tested", category: "testing", checked: false },
  { id: "test_299", label: "₹299 product tested", category: "testing", checked: false },
  { id: "test_499", label: "₹499 product tested", category: "testing", checked: false },
  { id: "backup_export", label: "Backup/export tested", category: "testing", checked: false },
  { id: "build_passes", label: "npm run build passes", category: "testing", checked: false },
  { id: "wardrobe_links", label: "Wardrobe links tested", category: "commerce", checked: false },
  { id: "analytics_checked", label: "Analytics/funnel checked", category: "analytics", checked: false },
];

export function getLaunchChecklist(): LaunchChecklistItem[] {
  const stored = getItem<LaunchChecklistItem[] | null>(CHECKLIST_KEY, null);
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  return DEFAULT_CHECKLIST;
}

export function toggleChecklistItem(id: string): LaunchChecklistItem[] {
  const items = getLaunchChecklist();
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) {
    items[idx].checked = !items[idx].checked;
    items[idx].checkedAt = items[idx].checked ? new Date().toISOString() : undefined;
    setItem(CHECKLIST_KEY, items);
  }
  return items;
}

export function resetChecklist(): void {
  setItem(CHECKLIST_KEY, DEFAULT_CHECKLIST);
}

export function getProductionWarnings(): ProductionWarning[] {
  const warnings: ProductionWarning[] = [];
  const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  const demoCode = process.env.NEXT_PUBLIC_DEMO_UNLOCK_CODE || "AURADEMO";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const supportWhatsApp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (adminCode === "ADMINDEMO") warnings.push({ type: "critical", message: "Admin code is default ADMINDEMO. Change before production.", fix: "Set NEXT_PUBLIC_LOCAL_ADMIN_CODE to a strong value." });
  if (demoCode === "AURADEMO") warnings.push({ type: "critical", message: "Demo unlock code is default AURADEMO. Change before production.", fix: "Set NEXT_PUBLIC_DEMO_UNLOCK_CODE to a strong value." });
  if (appUrl.includes("localhost")) warnings.push({ type: "critical", message: "App URL is localhost.", fix: "Set NEXT_PUBLIC_APP_URL to production URL." });
  if (!razorpaySecret) warnings.push({ type: "critical", message: "RAZORPAY_KEY_SECRET not set. Payments will fail.", fix: "Set RAZORPAY_KEY_SECRET in Vercel env." });
  if (!supabaseUrl || !supabaseKey) warnings.push({ type: "warning", message: "Supabase not configured. App runs in localStorage mode.", fix: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." });
  if (!supportEmail) warnings.push({ type: "warning", message: "No support email configured.", fix: "Set NEXT_PUBLIC_SUPPORT_EMAIL." });
  if (!supportWhatsApp) warnings.push({ type: "warning", message: "No support WhatsApp configured.", fix: "Set NEXT_PUBLIC_OWNER_WHATSAPP." });

  return warnings;
}

export function getChecklistProgress(): { checked: number; total: number; percent: number } {
  const items = getLaunchChecklist();
  const checked = items.filter((i) => i.checked).length;
  return { checked, total: items.length, percent: Math.round((checked / items.length) * 100) };
}
