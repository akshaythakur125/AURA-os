import { getServerProductPrice, getServerProductName } from "@/lib/payments/serverUnlock";
import { findOfferByCode } from "@/config/offers";
import type { ProductType } from "@/types/payment";

export const dynamic = "force-dynamic";

// ponytail: read env vars inside handler to avoid module-scope capture issues
async function createRazorpayOrder(amount: number, receipt: string) {
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${errBody}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productType, offerCode, customerName, customerContact, auditId } = body as {
      productType?: string;
      offerCode?: string;
      customerName?: string;
      customerContact?: string;
      auditId?: string;
    };

    if (!productType || !auditId) {
      return Response.json({ error: "Missing required fields: productType, auditId" }, { status: 400 });
    }

    const validTypes: ProductType[] = ["aura_report", "dating_audit", "glowup_plan"];
    if (!validTypes.includes(productType as ProductType)) {
      return Response.json({ error: "Invalid product type." }, { status: 400 });
    }

    const pt = productType as ProductType;
    const originalAmount = getServerProductPrice(pt);
    const productName = getServerProductName(pt);

    let finalAmount = originalAmount;
    let discountAmount = 0;
    let appliedOffer: string | undefined;

    if (offerCode && offerCode.trim()) {
      const offer = findOfferByCode(offerCode.trim());
      if (offer && offer.applicableProducts.includes(pt)) {
        discountAmount = offer.discountType === "percent"
          ? Math.round(originalAmount * (offer.discountValue / 100))
          : offer.discountValue;
        if (offer.code === "AURA99") discountAmount = 0;
        finalAmount = Math.max(0, originalAmount - discountAmount);
        appliedOffer = offer.code;
      }
    }

    const receipt = `aura_${auditId}_${pt}_${Date.now()}`;
    const order = await createRazorpayOrder(finalAmount, receipt);

    return Response.json({
      orderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
      amount: finalAmount,
      currency: "INR",
      productName,
      originalAmount,
      discountAmount,
      appliedOffer: appliedOffer || null,
      customerName: customerName?.trim() || null,
      customerContact: customerContact?.trim() || null,
    });
  } catch (e) {
    return Response.json({ error: "Failed to create order.", detail: String(e) }, { status: 500 });
  }
}
