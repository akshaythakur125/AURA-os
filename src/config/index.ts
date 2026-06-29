export const config = {
  app: {
    name: "AuraCheck",
    tagline: "Find Your Biggest Status Leak",
    description:
      "AI-style first-impression audit for photos, profiles, outfits, and lifestyle presentation.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  support: {
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@auracheck.in",
  },
  payments: {
    upiId: process.env.NEXT_PUBLIC_MANUAL_UPI_ID || "",
    adminUnlockCode: process.env.ADMIN_UNLOCK_CODE || "AURA2024",
  },
  pricing: {
    basic: 99,
    premium: 299,
    currency: "INR",
  },
} as const;
