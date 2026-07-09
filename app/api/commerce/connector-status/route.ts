import { NextResponse } from "next/server";
import { getActiveConnectors } from "@/config/storeConnectors";
import { amazonConnectorStub } from "@/lib/commerce/connectors/amazonConnectorStub";
import { flipkartConnectorStub } from "@/lib/commerce/connectors/flipkartConnectorStub";
import { getConnectorStatuses } from "@/lib/storage/commerceSearchStore";
import { getSearchIndex } from "@/lib/storage/commerceSearchStore";

export async function GET() {
  try {
    const connectors = getActiveConnectors();
    const index = getSearchIndex();
    const storedStatuses = getConnectorStatuses();

    const statuses = connectors.map((conn) => {
      // Count indexed products for this connector
      const indexedCount = index.filter(
        (item) => item.storeKey === conn.storeKey || item.sourceName === conn.displayName
      ).length;

      // Check if there's a stored status
      const stored = storedStatuses.find((s) => s.connectorKey === conn.key);

      return {
        connectorKey: conn.key,
        displayName: conn.displayName,
        sourceType: conn.sourceType,
        isConfigured: conn.supportsLiveApi
          ? checkApiCredentials(conn.key)
          : conn.supportsFeedImport,
        isActive: conn.isActive,
        lastImportAt: stored?.lastImportAt || null,
        lastImportCount: stored?.lastImportCount || null,
        indexedProductCount: indexedCount,
        supportsLiveApi: conn.supportsLiveApi,
        supportsFeedImport: conn.supportsFeedImport,
        supportsAffiliateLinks: conn.supportsAffiliateLinks,
        notes: conn.notes,
      };
    });

    return NextResponse.json({
      success: true,
      connectors: statuses,
      totalIndexedProducts: index.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get connector status";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function checkApiCredentials(connectorKey: string): boolean {
  switch (connectorKey) {
    case "amazon_fashion":
      return amazonConnectorStub.getStatus().configured;
    case "flipkart_fashion":
      return flipkartConnectorStub.getStatus().configured;
    default:
      return false;
  }
}
