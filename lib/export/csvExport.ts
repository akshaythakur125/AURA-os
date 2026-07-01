import type { CommerceClickEvent } from "@/types/commerce";
import { formatStoreName } from "@/config/storeDirectory";

export function exportClicksCSV(clicks: CommerceClickEvent[]): string {
  const headers = ["productId", "offerId", "storeKey", "storeName", "auditId", "source", "productPrice", "affiliateUsed", "clickedAt"];
  const rows: string[] = [headers.join(",")];

  for (const c of clicks) {
    rows.push([
      csvEscape(c.productId),
      csvEscape(c.offerId),
      c.storeKey,
      csvEscape(formatStoreName(c.storeKey)),
      c.auditId ? csvEscape(c.auditId) : "",
      csvEscape(c.source),
      c.productPrice.toString(),
      c.affiliateUsed ? "true" : "false",
      c.clickedAt,
    ].join(","));
  }

  return rows.join("\n");
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
