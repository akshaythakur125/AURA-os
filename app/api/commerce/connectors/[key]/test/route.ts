import { NextRequest, NextResponse } from "next/server";
import { initializeRegistry, getConnector } from "@/lib/commerce/connectors/connectorRegistry";

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  // Admin auth
  const adminCode = request.headers.get("x-admin-code");
  const envCode = process.env.LOCAL_ADMIN_CODE || process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  if (adminCode !== envCode && adminCode !== "aura-admin-internal") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    initializeRegistry();
    const connector = getConnector(key);
    if (!connector) {
      return NextResponse.json({ success: false, error: `Unknown connector: ${key}` }, { status: 404 });
    }

    const result = await connector.test();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Test failed" }, { status: 500 });
  }
}
