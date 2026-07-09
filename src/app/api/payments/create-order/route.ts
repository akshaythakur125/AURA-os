import { getServerProductPrice, getServerProductName } from "@/lib/payments/serverUnlock";
import { findOfferByCode } from "@/config/offers";
import type { ProductType } from "@/types/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productType, offerCode, customerName, customerContact, userNote, auditId } = body as {
      productType?: string;
      offerCode?: string;
      customerName?: string;
      customerContact?: string;
      userNote?: string;
      auditId?: string;
    };

    if (!productType || !auditId) {
      return Response.json(
        { error: "Missing required fields: productType, auditId" },
        { status: 400 }
      );
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
        if (offer.discountType === "percent") {
          discountAmount = Math.round(originalAmount * (offer.discountValue / 100));
        } else {
          discountAmount = offer.discountValue;
        }
        if (offer.code === "AURA99") discountAmount = 0;
        finalAmount = Math.max(0, originalAmount - discountAmount);
        appliedOffer = offer.code;
      }
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const upiId = process.env.NEXT_PUBLIC_MANUAL_UPI_ID || "your-upi-id@upi";

    return Response.json({
      orderId,
      productType: pt,
      productName,
      originalAmount,
      discountAmount,
      finalAmount,
      appliedOffer: appliedOffer || null,
      upiId,
      customerName: customerName?.trim() || null,
      customerContact: customerContact?.trim() || null,
      userNote: userNote?.trim() || null,
    });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
