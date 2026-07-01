"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import { isSupabaseConfigured, getStorageMode } from "@/lib/storage/storageMode";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import type { CommerceProduct, ProductOffer, WardrobeCategory, AuraStyleDirection, AuraLeakTag, StoreKey } from "@/types/commerce";
import type { ValidationWarning, StorePerformance, ProductAnalytics, CommerceSettings } from "@/types/commerceAdmin";
import { validateProduct, validateCatalog } from "@/lib/commerce/catalogValidation";
import { getAdminCatalog, saveAdminCatalog, getEffectiveCatalog, getCatalogSource, deleteProductFromAdmin, setProductActive, addProductToAdmin, updateProductInAdmin } from "@/lib/storage/commerceCatalogStore";
import { getCommerceClicks, getCommerceAnalytics, getStorePerformance, getProductClickDetails, type ExtendedClickEvent } from "@/lib/storage/commerceClickStore";
import { getAffiliateLinks, getCommerceSettings, saveCommerceSettings } from "@/lib/commerce/affiliateManager";
import { formatStoreName } from "@/config/storeDirectory";
import { downloadJSON, downloadCSVString } from "@/lib/export/downloadUtils";
import { exportToJSON, exportToCSV, exportAffiliateLinksCSV, exportSponsoredCSV } from "@/lib/commerce/catalogImportExport";
import { exportClicksCSV } from "@/lib/export/csvExport";

const CATEGORIES: WardrobeCategory[] = ["tshirt", "shirt", "overshirt", "jeans", "trousers", "chinos", "sneakers", "formal_shoes", "watch", "belt", "sunglasses", "jacket", "hoodie", "kurta", "perfume", "grooming", "background_item", "photo_accessory", "jewellery", "wallet"];
const STYLE_DIRECTIONS: AuraStyleDirection[] = ["clean_basic", "premium_minimal", "urban_aspirational", "soft_luxury", "creator_bold", "college_casual", "corporate_sharp", "dating_warm", "understated_confident", "street_smart", "ethnic_clean", "gym_casual"];
const LEAK_TAGS: AuraLeakTag[] = ["weak_lighting", "busy_background", "weak_clarity", "weak_framing", "outfit_inconsistency", "low_premium_signal", "over_flex", "too_plain", "color_mismatch", "weak_profile_order", "professional_mismatch", "dating_warmth_missing", "creator_energy_missing"];
const STORE_KEYS: StoreKey[] = ["myntra", "ajio", "amazon_fashion", "flipkart_fashion", "tata_cliq", "nykaa_fashion", "meesho", "snitch", "souled_store", "bewakoof", "hm_india", "narzo_manual", "other"];

function generateId(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
  const ts = Date.now().toString(36);
  return `${slug}_${ts}`;
}

