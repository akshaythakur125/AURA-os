import { NextRequest, NextResponse } from "next/server";
import { importFeed, previewImport } from "@/lib/commerce/feeds/importFeed";
import type { FeedSourceType } from "@/types/feedImport";
import { isAuthenticated } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sourceType = (formData.get("sourceType") as FeedSourceType) || "manual_csv";
    const sourceName = (formData.get("sourceName") as string) || "Feed Import";
    const storeKey = formData.get("storeKey") as string | undefined;
    const previewOnly = formData.get("preview") === "true";

    if (!file && !formData.get("content")) {
      return NextResponse.json({ success: false, error: "No file or content provided" }, { status: 400 });
    }

    let content: string;
    let fileName: string | undefined;

    if (file) {
      content = await file.text();
      fileName = file.name;
    } else {
      content = formData.get("content") as string;
    }

    if (previewOnly) {
      const preview = previewImport(content, sourceType, fileName);
      return NextResponse.json({ success: true, preview });
    }

    const result = await importFeed(content, sourceType, sourceName, {
      storeKey,
      fileName,
      rebuildIndex: formData.get("rebuildIndex") !== "false",
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
