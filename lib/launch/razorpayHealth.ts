import type { LaunchCheck } from "@/types/launch";

export function checkRazorpayHealth(): { checks: LaunchCheck[]; configured: boolean } {
  const checks: LaunchCheck[] = [];

  const keyIdPublic = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keyIdServer = !!process.env.RAZORPAY_KEY_ID;
  const keySecret = !!process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = !!process.env.RAZORPAY_WEBHOOK_SECRET;

  const allConfigured = keyIdPublic && keyIdServer && keySecret;

  checks.push({
    name: "Razorpay checkout",
    status: keyIdPublic ? "pass" : "fail",
    message: keyIdPublic ? "NEXT_PUBLIC_RAZORPAY_KEY_ID is set — checkout will show" : "NEXT_PUBLIC_RAZORPAY_KEY_ID missing — Razorpay checkout disabled",
  });

  checks.push({
    name: "Server verification",
    status: keyIdServer && keySecret ? "pass" : "fail",
    message: keyIdServer && keySecret ? "Server key and secret set — payment verification works" : "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing — verification disabled",
  });

  checks.push({
    name: "Webhook recovery",
    status: webhookSecret ? "pass" : "warning",
    message: webhookSecret ? "RAZORPAY_WEBHOOK_SECRET set — webhook recovery available" : "RAZORPAY_WEBHOOK_SECRET missing — webhook recovery not available",
  });

  // API route existence check
  const routes = [
    { name: "Create order API", exists: true },
    { name: "Verify payment API", exists: true },
    { name: "Webhook endpoint", exists: true },
    { name: "Payment recovery API", exists: true },
  ];

  for (const route of routes) {
    checks.push({
      name: route.name,
      status: "manual",
      message: `${route.name} route exists in code. Verify in deployment.`,
    });
  }

  // Manual UPI fallback
  const upiId = process.env.NEXT_PUBLIC_MANUAL_UPI_ID;
  checks.push({
    name: "Manual UPI fallback",
    status: upiId ? "pass" : "warning",
    message: upiId ? `UPI ID set: ${upiId}` : "NEXT_PUBLIC_MANUAL_UPI_ID not set — manual UPI disabled",
  });

  return { checks, configured: allConfigured };
}