export default function CommerceAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "import" | "export" | "affiliate" | "sponsored" | "performance" | "analytics" | "validation">("overview");
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [settings, setSettings] = useState<CommerceSettings>(getCommerceSettings());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = sessionStorage.getItem("auracheck_admin_auth") === "true";
    setAuthenticated(auth);
    setProducts(getAdminCatalog());
    setValidationWarnings(validateCatalog(getAdminCatalog()));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function refresh() {
    setProducts(getAdminCatalog());
    setValidationWarnings(validateCatalog(getAdminCatalog()));
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm">
          <Card>
            <h1 className="mb-2 text-xl font-bold text-white">Aura Commerce Admin</h1>
            <p className="mb-4 text-xs text-gray-500">Enter admin code to manage catalog.</p>
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter admin code"
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
            />
            <button
              onClick={() => {
                const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
                if (codeInput === adminCode) {
                  sessionStorage.setItem("auracheck_admin_auth", "true");
                  setAuthenticated(true);
                } else {
                  showToast("Invalid code");
                }
              }}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400"
            >
              Login
            </button>
          </Card>
        </div>
      </Container>
    );
  }

  const catalogSource = getCatalogSource();
  const clicks = getCommerceClicks();
  const analytics = getCommerceAnalytics();
  const storePerf = getStorePerformance();
  const clickDetails = getProductClickDetails();
  const affiliateLinks = getAffiliateLinks(products);
  const sponsoredProducts = products.filter((p) => p.isSponsored);
  const activeProducts = products.filter((p) => p.isActive);

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Aura Commerce Admin</h1>
            <p className="mt-1 text-xs text-gray-500">Manage catalog, affiliate links, sponsored listings, and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isSupabaseConfigured() ? "success" : "default"}>
              Storage: {getStorageMode() === "supabase" ? "Supabase" : "Local browser"}
            </Badge>
            <Badge variant={catalogSource === "local" ? "premium" : catalogSource === "supabase" ? "success" : "default"}>
              Catalog: {catalogSource === "local" ? "Local override" : catalogSource === "supabase" ? "Supabase" : "Static fallback"}
            </Badge>
            <button onClick={() => { refresh(); showToast("Refreshed"); }} className="text-xs text-gray-500 hover:text-gray-300">Refresh</button>
            <button onClick={() => { sessionStorage.removeItem("auracheck_admin_auth"); setAuthenticated(false); }} className="text-xs text-gray-500 hover:text-gray-300">Logout</button>
          </div>
        </div>

        {toast && (
          <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">{toast}</div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {(["overview", "add", "import", "export", "affiliate", "sponsored", "performance", "analytics", "validation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${activeTab === tab ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
            >
              {tab === "overview" ? "Overview" : tab === "add" ? "Add Product" : tab === "import" ? "Import" : tab === "export" ? "Export" : tab === "affiliate" ? "Affiliate" : tab === "sponsored" ? "Sponsored" : tab === "performance" ? "Performance" : tab === "analytics" ? "Analytics" : "Validation"}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === "overview" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <Card><div className="text-xs text-gray-500">Total Products</div><div className="mt-1 text-2xl font-bold text-white">{products.length}</div></Card>
              <Card><div className="text-xs text-gray-500">Active Products</div><div className="mt-1 text-2xl font-bold text-emerald-400">{activeProducts.length}</div></Card>
              <Card><div className="text-xs text-gray-500">Inactive Products</div><div className="mt-1 text-2xl font-bold text-gray-400">{products.length - activeProducts.length}</div></Card>
              <Card><div className="text-xs text-gray-500">Total Offers</div><div className="mt-1 text-2xl font-bold text-white">{products.reduce((s, p) => s + (p.offers?.length || 0), 0)}</div></Card>
              <Card><div className="text-xs text-gray-500">Affiliate Links</div><div className="mt-1 text-2xl font-bold text-amber-400">{affiliateLinks.length}</div></Card>
              <Card><div className="text-xs text-gray-500">Sponsored Products</div><div className="mt-1 text-2xl font-bold text-purple-300">{sponsoredProducts.length}</div></Card>
              <Card><div className="text-xs text-gray-500">Total Clicks</div><div className="mt-1 text-2xl font-bold text-white">{clicks.length}</div></Card>
              <Card><div className="text-xs text-gray-500">Validation Warnings</div><div className="mt-1 text-2xl font-bold text-amber-400">{validationWarnings.length}</div></Card>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Catalog Source</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Source</span><span className="text-purple-300">{catalogSource === "local" ? "Local admin override" : catalogSource === "supabase" ? "Supabase" : "Static config fallback"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Admin products</span><span className="text-white">{products.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Static fallback</span><span className="text-white">{WARDROBE_CATALOG.length} products</span></div>
                </div>
                <div className="mt-4 rounded-lg bg-amber-500/5 p-3 text-xs text-gray-400">
                  Products from admin catalog override static catalog. Static catalog is used when admin catalog is empty.
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Commission Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Assumed Commission Rate (%)</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.commissionRate}
                        onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                        className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
                        min="0"
                        max="50"
                        step="0.5"
                      />
                      <Button size="sm" variant="outline" onClick={() => { saveCommerceSettings(settings); showToast("Settings saved"); }}>Save</Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Estimated revenue uses this rate. Actual revenue must be checked in affiliate dashboard.
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">All Products ({products.length})</h3>
              {products.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No products in admin catalog. <button onClick={() => setActiveTab("add")} className="text-purple-400 underline">Add your first product</button> or <button onClick={() => setActiveTab("import")} className="text-purple-400 underline">import from CSV/JSON</button>.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-gray-500">
                        <th className="py-2 pr-4">Title</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Offers</th>
                        <th className="py-2 pr-4">Priority</th>
                        <th className="py-2 pr-4">Sponsored</th>
                        <th className="py-2 pr-4">Active</th>
                        <th className="py-2 pr-4">Clicks</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 text-gray-300">
                          <td className="py-2 pr-4">{p.title}</td>
                          <td className="py-2 pr-4 text-gray-500">{p.category}</td>
                          <td className="py-2 pr-4">{p.offers?.length || 0}</td>
                          <td className="py-2 pr-4">{p.priorityScore}</td>
                          <td className="py-2 pr-4">{p.isSponsored ? <span className="text-purple-400">Yes</span> : "—"}</td>
                          <td className="py-2 pr-4">{p.isActive ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                          <td className="py-2 pr-4">{clickDetails[p.id]?.total || 0}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              <button onClick={() => {
                                setProductActive(p.id, !p.isActive);
                                refresh();
                                showToast(p.isActive ? "Product deactivated" : "Product activated");
                              }} className="text-xs text-gray-500 hover:text-gray-300">
                                {p.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button onClick={() => {
                                deleteProductFromAdmin(p.id);
                                refresh();
                                showToast("Product deleted");
                              }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* ─── Add Product Tab ─── */}
        {activeTab === "add" && (
          <AddProductForm
            onSave={(product) => {
              addProductToAdmin(product);
              refresh();
              showToast(`Product "${product.title}" added`);
            }}
            onCancel={() => setActiveTab("overview")}
          />
        )}

        {/* ─── Import Tab ─── */}
        {activeTab === "import" && (
          <ImportSection
            onImport={() => { refresh(); showToast("Import complete"); }}
            showToast={showToast}
          />
        )}

        {/* ─── Export Tab ─── */}
        {activeTab === "export" && (
          <ExportSection products={products} clicks={clicks} showToast={showToast} />
        )}

        {/* ─── Affiliate Tab ─── */}
        {activeTab === "affiliate" && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Affiliate Links ({affiliateLinks.length})</h3>
            <p className="mb-4 text-xs text-gray-500">All products with affiliate URLs. These links earn commission when users purchase through them.</p>
            {affiliateLinks.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">No affiliate links configured. Add affiliateUrl to product offers.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-500">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Store</th>
                      <th className="py-2 pr-4">Affiliate URL</th>
                      <th className="py-2 pr-4">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliateLinks.map((link, i) => (
                      <tr key={i} className="border-b border-white/5 text-gray-300">
                        <td className="py-2 pr-4">{link.title}</td>
                        <td className="py-2 pr-4 text-gray-500">{formatStoreName(link.storeKey as StoreKey)}</td>
                        <td className="py-2 pr-4 max-w-[300px] truncate"><a href={link.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{link.affiliateUrl}</a></td>
                        <td className="py-2">{link.isActive ? <span className="text-emerald-400">Active</span> : <span className="text-red-400">Inactive</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 rounded-lg bg-amber-500/5 p-3 text-xs text-gray-400">
              AuraCheck may earn affiliate commission on purchases made through these links.
            </div>
          </Card>
        )}

        {/* ─── Sponsored Tab ─── */}
        {activeTab === "sponsored" && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Sponsored Listings ({sponsoredProducts.length})</h3>
            <p className="mb-4 text-xs text-gray-500">Sponsored products get a small ranking boost (max 3%) but only if they match the user's style/leak/goal. They never automatically rank first.</p>
            {sponsoredProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">No sponsored products. Mark a product as sponsored in its offers to appear here.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-500">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Style Directions</th>
                      <th className="py-2 pr-4">Priority</th>
                      <th className="py-2 pr-4">Active</th>
                      <th className="py-2">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsoredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 text-gray-300">
                        <td className="py-2 pr-4">{p.title}</td>
                        <td className="py-2 pr-4 text-gray-500">{p.category}</td>
                        <td className="py-2 pr-4">{p.styleDirections.slice(0, 3).join(", ")}</td>
                        <td className="py-2 pr-4">{p.priorityScore}</td>
                        <td className="py-2 pr-4">{p.isActive ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                        <td className="py-2">{clickDetails[p.id]?.total || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 rounded-lg bg-purple-500/5 p-3 text-xs text-gray-400">
              <strong className="text-purple-300">Rules:</strong> Sponsored items do not automatically rank first. They must be relevant to user's style/leaks/goals. Irrelevant sponsored products are excluded from top recommendations.
            </div>
          </Card>
        )}

        {/* ─── Performance Tab ─── */}
        {activeTab === "performance" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <Card>
                <div className="text-xs text-gray-500">Top Store</div>
                <div className="mt-1 text-lg font-bold text-white">{analytics.topClickedStores[0]?.store || "—"}</div>
                <div className="text-xs text-gray-500">{analytics.topClickedStores[0]?.count || 0} clicks</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Top Category</div>
                <div className="mt-1 text-lg font-bold text-white">{analytics.topClickedCategories[0]?.category || "—"}</div>
                <div className="text-xs text-gray-500">{analytics.topClickedCategories[0]?.count || 0} clicks</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Top Product</div>
                <div className="mt-1 text-lg font-bold text-white truncate max-w-[200px]">{analytics.topClickedProducts[0]?.title || "—"}</div>
                <div className="text-xs text-gray-500">{analytics.topClickedProducts[0]?.count || 0} clicks</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Products with 0 clicks</div>
                <div className="mt-1 text-2xl font-bold text-amber-400">{activeProducts.filter((p) => !clickDetails[p.id]).length}</div>
              </Card>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Store Performance</h3>
                {Object.keys(storePerf).length === 0 ? (
                  <div className="text-xs text-gray-500">No click data yet.</div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(storePerf).sort((a, b) => b[1].totalClicks - a[1].totalClicks).slice(0, 10).map(([store, perf]) => (
                      <div key={store} className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5 text-xs">
                        <span className="text-gray-300">{formatStoreName(store as StoreKey)}</span>
                        <div className="flex gap-3 text-gray-500">
                          <span>{perf.totalClicks} clicks</span>
                          {perf.affiliateClicks > 0 && <span className="text-amber-400">{perf.affiliateClicks} aff</span>}
                          {perf.sponsoredClicks > 0 && <span className="text-purple-400">{perf.sponsoredClicks} spons</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Top Products by Clicks</h3>
                {analytics.topClickedProducts.length === 0 ? (
                  <div className="text-xs text-gray-500">No click data yet.</div>
                ) : (
                  <div className="space-y-2">
                    {analytics.topClickedProducts.map((p) => (
                      <div key={p.productId} className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5 text-xs">
                        <span className="text-gray-300 truncate max-w-[250px]">{p.title}</span>
                        <span className="text-white">{p.count} clicks</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* ─── Analytics Tab ─── */}
        {activeTab === "analytics" && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Product Click Analytics</h3>
            <p className="mb-4 text-xs text-gray-500">Detailed click analytics per product. Shows estimated revenue based on assumed commission rate.</p>
            {clicks.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">No clicks recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-500">
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Total Clicks</th>
                      <th className="py-2 pr-4">Affiliate</th>
                      <th className="py-2 pr-4">Est. Revenue</th>
                      <th className="py-2 pr-4">Last Clicked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter((p) => clickDetails[p.id]).sort((a, b) => (clickDetails[b.id]?.total || 0) - (clickDetails[a.id]?.total || 0)).map((p) => {
                      const cd = clickDetails[p.id];
                      if (!cd) return null;
                      return (
                        <tr key={p.id} className="border-b border-white/5 text-gray-300">
                          <td className="py-2 pr-4">{p.title}</td>
                          <td className="py-2 pr-4 text-gray-500">{p.category}</td>
                          <td className="py-2 pr-4">{cd.total}</td>
                          <td className="py-2 pr-4">{cd.affiliate > 0 ? <span className="text-amber-400">{cd.affiliate}</span> : "—"}</td>
                          <td className="py-2 pr-4 text-emerald-400">~₹{Math.round(cd.total * (settings.commissionRate / 100) * 1000)}</td>
                          <td className="py-2 pr-4 text-gray-500">{cd.lastClicked ? new Date(cd.lastClicked).toLocaleDateString("en-IN") : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 rounded-lg bg-amber-500/5 p-3 text-xs text-gray-400">
              Estimated only. Actual affiliate revenue must be checked in affiliate dashboard. Based on assumed commission rate of {settings.commissionRate}% and estimated average order value of ~₹1,000.
            </div>
          </Card>
        )}

        {/* ─── Validation Tab ─── */}
        {activeTab === "validation" && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-white">Validation Warnings ({validationWarnings.length})</h3>
            {validationWarnings.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">No validation warnings. All products look good.</div>
            ) : (
              <div className="space-y-2">
                {validationWarnings.map((w, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 text-xs ${w.severity === "error" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>
                    <strong>{w.title}</strong> — {w.field}: {w.message}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-gray-600">
          <p>Commerce Admin Panel. All data stored in localStorage with Supabase fallback. No scraping. No fake discounts. Prices are "Best listed price in AuraCheck catalog" — verify prices on store.</p>
        </div>
      </div>
    </Container>
  );
}

// ─── Add Product Form ───

function AddProductForm({ onSave, onCancel }: { onSave: (product: CommerceProduct) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WardrobeCategory>("tshirt");
  const [description, setDescription] = useState("");
  const [whyItImprovesAura, setWhy] = useState("");
  const [stylingTip, setStylingTip] = useState("");
  const [avoidIf, setAvoidIf] = useState("");
  const [priorityScore, setPriorityScore] = useState(50);
  const [isSponsored, setIsSponsored] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedLeaks, setSelectedLeaks] = useState<string[]>([]);
  const [goalTags, setGoalTags] = useState("");
  const [colorTags, setColorTags] = useState("");
  const [fitTags, setFitTags] = useState("");

  const [offers, setOffers] = useState<{
    storeKey: StoreKey;
    storeName: string;
    productName: string;
    price: number;
    mrp: string;
    url: string;
    affiliateUrl: string;
    isAffiliate: boolean;
    isSponsored: boolean;
    availabilityStatus: "available" | "unknown" | "out_of_stock";
    sizeNotes: string;
    colorNotes: string;
  }[]>([]);

  function addOffer() {
    setOffers([...offers, {
      storeKey: "other" as StoreKey,
      storeName: "",
      productName: "",
      price: 0,
      mrp: "",
      url: "#",
      affiliateUrl: "",
      isAffiliate: false,
      isSponsored: false,
      availabilityStatus: "available" as const,
      sizeNotes: "",
      colorNotes: "",
    }]);
  }

  function updateOffer(idx: number, field: string, value: string | number | boolean) {
    const updated = [...offers];
    (updated[idx] as Record<string, unknown>)[field] = value;
    setOffers(updated);
  }

  function removeOffer(idx: number) {
    setOffers(offers.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!title.trim()) { alert("Title is required"); return; }
    const now = new Date().toISOString();
    const id = generateId(title);

    const product: CommerceProduct = {
      id,
      title: title.trim(),
      category,
      styleDirections: selectedStyles as AuraStyleDirection[],
      auraLeakTags: selectedLeaks as AuraLeakTag[],
      goalTags: goalTags.split(",").map((s) => s.trim()).filter(Boolean),
      colorTags: colorTags.split(",").map((s) => s.trim()).filter(Boolean),
      fitTags: fitTags.split(",").map((s) => s.trim()).filter(Boolean),
      description,
      whyItImprovesAura,
      stylingTip,
      avoidIf: avoidIf || undefined,
      priorityScore,
      isSponsored,
      isActive,
      offers: offers.map((o, i) => {
        const mrpVal = parseInt(o.mrp) || undefined;
        return {
          id: `${id}_offer_${i}`,
          storeKey: o.storeKey,
          storeName: o.storeName || formatStoreName(o.storeKey),
          productName: o.productName || title,
          price: o.price,
          mrp: mrpVal,
          discountPercent: mrpVal && mrpVal > o.price ? Math.round(((mrpVal - o.price) / mrpVal) * 100) : undefined,
          url: o.url || "#",
          affiliateUrl: o.affiliateUrl || undefined,
          availabilityStatus: o.availabilityStatus,
          sizeNotes: o.sizeNotes || undefined,
          colorNotes: o.colorNotes || undefined,
          lastCheckedText: "Added via admin",
          isAffiliate: o.isAffiliate,
          isSponsored: o.isSponsored,
          updatedAt: now,
        };
      }),
      createdAt: now,
      updatedAt: now,
    };

    onSave(product);
  }

  function toggleStyle(s: string) {
    setSelectedStyles((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }
  function toggleLeak(l: string) {
    setSelectedLeaks((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Add New Product</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="e.g. Premium White T-Shirt" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as WardrobeCategory)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Style Directions</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {STYLE_DIRECTIONS.map((s) => (
              <button key={s} onClick={() => toggleStyle(s)} className={`rounded-full px-2.5 py-1 text-xs transition-all ${selectedStyles.includes(s) ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Aura Leak Tags</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {LEAK_TAGS.map((l) => (
              <button key={l} onClick={() => toggleLeak(l)} className={`rounded-full px-2.5 py-1 text-xs transition-all ${selectedLeaks.includes(l) ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-gray-500">Goal Tags (comma-separated)</label>
            <input value={goalTags} onChange={(e) => setGoalTags(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="casual, dating, office" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Color Tags</label>
            <input value={colorTags} onChange={(e) => setColorTags(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="white, black, navy" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Fit Tags</label>
            <input value={fitTags} onChange={(e) => setFitTags(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="slim, regular, relaxed" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-gray-500">Why It Improves Aura</label>
            <textarea value={whyItImprovesAura} onChange={(e) => setWhy(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Styling Tip</label>
            <textarea value={stylingTip} onChange={(e) => setStylingTip(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Avoid If</label>
            <textarea value={avoidIf} onChange={(e) => setAvoidIf(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-gray-500">Priority Score (0-100)</label>
            <input type="number" value={priorityScore} onChange={(e) => setPriorityScore(parseInt(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" min="0" max="100" />
          </div>
          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input type="checkbox" checked={isSponsored} onChange={(e) => setIsSponsored(e.target.checked)} className="accent-purple-500" />
              Sponsored
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-emerald-500" />
              Active
            </label>
          </div>
        </div>

        {/* Offers */}
        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Offers ({offers.length})</h4>
            <Button size="sm" variant="outline" onClick={addOffer}>Add Offer</Button>
          </div>
          {offers.map((offer, idx) => (
            <div key={idx} className="mb-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Offer #{idx + 1}</span>
                <button onClick={() => removeOffer(idx)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <div>
                  <label className="text-xs text-gray-500">Store Key</label>
                  <select value={offer.storeKey} onChange={(e) => updateOffer(idx, "storeKey", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white">
                    {STORE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Store Name</label>
                  <input value={offer.storeName} onChange={(e) => updateOffer(idx, "storeName", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Product Name</label>
                  <input value={offer.productName} onChange={(e) => updateOffer(idx, "productName", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Price (₹) *</label>
                  <input type="number" value={offer.price || ""} onChange={(e) => updateOffer(idx, "price", parseInt(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">MRP (₹)</label>
                  <input value={offer.mrp} onChange={(e) => updateOffer(idx, "mrp", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">URL</label>
                  <input value={offer.url} onChange={(e) => updateOffer(idx, "url", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Affiliate URL</label>
                  <input value={offer.affiliateUrl} onChange={(e) => updateOffer(idx, "affiliateUrl", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white" />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-1.5 text-xs text-gray-300">
                    <input type="checkbox" checked={offer.isAffiliate} onChange={(e) => updateOffer(idx, "isAffiliate", e.target.checked)} className="accent-amber-500" />
                    Affiliate
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-300">
                    <input type="checkbox" checked={offer.isSponsored} onChange={(e) => updateOffer(idx, "isSponsored", e.target.checked)} className="accent-purple-500" />
                    Sponsored
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave}>Save Product</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Import Section ───

function ImportSection({ onImport, showToast }: { onImport: () => void; showToast: (msg: string) => void }) {
  const [preview, setPreview] = useState<{ products: CommerceProduct[]; errors: string[]; warnings: string[] } | null>(null);
  const [merge, setMerge] = useState(true);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mergeByTitle", merge.toString());

    try {
      const res = await fetch("/api/commerce/import", { method: "POST", body: formData });
      const result = await res.json();

      if (result.success) {
        setPreview({ products: result.products || [], errors: result.errors || [], warnings: result.warnings || [] });
        onImport();
      } else {
        showToast("Import failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      showToast("Import error: " + (err as Error).message);
    }
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Import Products</h3>
      <p className="mb-4 text-xs text-gray-500">Import products from JSON or CSV file. Preview before saving. Valid rows are imported, invalid rows are skipped with errors shown.</p>

      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input type="checkbox" checked={merge} onChange={(e) => setMerge(e.target.checked)} className="accent-purple-500" />
          Merge offers for same product title
        </label>
      </div>

      <div className="mb-4">
        <input type="file" accept=".json,.csv" onChange={handleFile} className="text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-500/20 file:px-3 file:py-1.5 file:text-xs file:text-purple-300" />
      </div>

      {preview && (
        <div className="space-y-4">
          {preview.errors.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-red-400">Errors ({preview.errors.length})</h4>
              <div className="space-y-1">
                {preview.errors.map((err, i) => (
                  <div key={i} className="rounded bg-red-500/10 px-3 py-1.5 text-xs text-red-300">{err}</div>
                ))}
              </div>
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-amber-400">Warnings ({preview.warnings.length})</h4>
              <div className="space-y-1">
                {preview.warnings.map((w, i) => (
                  <div key={i} className="rounded bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">{w}</div>
                ))}
              </div>
            </div>
          )}

          {preview.products.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-emerald-400">Imported Products ({preview.products.length})</h4>
              <div className="space-y-1">
                {preview.products.map((p) => (
                  <div key={p.id} className="rounded bg-emerald-500/5 px-3 py-1.5 text-xs text-gray-300">
                    {p.title} — {p.category} — {p.offers.length} offer(s)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Export Section ───

function ExportSection({ products, clicks, showToast }: { products: CommerceProduct[]; clicks: ExtendedClickEvent[]; showToast: (msg: string) => void }) {
  function handleExport(format: string, type: string) {
    if (type === "affiliate") {
      downloadCSVString(exportAffiliateLinksCSV(products), `auracheck-affiliate-links-${Date.now()}.csv`);
    } else if (type === "sponsored") {
      downloadCSVString(exportSponsoredCSV(products), `auracheck-sponsored-${Date.now()}.csv`);
    } else if (type === "clicks") {
      downloadCSVString(exportClicksCSV(clicks as import("@/types/commerce").CommerceClickEvent[]), `auracheck-clicks-${Date.now()}.csv`);
    } else if (format === "json") {
      downloadJSON(exportToJSON(products), `auracheck-catalog-${Date.now()}.json`);
    } else {
      downloadCSVString(exportToCSV(products), `auracheck-catalog-${Date.now()}.csv`);
    }
    showToast("Export started");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white">Full Catalog</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("json", "catalog")}>JSON</Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("csv", "catalog")}>CSV</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white">Affiliate Links CSV</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("csv", "affiliate")}>Download</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white">Sponsored Listings CSV</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("csv", "sponsored")}>Download</Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white">Click Analytics CSV</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("csv", "clicks")}>Download</Button>
        </div>
      </Card>
    </div>
  );
}
