import { NextResponse } from "next/server";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const type = searchParams.get("type") || "catalog";

    const { exportToJSON, exportToCSV, exportAffiliateLinksCSV, exportSponsoredCSV } = await import("@/lib/commerce/catalogImportExport");

    const products = WARDROBE_CATALOG;

    let content: string;
    let contentType: string;
    let filename: string;

    if (type === "affiliate") {
      content = exportAffiliateLinksCSV(products);
      contentType = "text/csv";
      filename = `auracheck-affiliate-links-${Date.now()}.csv`;
    } else if (type === "sponsored") {
      content = exportSponsoredCSV(products);
      contentType = "text/csv";
      filename = `auracheck-sponsored-${Date.now()}.csv`;
    } else if (type === "clicks") {
      content = "productId,offerId,storeKey,clickedAt\nNo click data available server-side. Export from /admin/commerce in browser.\n";
      contentType = "text/csv";
      filename = `auracheck-clicks-${Date.now()}.csv`;
    } else if (format === "csv") {
      content = exportToCSV(products);
      contentType = "text/csv";
      filename = `auracheck-catalog-${Date.now()}.csv`;
    } else {
      content = exportToJSON(products);
      contentType = "application/json";
      filename = `auracheck-catalog-${Date.now()}.json`;
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed: " + (error as Error).message }, { status: 500 });
  }
}
