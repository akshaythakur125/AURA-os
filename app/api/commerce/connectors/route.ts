import { NextResponse } from "next/server";
import { initializeRegistry, getConnectorStatuses } from "@/lib/commerce/connectors/connectorRegistry";

export async function GET() {
  try {
    initializeRegistry();
    const statuses = getConnectorStatuses();

    const safe = statuses.map((s) => ({
      key: s.key,
      displayName: s.displayName,
      provider: s.provider,
      sourceType: s.sourceType,
      isConfigured: s.isConfigured,
      supportsTest: s.supportsTest,
      supportsRefresh: s.supportsRefresh,
      supportsPriceRefresh: s.supportsPriceRefresh,
      supportsProductImport: s.supportsProductImport,
      lastRunAt: s.lastRunAt,
      lastStatus: s.lastStatus,
      missingEnvVars: s.missingEnvVars,
      publicNotes: s.publicNotes,
    }));

    return NextResponse.json({ success: true, connectors: safe });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
