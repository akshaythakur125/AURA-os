import { NextRequest, NextResponse } from "next/server";
import type { CommerceSearchInput } from "@/types/commerceSearch";
import { searchCommerceIndex } from "@/lib/commerce/search/searchCommerceIndex";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CommerceSearchInput;

    const result = await searchCommerceIndex(body);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
