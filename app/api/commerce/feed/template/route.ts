import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";

  if (format === "csv") {
    const csv = `sourceProductId,title,category,subCategory,storeKey,storeName,brand,price,mrp,productUrl,affiliateUrl,imageUrl,availabilityStatus,color,fit,material,styleTags,auraLeakTags,goalTags
,Example Black Overshirt,overshirt,,myntra,Myntra,,1299,1999,https://www.myntra.com/example,,,available,black,regular,cotton,premium_minimal;college_casual,too_plain;low_premium_signal,casual
,Example White Sneakers,sneakers,,ajio,AJIO,,2499,3999,https://www.ajio.com/example,,,available,white,,leather,clean_basic;street_smart,too_plain;outfit_inconsistency,casual
,Example Oxford Shirt,shirt,,amazon_fashion,Amazon Fashion,,1599,2499,https://www.amazon.in/example,,,available,white;slim,formal,cotton,corporate_sharp,professional_mismatch,office`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=auracheck_feed_template.csv",
      },
    });
  }

  const json = JSON.stringify([
    {
      sourceProductId: "",
      title: "Example Black Overshirt",
      category: "overshirt",
      subCategory: "",
      storeKey: "myntra",
      storeName: "Myntra",
      brand: "",
      price: 1299,
      mrp: 1999,
      productUrl: "https://www.myntra.com/example",
      affiliateUrl: "",
      imageUrl: "",
      availabilityStatus: "available",
      color: "black",
      fit: "regular",
      material: "cotton",
      styleTags: "premium_minimal;college_casual",
      auraLeakTags: "too_plain;low_premium_signal",
      goalTags: "casual",
    },
    {
      sourceProductId: "",
      title: "Example White Sneakers",
      category: "sneakers",
      subCategory: "",
      storeKey: "ajio",
      storeName: "AJIO",
      brand: "",
      price: 2499,
      mrp: 3999,
      productUrl: "https://www.ajio.com/example",
      affiliateUrl: "",
      imageUrl: "",
      availabilityStatus: "available",
      color: "white",
      fit: "",
      material: "leather",
      styleTags: "clean_basic;street_smart",
      auraLeakTags: "too_plain;outfit_inconsistency",
      goalTags: "casual",
    },
  ], null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=auracheck_feed_template.json",
    },
  });
}
