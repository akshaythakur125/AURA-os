"use client";

import type { AuraStyleDirection, AuraLeakTag } from "@/types/commerce";
import type { CommerceSearchSort } from "@/types/commerceSearch";
import { getActiveStores } from "@/config/storeDirectory";
import { AURA_SEARCH_PRESETS } from "@/config/auraSearchPresets";

const CATEGORY_LABELS: Record<string, string> = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  overshirt: "Overshirts",
  jeans: "Jeans",
  trousers: "Trousers",
  chinos: "Chinos",
  sneakers: "Sneakers",
  formal_shoes: "Formal Shoes",
  watch: "Watches",
  belt: "Belts",
  sunglasses: "Sunglasses",
  jacket: "Jackets",
  hoodie: "Hoodies",
  kurta: "Kurtas",
  perfume: "Perfumes",
  grooming: "Grooming",
  background_item: "Background",
  photo_accessory: "Photo Gear",
  jewellery: "Jewellery",
  wallet: "Wallets",
};

const SORT_OPTIONS: { value: CommerceSearchSort; label: string }[] = [
  { value: "aura_best", label: "Best Aura Match" },
  { value: "cheapest", label: "Cheapest First" },
  { value: "best_value", label: "Best Value" },
  { value: "highest_discount", label: "Highest Discount" },
  { value: "fresh_price", label: "Recently Checked" },
  { value: "store_trust", label: "Trusted Stores" },
];

const STYLE_OPTIONS: { value: AuraStyleDirection | ""; label: string }[] = [
  { value: "", label: "All Styles" },
  { value: "clean_basic", label: "Clean Basic" },
  { value: "premium_minimal", label: "Premium Minimal" },
  { value: "urban_aspirational", label: "Urban Aspirational" },
  { value: "soft_luxury", label: "Soft Luxury" },
  { value: "creator_bold", label: "Creator Bold" },
  { value: "college_casual", label: "College Casual" },
  { value: "corporate_sharp", label: "Corporate Sharp" },
  { value: "dating_warm", label: "Dating Warm" },
  { value: "street_smart", label: "Street Smart" },
  { value: "ethnic_clean", label: "Ethnic Clean" },
];

const AURA_LEAK_OPTIONS: { value: AuraLeakTag | ""; label: string }[] = [
  { value: "", label: "Any Aura Leak" },
  { value: "weak_lighting", label: "Weak Lighting" },
  { value: "busy_background", label: "Busy Background" },
  { value: "too_plain", label: "Too Plain" },
  { value: "low_premium_signal", label: "Low Premium Signal" },
  { value: "color_mismatch", label: "Color Mismatch" },
  { value: "outfit_inconsistency", label: "Outfit Inconsistency" },
  { value: "professional_mismatch", label: "Professional Mismatch" },
  { value: "dating_warmth_missing", label: "Dating Warmth Missing" },
  { value: "creator_energy_missing", label: "Creator Energy Missing" },
];

interface SearchFiltersProps {
  query: string;
  onQueryChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  budgetMin: string;
  onBudgetMinChange: (v: string) => void;
  budgetMax: string;
  onBudgetMaxChange: (v: string) => void;
  storeFilter: string;
  onStoreFilterChange: (v: string) => void;
  styleDirection: string;
  onStyleDirectionChange: (v: string) => void;
  auraLeakTag: string;
  onAuraLeakTagChange: (v: string) => void;
  sort: CommerceSearchSort;
  onSortChange: (v: CommerceSearchSort) => void;
  onPresetSelect?: (presetId: string) => void;
}

export function SearchFilters({
  query, onQueryChange,
  category, onCategoryChange,
  budgetMin, onBudgetMinChange,
  budgetMax, onBudgetMaxChange,
  storeFilter, onStoreFilterChange,
  styleDirection, onStyleDirectionChange,
  auraLeakTag, onAuraLeakTagChange,
  sort, onSortChange,
  onPresetSelect,
}: SearchFiltersProps) {
  const stores = getActiveStores();

  return (
    <div className="space-y-4">
      {/* Search query */}
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search products, styles, or aura leaks..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
        />
      </div>

      {/* Presets */}
      {onPresetSelect && (
        <div>
          <div className="mb-2 text-xs font-medium text-gray-500">Quick Presets</div>
          <div className="flex flex-wrap gap-1.5">
            {AURA_SEARCH_PRESETS.slice(0, 5).map((preset) => (
              <button
                key={preset.id}
                onClick={() => onPresetSelect(preset.id)}
                className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300 hover:bg-purple-500/20 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <div className="mb-2 text-xs font-medium text-gray-500">Category</div>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
        >
          <option value="">All Categories</option>
          {(Object.entries(CATEGORY_LABELS || {}) as [string, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-2 text-xs font-medium text-gray-500">Min Budget</div>
          <input
            type="number"
            value={budgetMin}
            onChange={(e) => onBudgetMinChange(e.target.value)}
            placeholder="₹0"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-2 text-xs font-medium text-gray-500">Max Budget</div>
          <input
            type="number"
            value={budgetMax}
            onChange={(e) => onBudgetMaxChange(e.target.value)}
            placeholder="₹50,000"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Style Direction */}
      <div>
        <div className="mb-2 text-xs font-medium text-gray-500">Style Direction</div>
        <select
          value={styleDirection}
          onChange={(e) => onStyleDirectionChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
        >
          {STYLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Aura Leak */}
      <div>
        <div className="mb-2 text-xs font-medium text-gray-500">Aura Leak</div>
        <select
          value={auraLeakTag}
          onChange={(e) => onAuraLeakTagChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
        >
          {AURA_LEAK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Store */}
      <div>
        <div className="mb-2 text-xs font-medium text-gray-500">Store</div>
        <select
          value={storeFilter}
          onChange={(e) => onStoreFilterChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
        >
          <option value="">All Stores</option>
          {stores.filter((s) => s.isActive).map((store) => (
            <option key={store.key} value={store.key}>{store.displayName}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <div className="mb-2 text-xs font-medium text-gray-500">Sort By</div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CommerceSearchSort)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
