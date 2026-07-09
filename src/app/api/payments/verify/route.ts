import { validateUnlockCodeServer } from "@/lib/payments/serverUnlock";
import type { ProductType } from "@/types/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, auditId, productType } = body as {
      code?: string;
      auditId?: string;
      productType?: string;
    };

    if (!code || !auditId || !productType) {
      return Response.json(
        { error: "Missing required fields: code, auditId, productType" },
        { status: 400 }
      );
    }

    const validTypes: ProductType[] = ["aura_report", "dating_audit", "glowup_plan"];
    if (!validTypes.includes(productType as ProductType)) {
      return Response.json({ error: "Invalid product type." }, { status: 400 });
    }

    const result = validateUnlockCodeServer({
      code,
      auditId,
      productType: productType as ProductType,
    });

    if (result.valid) {
      return Response.json({ valid: true, message: result.reason });
    }

    return Response.json({ valid: false, message: result.reason }, { status: 401 });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
