import { NextRequest, NextResponse } from "next/server";
import { initializeRegistry, getConnector } from "@/lib/commerce/connectors/connectorRegistry";
import { isAuthenticated } from "@/lib/admin/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!isAuthenticated(request)) {
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
