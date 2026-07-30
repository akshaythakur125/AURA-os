import { NextResponse } from "next/server";
import { getAllLooks } from "@/lib/shop/catalog";
import { buildPrimaryShopLink } from "@/lib/shop/linkBuilder";
import { getExactProductLink } from "@/lib/shop/exactProductLinks";

function withAmazonAssociateTag(url: string): string {
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  if (!associateTag) return url;

  const nextUrl = new URL(url);
  if (nextUrl.hostname.includes("amazon.in")) {
    nextUrl.searchParams.set("tag", associateTag);
  }
  return nextUrl.toString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lookId = searchParams.get("lookId");

  if (!lookId) {
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  const look = getAllLooks().find((item) => item.id === lookId);
  if (!look) {
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  const exact = getExactProductLink(lookId);
  const target = exact
    ? withAmazonAssociateTag(exact.productUrl)
    : buildPrimaryShopLink({
        category: look.category,
        keywords: look.keywords,
        gender: look.gender,
      });

  return NextResponse.redirect(target, 307);
}
