"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAudits } from "@/lib/storage/auditStore";
import { buildAuraCommercePlan } from "@/lib/wardrobe/auraCommerceEngine";
import type { AuraCommercePlan } from "@/types/commerce";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import { getActiveStores } from "@/config/storeDirectory";

export default function WardrobePage() {
  const audits = getAudits();
  const scoredAudits = audits.filter((a) => a.freeResult);

  const [plan, setPlan] = useState<AuraCommercePlan | null>(null);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const latestScored = scoredAudits[0];

  function generatePlan(goal?: string) {
    setLoading(true);
    try {
      const result = buildAuraCommercePlan({
        goal: goal || selectedGoal || undefined,
        freeResult: (latestScored?.freeResult as unknown as Record<string, unknown>) || undefined,
        freeScore: latestScored?.freeScore || undefined,
      });
      setPlan(result);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (scoredAudits.length > 0 && !plan) {
      generatePlan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stores = getActiveStores();

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* ─── Hero ─── */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Find clothes that improve your Aura</h1>
          <p className="mx-auto max-w-2xl text-sm text-gray-400">
            Upload a photo or choose your latest Aura audit. AuraCheck diagnoses your visual gap
            and compares Indian shopping options before you buy.
          </p>
        </div>

        {/* ─── CTAs ─── */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Link href="/audit/new">
            <Button>Start Free Aura Check</Button>
          </Link>
          {latestScored && (
            <Link href={`/wardrobe/${latestScored.id}`}>
              <Button variant="outline">Open from latest audit</Button>
            </Link>
          )}
        </div>

        {/* ─── Manual Style Finder ─── */}
        {!latestScored && (
          <Card className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-white">Manual Style Finder</h2>
            <p className="mb-4 text-xs text-gray-400">No audit found. Tell us your goal to get personalized recommendations.</p>
            <div className="mb-4">
              <label className="mb-1 block text-xs text-gray-500">Your goal</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                <option value="">Select a goal</option>
                <option value="casual">Casual everyday look</option>
                <option value="dating">Dating profile improvement</option>
                <option value="college">College / social</option>
                <option value="office">Office / professional</option>
                <option value="creator">Instagram / content creator</option>
                <option value="gym">Gym / fitness</option>
              </select>
            </div>
            <Button onClick={() => generatePlan()} disabled={loading}>
              {loading ? "Analyzing..." : "Get Recommendations"}
            </Button>
          </Card>
        )}

        {/* ─── Loading ─── */}
        {loading && (
          <div className="mb-8 text-center text-sm text-gray-500">Analyzing your visual profile...</div>
        )}

        {/* ─── Plan Results ─── */}
        {plan && (
          <>
            {/* Diagnosis */}
            <Card className="mb-6 border-purple-500/20">
              <h2 className="mb-3 text-lg font-bold text-white">Your Aura Style Diagnosis</h2>
              <div className="mb-3">
                <Badge variant="warning">{plan.diagnosis.primaryAuraLeak.replace(/_/g, " ")}</Badge>
                <Badge variant="premium" className="ml-2">{plan.diagnosis.styleDirection.replace(/_/g, " ")}</Badge>
              </div>
              <p className="mb-2 text-sm text-gray-300">{plan.diagnosis.explanation}</p>
              <p className="text-xs text-gray-500">Principle: {plan.diagnosis.outfitPrinciple}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {plan.diagnosis.colorPalette.map((c) => (
                  <span key={c} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-400">{c}</span>
                ))}
              </div>
            </Card>

            {/* Best Single Upgrade */}
            {plan.bestSingleUpgrade && (
              <Card className="mb-6 border-emerald-500/20">
                <h3 className="mb-2 text-sm font-semibold text-emerald-400">Best single upgrade for your aura</h3>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold text-white">{plan.bestSingleUpgrade.product.title}</div>
                    <p className="mt-1 text-xs text-gray-400">{plan.bestSingleUpgrade.product.whyItImprovesAura}</p>
                    <p className="mt-1 text-xs text-gray-500">{plan.bestSingleUpgrade.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 line-through">{plan.bestSingleUpgrade.cheapestOffer.mrp ? `₹${plan.bestSingleUpgrade.cheapestOffer.mrp}` : ""}</div>
                    <div className="text-2xl font-bold text-emerald-400">{formatPrice(plan.bestSingleUpgrade.cheapestOffer.price)}</div>
                    <div className="text-xs text-gray-500">at {plan.bestSingleUpgrade.cheapestOffer.storeName}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => window.open(plan.bestSingleUpgrade!.cheapestOffer.url, "_blank")}>
                    View on {plan.bestSingleUpgrade.cheapestOffer.storeName}
                  </Button>
                  {plan.bestSingleUpgrade.bestValueOffer.storeKey !== plan.bestSingleUpgrade.cheapestOffer.storeKey && (
                    <Button size="sm" variant="outline" onClick={() => window.open(plan.bestSingleUpgrade!.bestValueOffer.url, "_blank")}>
                      Compare at {plan.bestSingleUpgrade.bestValueOffer.storeName} (₹{plan.bestSingleUpgrade.bestValueOffer.price})
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Top Recommendations */}
            <h2 className="mb-4 text-xl font-bold text-white">Top Recommendations</h2>
            <div className="mb-8 space-y-4">
              {plan.topRecommendations.slice(0, 6).map((rec) => (
                <Card key={rec.product.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-white">{rec.product.title}</span>
                        {rec.buyPriority === "buy_first" && <Badge variant="success">Priority</Badge>}
                        {rec.buyPriority === "avoid_for_now" && <Badge variant="danger">Avoid</Badge>}
                      </div>
                      <p className="text-xs text-gray-400">{rec.product.whyItImprovesAura}</p>
                      <p className="mt-1 text-xs text-gray-500">{rec.stylingTip}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{formatPrice(rec.cheapestOffer.price)}</div>
                      <div className="text-xs text-gray-500">at {rec.cheapestOffer.storeName}</div>
                      {rec.highestDiscountOffer && (
                        <div className="text-xs text-emerald-400">{rec.highestDiscountOffer.discountPercent}% off at {rec.highestDiscountOffer.storeName}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Button size="sm" onClick={() => window.open(rec.cheapestOffer.url, "_blank")}>
                      View on {rec.cheapestOffer.storeName}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(rec.bestValueOffer.url, "_blank")}>
                      Best value: {rec.bestValueOffer.storeName} (₹{rec.bestValueOffer.price})
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Outfit Bundles */}
            <h2 className="mb-4 text-xl font-bold text-white">Outfit Bundles by Budget</h2>
            <div className="mb-8 space-y-4">
              {plan.outfitBundles.slice(0, 4).map((bundle) => (
                <Card key={bundle.id} className={bundle.budgetRange === "₹0" ? "border-emerald-500/20" : ""}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{bundle.title}</h3>
                    <Badge variant="premium">{bundle.budgetRange}</Badge>
                  </div>
                  {bundle.items.length > 0 ? (
                    <div className="space-y-2">
                      {bundle.items.slice(0, 5).map((item) => (
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
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Total cheapest: <span className="text-emerald-400 font-bold">{formatPrice(bundle.totalCheapestPrice)}</span></span>
                      <span>Best value: <span className="text-amber-400 font-bold">{formatPrice(bundle.totalBestValuePrice)}</span></span>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    <p>{bundle.whyThisBundleWorks}</p>
                    <p className="mt-1 text-amber-400">{bundle.whatToAvoid}</p>
                    <p className="mt-1 text-purple-300">{bundle.finalAdvice}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* What Not to Buy */}
            {plan.whatNotToBuy.length > 0 && (
              <Card className="mb-8 border-red-500/20">
                <h3 className="mb-3 text-sm font-semibold text-red-400">What not to buy right now</h3>
                <div className="space-y-2">
                  {plan.whatNotToBuy.slice(0, 3).map((item) => (
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
          </>
        )}

        {/* ─── Stores ─── */}
        <Card className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-white">Supported stores</h3>
          <div className="flex flex-wrap gap-2">
            {stores.filter((s) => s.isActive).map((store) => (
              <a
                key={store.key}
                href={store.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-purple-500/30 hover:text-purple-300"
              >
                {store.displayName}
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Prices are from AuraCheck&rsquo;s MVP catalog and may not be live. Verify on store before buying.
            AuraCheck may earn affiliate commission from some links. Sponsored items do not automatically rank first.
          </p>
        </Card>

        {/* ─── Catalog stats ─── */}
        <div className="text-center text-xs text-gray-600">
          <p>{WARDROBE_CATALOG.length} products in catalog | {stores.length} store partners | Prices in INR</p>
        </div>
      </div>
    </Container>
  );
}
