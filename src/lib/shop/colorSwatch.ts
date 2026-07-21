/**
 * Maps human color names (as produced by the color-palette engine) to hex so
 * the "Your Colors" card can render real swatches. Uses a longest-substring
 * match so variants ("burnt orange", "warm red") resolve sensibly, with a
 * stable neutral fallback for anything unmapped.
 */

const SWATCHES: [string, string][] = [
  ["burnt sienna", "#8a3f2a"],
  ["burnt orange", "#b5651d"],
  ["royal blue", "#26489a"],
  ["slate blue", "#5a6b82"],
  ["dusty rose", "#c08a8a"],
  ["dusty blue", "#8fa6bd"],
  ["forest green", "#274233"],
  ["olive green", "#6b7043"],
  ["warm brown", "#6f4e37"],
  ["warm grey", "#8a8178"],
  ["warm red", "#b33a2f"],
  ["soft white", "#f2efe9"],
  ["soft pink", "#e6c2c2"],
  ["light blue", "#a8c5e0"],
  ["silver grey", "#b8bcc0"],
  ["bright blue", "#2f6fd0"],
  ["deep red", "#7a1f27"],
  ["terracotta", "#c66b4e"],
  ["vermillion", "#e14434"],
  ["vermilion", "#e14434"],
  ["marigold", "#e6a817"],
  ["burgundy", "#6d2233"],
  ["charcoal", "#333230"],
  ["lavender", "#b7a7d1"],
  ["emerald", "#2e8b6f"],
  ["magenta", "#b5327a"],
  ["mustard", "#d1a13a"],
  ["coral", "#e2765a"],
  ["camel", "#c19a6b"],
  ["cream", "#f0e8d8"],
  ["ivory", "#fbf6ec"],
  ["olive", "#6b7043"],
  ["navy", "#1e3352"],
  ["plum", "#5f3d5c"],
  ["rust", "#a8492c"],
  ["gold", "#c9a227"],
  ["slate", "#556070"],
  ["brown", "#6f4e37"],
  ["black", "#1c1917"],
  ["white", "#f6f2ea"],
  ["grey", "#8f8a83"],
  ["gray", "#8f8a83"],
  ["silver", "#c7cbcf"],
  ["purple", "#5b3a86"],
  ["orange", "#d97b34"],
  ["yellow", "#e3c14a"],
  ["green", "#3f6b4a"],
  ["blue", "#3a5a8c"],
  ["pink", "#dba3b0"],
  ["red", "#b33a2f"],
  ["neon", "#a8ff3e"],
  ["pastel", "#e7d6e6"],
  ["icy", "#cfe0ec"],
];

/** Resolve a color name to a hex swatch. */
export function swatchHex(name: string): string {
  const n = name.toLowerCase().trim();
  for (const [key, hex] of SWATCHES) {
    if (n.includes(key)) return hex;
  }
  return "#9c9184"; // neutral fallback
}

/** A readable text color (dark/light) for a label sitting on a swatch. */
export function swatchTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#1c1917" : "#f6f2ea";
}
