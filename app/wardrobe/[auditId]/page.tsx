"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById } from "@/lib/storage/auditStore";
import { buildAuraCommercePlan } from "@/lib/wardrobe/auraCommerceEngine";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { trackStoreClick } from "@/lib/commerce/commerceTracking";
import { getClickUrl } from "@/lib/commerce/affiliateLinks";
import type { AuraCommercePlan, StoreKey } from "@/types/commerce";

export default function AuditWardrobePage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = use(params);
  const audit = getAuditById(auditId);

  const [plan] = useState<AuraCommercePlan | null>(() => {
    if (!audit || !audit.freeResult) return null;
    try {
      return buildAuraCommercePlan({
        freeResult: audit.freeResult as unknown as Record<string, unknown>,
        quickFixReport: audit.quickFixReport as unknown as Record<string, unknown> | undefined,
        fullReport: audit.fullReport as unknown as Record<string, unknown> | null | undefined,
        personalization: audit.personalization as unknown as Record<string, unknown> | null | undefined,
        goal: audit.goal || undefined,
        budget: audit.budgetRange || undefined,
        freeScore: audit.freeScore || undefined,
      });
    } catch {
      return null;
    }
  });

  if (!audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Audit not found</h1>
          <p className="mb-6 text-sm text-gray-400">Create an aura check first to get personalized wardrobe recommendations.</p>
          <Button asChild><Link href="/audit/new">Start Aura Check</Link></Button>
        </div>
      </Container>
    );
  }

  if (!audit.freeResult) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Generate your free score first</h1>
          <p className="mb-6 text-sm text-gray-400">Generate your free Aura Score first to personalize wardrobe recommendations.</p>
          <Button asChild><Link href={`/audit/${auditId}`}>Back to Audit</Link></Button>
        </div>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="text-sm text-gray-500">Could not generate wardrobe plan. Please try again.</div>
        </div>
      </Container>
    );
  }

  function handleStoreClick(url: string, storeKey: string, productId: string, offerId: string, price: number, isAffiliate: boolean) {
    trackStoreClick(storeKey as StoreKey, productId, offerId, price, isAffiliate, "wardrobe_audit", auditId);
    window.open(url, "_blank");
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link href={`/audit/${auditId}`} className="text-xs text-purple-400 hover:underline">&larr; Back to audit</Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">Your Aura Wardrobe</h1>
        <p className="mb-8 text-sm text-gray-400">Personalized recommendations based on your Aura Check analysis.</p>

        {/* Diagnosis */}
        <Card className="mb-6 border-purple-500/20">
          <h2 className="mb-3 text-lg font-bold text-white">Style Diagnosis</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="warning">{plan.diagnosis.primaryAuraLeak.replace(/_/g, " ")}</Badge>
            <Badge variant="premium">{plan.diagnosis.styleDirection.replace(/_/g, " ")}</Badge>
          </div>
          <p className="mb-2 text-sm text-gray-300">{plan.diagnosis.explanation}</p>
          <p className="text-xs text-gray-500">Outfit principle: {plan.diagnosis.outfitPrinciple}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500">Palette: </span>
            {plan.diagnosis.colorPalette.map((c) => (
              <span key={c} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-400">{c}</span>
            ))}
          </div>
        </Card>

        {/* Best Single Upgrade */}
        {plan.bestSingleUpgrade && (
          <Card className="mb-6 border-emerald-500/20">
            <Badge variant="success" className="mb-2">Best Single Upgrade</Badge>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{plan.bestSingleUpgrade.product.title}</h3>
                <p className="mt-1 text-xs text-gray-400">{plan.bestSingleUpgrade.product.whyItImprovesAura}</p>
                <p className="mt-1 text-xs text-gray-500">{plan.bestSingleUpgrade.stylingTip}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">{formatPrice(plan.bestSingleUpgrade.cheapestOffer.price)}</div>
                <div className="text-xs text-gray-500">at {plan.bestSingleUpgrade.cheapestOffer.storeName}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleStoreClick(getClickUrl(plan.bestSingleUpgrade!.cheapestOffer), plan.bestSingleUpgrade!.cheapestOffer.storeKey, plan.bestSingleUpgrade!.product.id, plan.bestSingleUpgrade!.cheapestOffer.id, plan.bestSingleUpgrade!.cheapestOffer.price, plan.bestSingleUpgrade!.cheapestOffer.isAffiliate)}>
                View on {plan.bestSingleUpgrade.cheapestOffer.storeName}
              </Button>
              {plan.bestSingleUpgrade.bestValueOffer.storeKey !== plan.bestSingleUpgrade.cheapestOffer.storeKey && (
                <Button size="sm" variant="outline" onClick={() => handleStoreClick(getClickUrl(plan.bestSingleUpgrade!.bestValueOffer), plan.bestSingleUpgrade!.bestValueOffer.storeKey, plan.bestSingleUpgrade!.product.id, plan.bestSingleUpgrade!.bestValueOffer.id, plan.bestSingleUpgrade!.bestValueOffer.price, plan.bestSingleUpgrade!.bestValueOffer.isAffiliate)}>
                  Best value: {plan.bestSingleUpgrade.bestValueOffer.storeName} (₹{plan.bestSingleUpgrade.bestValueOffer.price})
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Top Recommendations */}
        <h2 className="mb-4 text-xl font-bold text-white">Recommended Items</h2>
        <div className="mb-8 space-y-3">
          {plan.topRecommendations.map((rec) => (
            <Card key={rec.product.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-white">{rec.product.title}</span>
                    {rec.buyPriority === "buy_first" && <Badge variant="success">Priority</Badge>}
                    {rec.buyPriority === "avoid_for_now" && <Badge variant="danger">Avoid</Badge>}
                    <span className="text-xs text-gray-500">{rec.product.category}</span>
                  </div>
                  <p className="text-xs text-gray-400">{rec.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{formatPrice(rec.cheapestOffer.price)}</div>
                  <div className="text-xs text-gray-500">{rec.cheapestOffer.storeName}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleStoreClick(getClickUrl(rec.cheapestOffer), rec.cheapestOffer.storeKey, rec.product.id, rec.cheapestOffer.id, rec.cheapestOffer.price, rec.cheapestOffer.isAffiliate)}>
                  View at {formatPrice(rec.cheapestOffer.price)}
                </Button>
                {rec.bestValueOffer.storeKey !== rec.cheapestOffer.storeKey && (
                  <Button size="sm" variant="ghost" onClick={() => handleStoreClick(getClickUrl(rec.bestValueOffer), rec.bestValueOffer.storeKey, rec.product.id, rec.bestValueOffer.id, rec.bestValueOffer.price, rec.bestValueOffer.isAffiliate)}>
                    Also at {rec.bestValueOffer.storeName}: {formatPrice(rec.bestValueOffer.price)}
                  </Button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-500">
                {rec.offersSortedByPrice.slice(0, 4).map((offer) => (
                  <span key={offer.id} className="rounded bg-white/5 px-1.5 py-0.5">
                    {offer.storeName}: {formatPrice(offer.price)}{offer.discountPercent ? ` (-${offer.discountPercent}%)` : ""}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Search-based Recommendations */}
        {plan && (
          <Card className="mb-6 border-blue-500/20">
            <h2 className="mb-2 text-lg font-bold text-white">Best aura-matching clothes from search</h2>
            <p className="mb-3 text-xs text-gray-400">
              Products ranked by aura impact, price value, and freshness from AuraCheck&rsquo;s product index.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/wardrobe/search?style=${plan.diagnosis.styleDirection}&leak=${plan.diagnosis.primaryAuraLeak}`}>Search {plan.diagnosis.styleDirection.replace(/_/g, " ")} products</Link>
              </Button>
              {plan.cheapestUsefulUpgrade && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/wardrobe/search?maxBudget=${plan.cheapestUsefulUpgrade.cheapestOffer.price + 500}&category=${plan.cheapestUsefulUpgrade.product.category}`}>Cheapest similar options</Link>
                </Button>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href={`/wardrobe/search?sort=best_value`}>Best value options</Link>
              </Button>
            </div>
            {plan.whatNotToBuy.length > 0 && (
              <p className="text-[10px] text-red-400">
                ⚠ What not to buy yet: {plan.whatNotToBuy.slice(0, 3).map((w) => w.product.title).join(", ")}
              </p>
            )}
          </Card>
        )}

        {/* Outfit Bundles */}
        <h2 className="mb-4 text-xl font-bold text-white">Outfit Bundles</h2>
        <div className="mb-8 space-y-4">
          {plan.outfitBundles.map((bundle) => (
            <Card key={bundle.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{bundle.title}</h3>
                <Badge variant="premium">{bundle.budgetRange}</Badge>
              </div>
              {bundle.items.length > 0 ? (
                <div className="space-y-2">
                  {bundle.items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                      <span className="text-gray-300">{item.product.title}</span>
                      <span className="text-amber-400">{formatPrice(item.cheapestOffer.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{bundle.whyThisBundleWorks}</p>
              )}
              {bundle.items.length > 0 && (
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-500">
                  <span>Total: <span className="text-emerald-400 font-bold">{formatPrice(bundle.totalCheapestPrice)}</span></span>
                  <span>Best value: <span className="text-amber-400">{formatPrice(bundle.totalBestValuePrice)}</span></span>
                </div>
              )}
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>{bundle.whyThisBundleWorks}</p>
                <p className="text-amber-400">{bundle.whatToAvoid}</p>
                <p className="text-purple-300">{bundle.finalAdvice}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* What Not to Buy */}
        {plan.whatNotToBuy.length > 0 && (
          <Card className="mb-8 border-red-500/20">
            <h3 className="mb-3 text-sm font-semibold text-red-400">What not to buy right now</h3>
            <div className="space-y-2">
              {plan.whatNotToBuy.map((item) => (
                <div key={item.product.id} className="rounded-lg bg-red-500/5 px-3 py-2">
                  <div className="text-sm text-white">{item.product.title}</div>
                  <div className="text-xs text-gray-400">{item.avoidReason || item.product.avoidIf}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Final Advice */}
        <Card className="mb-8 border-purple-500/20 bg-purple-500/5">
          <p className="text-sm text-gray-300">{plan.finalAdvice}</p>
        </Card>
      </div>
    </Container>
  );
}
