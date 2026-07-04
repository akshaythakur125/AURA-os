export type ShareCardRatio = "square" | "story" | "wide";

interface ShareCardOptions {
  score: number;
  category: string;
  strongestSignal: string;
  biggestLeak: string;
  variantTitle?: string;
  ratio?: ShareCardRatio;
}

function getDimensions(ratio: ShareCardRatio): { w: number; h: number } {
  switch (ratio) {
    case "story": return { w: 540, h: 960 };
    case "wide": return { w: 1200, h: 630 };
    default: return { w: 600, h: 600 };
  }
}

export async function generateShareCardPng(sc: ShareCardOptions): Promise<void> {
  const { w, h } = getDimensions(sc.ratio || "square");
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const scale = w / 600;

  // Background — dark gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0a0a0f");
  bg.addColorStop(0.5, "#111118");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Brand watermark
  ctx.fillStyle = "rgba(147,51,234,0.04)";
  ctx.font = `bold ${Math.round(120 * scale)}px -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("AC", w / 2, h / 2 + Math.round(40 * scale));

  // Top badge
  const badgeY = Math.round(40 * scale);
  const badgeW = Math.round(220 * scale);
  const badgeH = Math.round(32 * scale);
  ctx.fillStyle = "rgba(147,51,234,0.15)";
  ctx.beginPath();
  const badgeX = (w - badgeW) / 2;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, Math.round(16 * scale));
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.font = `${Math.round(12 * scale)}px -apple-system, sans-serif`;
  ctx.fillText(sc.variantTitle ? "AURA TWIN COMPARISON" : "AURA CHECK RESULT", w / 2, badgeY + Math.round(21 * scale));

  // Score circle
  const cx = w / 2;
  const cy = sc.ratio === "story" ? Math.round(200 * scale) : Math.round(180 * scale);
  const radius = Math.round(80 * scale);

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.5);
  glow.addColorStop(0, "rgba(147,51,234,0.3)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Score ring background
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = Math.round(10 * scale);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();

  // Score ring fill
  const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  gradient.addColorStop(0, "#7c3aed");
  gradient.addColorStop(1, "#ec4899");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.round(10 * scale);
  const arcEnd = -Math.PI / 2 + (sc.score / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, arcEnd);
  ctx.stroke();

  // Score number
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(64 * scale)}px -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(String(sc.score), cx, cy + Math.round(6 * scale));
  ctx.font = `${Math.round(12 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#888888";
  ctx.fillText("/ 100", cx + Math.round(36 * scale), cy - Math.round(12 * scale));
  ctx.font = `${Math.round(12 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#a78bfa";
  ctx.fillText("AURA SCORE", cx, cy + Math.round(38 * scale));

  if (sc.variantTitle) {
    ctx.font = `${Math.round(11 * scale)}px -apple-system, sans-serif`;
    ctx.fillStyle = "#c084fc";
    ctx.fillText(sc.variantTitle, cx, cy + Math.round(56 * scale));
  }

  // Stats row
  const statY = sc.ratio === "story" ? Math.round(340 * scale) : Math.round(310 * scale);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), statY, w - Math.round(64 * scale), Math.round(56 * scale), Math.round(12 * scale));
  ctx.fill();

  ctx.font = `bold ${Math.round(14 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(sc.category, w / 2, statY + Math.round(22 * scale));
  ctx.font = `${Math.round(10 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#666";
  ctx.fillText("CATEGORY", w / 2, statY + Math.round(38 * scale));

  // Signal + Leak
  const infoY = sc.ratio === "story" ? Math.round(420 * scale) : Math.round(380 * scale);
  const colW = (w - Math.round(80 * scale)) / 2;

  // Strongest signal
  ctx.fillStyle = "rgba(16,185,129,0.08)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), infoY, colW, Math.round(56 * scale), Math.round(10 * scale));
  ctx.fill();
  ctx.font = `${Math.round(9 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#10b981";
  ctx.textAlign = "left";
  ctx.fillText("STRONGEST SIGNAL", Math.round(44 * scale), infoY + Math.round(18 * scale));
  ctx.font = `bold ${Math.round(13 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(fitText(ctx, sc.strongestSignal, colW - Math.round(24 * scale)), Math.round(44 * scale), infoY + Math.round(38 * scale));

  // Biggest leak
  ctx.fillStyle = "rgba(239,68,68,0.08)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale) + colW + Math.round(16 * scale), infoY, colW, Math.round(56 * scale), Math.round(10 * scale));
  ctx.fill();
  ctx.font = `${Math.round(9 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#ef4444";
  ctx.fillText("BIGGEST LEAK", Math.round(44 * scale) + colW + Math.round(16 * scale), infoY + Math.round(18 * scale));
  ctx.font = `bold ${Math.round(13 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(fitText(ctx, sc.biggestLeak, colW - Math.round(24 * scale)), Math.round(44 * scale) + colW + Math.round(16 * scale), infoY + Math.round(38 * scale));

  // CTA Banner
  const ctaY = h - Math.round(100 * scale);
  ctx.fillStyle = "rgba(124,58,237,0.12)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), ctaY, w - Math.round(64 * scale), Math.round(70 * scale), Math.round(14 * scale));
  ctx.fill();
  ctx.strokeStyle = "rgba(147,51,234,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), ctaY, w - Math.round(64 * scale), Math.round(70 * scale), Math.round(14 * scale));
  ctx.stroke();

  ctx.font = `bold ${Math.round(16 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#d8b4fe";
  ctx.textAlign = "center";
  ctx.fillText("What's your Aura Score?", w / 2, ctaY + Math.round(28 * scale));
  ctx.font = `${Math.round(11 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#888";
  ctx.fillText("auracheck.vercel.app • Free • No sign-up", w / 2, ctaY + Math.round(50 * scale));

  // Brand footer
  ctx.font = `${Math.round(9 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#555";
  ctx.textAlign = "center";
  ctx.fillText("Presentation guidance only. Does not measure human worth.", w / 2, h - Math.round(14 * scale));

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auracheck-score-${sc.score}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export async function generateShareCardBlob(sc: ShareCardOptions): Promise<Blob | null> {
  const { w, h } = getDimensions(sc.ratio || "square");
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scale = w / 600;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0a0a0f");
  bg.addColorStop(0.5, "#111118");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(147,51,234,0.04)";
  ctx.font = `bold ${Math.round(120 * scale)}px -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("AC", w / 2, h / 2 + Math.round(40 * scale));

  const badgeY = Math.round(40 * scale);
  const badgeW = Math.round(220 * scale);
  const badgeH = Math.round(32 * scale);
  ctx.fillStyle = "rgba(147,51,234,0.15)";
  ctx.beginPath();
  roundRect(ctx, (w - badgeW) / 2, badgeY, badgeW, badgeH, Math.round(16 * scale));
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.font = `${Math.round(12 * scale)}px -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(sc.variantTitle ? "AURA TWIN COMPARISON" : "AURA CHECK RESULT", w / 2, badgeY + Math.round(21 * scale));

  const cx = w / 2;
  const cy = sc.ratio === "story" ? Math.round(200 * scale) : Math.round(180 * scale);
  const radius = Math.round(80 * scale);

  const glow = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.5);
  glow.addColorStop(0, "rgba(147,51,234,0.3)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = Math.round(10 * scale);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  gradient.addColorStop(0, "#7c3aed");
  gradient.addColorStop(1, "#ec4899");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.round(10 * scale);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (sc.score / 100) * Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(64 * scale)}px -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(String(sc.score), cx, cy + Math.round(6 * scale));
  ctx.font = `${Math.round(12 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#888888";
  ctx.fillText("/ 100", cx + Math.round(36 * scale), cy - Math.round(12 * scale));
  ctx.font = `${Math.round(12 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#a78bfa";
  ctx.fillText("AURA SCORE", cx, cy + Math.round(38 * scale));

  const statY = sc.ratio === "story" ? Math.round(340 * scale) : Math.round(310 * scale);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), statY, w - Math.round(64 * scale), Math.round(56 * scale), Math.round(12 * scale));
  ctx.fill();
  ctx.font = `bold ${Math.round(14 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(sc.category, w / 2, statY + Math.round(22 * scale));

  const infoY = sc.ratio === "story" ? Math.round(420 * scale) : Math.round(380 * scale);
  const colW = (w - Math.round(80 * scale)) / 2;

  ctx.fillStyle = "rgba(16,185,129,0.08)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), infoY, colW, Math.round(56 * scale), Math.round(10 * scale));
  ctx.fill();
  ctx.font = `${Math.round(9 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#10b981";
  ctx.textAlign = "left";
  ctx.fillText("STRONGEST SIGNAL", Math.round(44 * scale), infoY + Math.round(18 * scale));

  ctx.fillStyle = "rgba(239,68,68,0.08)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale) + colW + Math.round(16 * scale), infoY, colW, Math.round(56 * scale), Math.round(10 * scale));
  ctx.fill();
  ctx.font = `${Math.round(9 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "left";
  ctx.fillText("BIGGEST LEAK", Math.round(44 * scale) + colW + Math.round(16 * scale), infoY + Math.round(18 * scale));

  const ctaY = h - Math.round(100 * scale);
  ctx.fillStyle = "rgba(124,58,237,0.12)";
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), ctaY, w - Math.round(64 * scale), Math.round(70 * scale), Math.round(14 * scale));
  ctx.fill();
  ctx.strokeStyle = "rgba(147,51,234,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, Math.round(32 * scale), ctaY, w - Math.round(64 * scale), Math.round(70 * scale), Math.round(14 * scale));
  ctx.stroke();
  ctx.font = `bold ${Math.round(16 * scale)}px -apple-system, sans-serif`;
  ctx.fillStyle = "#d8b4fe";
  ctx.textAlign = "center";
  ctx.fillText("What's your Aura Score?", w / 2, ctaY + Math.round(28 * scale));

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (ctx.measureText(trimmed + "…").width > maxWidth && trimmed.length > 1) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed + "…";
}
