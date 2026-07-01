import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".json")) {
      const { parseJSONImport } = await import("@/lib/commerce/catalogImportExport");
      const result = parseJSONImport(text);
      return NextResponse.json(result);
    } else if (fileName.endsWith(".csv")) {
      const { parseCSVRow } = await import("@/lib/commerce/catalogImportExport");

      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const products: import("@/types/commerce").CommerceProduct[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

        const { product, errors: rowErrors } = parseCSVRow(row, i + 1);
        if (product) {
          products.push(product);
        } else {
          errors.push(...rowErrors);
        }
      }

      return NextResponse.json({
        success: true,
        importedCount: products.length,
        skippedCount: errors.length,
        errors,
        warnings: [],
        products,
      });
    } else {
      return NextResponse.json({ error: "Unsupported file format. Use .json or .csv" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Import failed: " + (error as Error).message }, { status: 500 });
  }
}
