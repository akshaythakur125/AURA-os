import { NextResponse } from "next/server";

// ponytail: payment status check — verifies with Razorpay API if an order is paid
// Used for recovery when user closes browser after payment

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { auditId, productType } = await request.json();

    if (!auditId || !productType) {
      return NextResponse.json({ unlocked: false, error: "Missing fields" }, { status: 400 });
    }

    // ponytail: without a DB storing order→audit mapping, we can't check by auditId
    // This endpoint will be more useful when orders are stored server-side
    // For now, return unlocked: false and let the user re-enter their code
    return NextResponse.json({ unlocked: false, message: "Please use your unlock code." });
  } catch {
    return NextResponse.json({ unlocked: false, error: "Status check failed" }, { status: 500 });
  }
}
