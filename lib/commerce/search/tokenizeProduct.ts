import type { CommerceSearchItem } from "@/types/commerceSearch";

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function buildSearchTokensForItem(item: Partial<CommerceSearchItem>): string[] {
  const tokens = new Set<string>();

  const title = item.normalizedTitle || item.originalTitle || "";
  tokenize(title).forEach((t) => tokens.add(t));

  if (item.category) {
    tokenize(item.category.replace(/_/g, " ")).forEach((t) => tokens.add(t));
  }

  if (item.subCategory) {
    tokenize(item.subCategory.replace(/_/g, " ")).forEach((t) => tokens.add(t));
  }

  if (item.brand) {
    tokenize(item.brand).forEach((t) => tokens.add(t));
  }

  (item.colorTags || []).forEach((t) => {
    tokenize(t).forEach((w) => tokens.add(w));
  });

  (item.styleTags || []).forEach((t) => {
    tokenize(t.replace(/_/g, " ")).forEach((w) => tokens.add(w));
  });

  (item.auraLeakTags || []).forEach((t) => {
    tokenize(t.replace(/_/g, " ")).forEach((w) => tokens.add(w));
  });

  (item.goalTags || []).forEach((t) => {
    tokenize(t.replace(/_/g, " ")).forEach((w) => tokens.add(w));
  });

  (item.fitTags || []).forEach((t) => {
    tokenize(t.replace(/_/g, " ")).forEach((w) => tokens.add(w));
  });

  (item.materialTags || []).forEach((t) => {
    tokenize(t).forEach((w) => tokens.add(w));
  });

  if (item.storeName) {
    tokenize(item.storeName).forEach((t) => tokens.add(t));
  }

  return [...tokens];
}

export function matchQueryTokens(
  queryTokens: string[],
  itemTokens: string[]
): { matched: string[]; score: number } {
  if (queryTokens.length === 0) return { matched: [], score: 1 };

  const matched: string[] = [];
  const itemTokenSet = new Set(itemTokens);

  for (const qt of queryTokens) {
    if (itemTokenSet.has(qt)) {
      matched.push(qt);
    } else {
      for (const it of itemTokenSet) {
        const overlap = Math.min(qt.length, it.length);
        if (overlap >= 4 && (it.includes(qt) || qt.includes(it))) {
          matched.push(qt);
          break;
        }
      }
    }
  }

  const score = queryTokens.length > 0 ? matched.length / queryTokens.length : 0;
  return { matched, score };
}
