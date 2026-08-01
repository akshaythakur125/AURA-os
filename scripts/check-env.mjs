const env = process.env;
const has = (k) => Boolean((env[k] || "").trim());
const defaulted = (k, v) => (env[k] || "").trim().toUpperCase() === v;

let failed = false;
const rows = [];
function row(level, name, ok, detail) {
  if (level === "BLOCKING" && !ok) failed = true;
  rows.push({ level, name, ok, detail });
}

row("BLOCKING", "Razorpay live checkout", has("RAZORPAY_KEY_ID") && has("RAZORPAY_KEY_SECRET") && has("NEXT_PUBLIC_RAZORPAY_KEY_ID"), "RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NEXT_PUBLIC_RAZORPAY_KEY_ID");
row("BLOCKING", "Canonical app URL", has("NEXT_PUBLIC_APP_URL"), "NEXT_PUBLIC_APP_URL");
row("BLOCKING", "Support contact", has("NEXT_PUBLIC_SUPPORT_EMAIL"), "NEXT_PUBLIC_SUPPORT_EMAIL");
row("RECOMMENDED", "Supabase entitlements", has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY") && has("SUPABASE_SERVICE_ROLE_KEY"), "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY");
row("RECOMMENDED", "PostHog analytics", has("NEXT_PUBLIC_POSTHOG_KEY"), "NEXT_PUBLIC_POSTHOG_KEY");
row("RECOMMENDED", "Cron protection", has("CRON_SECRET"), "CRON_SECRET");
row("WARNING", "Public admin demo code", !defaulted("NEXT_PUBLIC_LOCAL_ADMIN_CODE", "ADMINDEMO"), "NEXT_PUBLIC_LOCAL_ADMIN_CODE must not be ADMINDEMO in production");
row("WARNING", "Public unlock demo code", !defaulted("NEXT_PUBLIC_DEMO_UNLOCK_CODE", "AURADEMO"), "NEXT_PUBLIC_DEMO_UNLOCK_CODE must not be AURADEMO in production");

console.log("\nAuraCheck launch env check\n");
for (const r of rows) {
  const icon = r.ok ? "PASS" : r.level === "BLOCKING" ? "FAIL" : "WARN";
  console.log(`${icon.padEnd(4)} ${r.level.padEnd(11)} ${r.name} - ${r.detail}`);
}

if (failed) {
  console.error("\nMissing blocking launch env vars. Set them before taking live payments.");
  process.exit(1);
}

console.log("\nNo blocking env gaps found.");
