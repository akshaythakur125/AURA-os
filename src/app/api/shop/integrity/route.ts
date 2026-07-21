import { NextResponse } from "next/server";
import { getAllLooks } from "@/lib/shop/catalog";
import { verifyCatalog } from "@/lib/shop/integrity";
import { getRotationEpoch, getNextRotation, hoursUntilNextRotation } from "@/lib/shop/rotation";

// Live "no product mismatch" proof. Audits every look's image/link/price
// invariants on demand. 200 + { ok: true, issues: [] } when clean; 500 when a
// mismatch is detected so monitoring can alarm on it.

export const dynamic = "force-dynamic";

export async function GET() {
  const report = verifyCatalog(getAllLooks());

  const body = {
    ...report,
    rotation: {
      everyHours: 72,
      epoch: getRotationEpoch(),
      nextRotation: getNextRotation().toISOString(),
      hoursUntilNextRotation: hoursUntilNextRotation(),
    },
  };

  return NextResponse.json(body, { status: report.ok ? 200 : 500 });
}
