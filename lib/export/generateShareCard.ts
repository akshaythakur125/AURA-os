export async function generateShareCardPng(
  score: number,
  category: string,
  strongestSignal: string,
  biggestLeak: string,
  variantTitle?: string
): Promise<void> {
  const w = 600;
  const h = 840;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background — dark gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0a0a0f");
  bg.addColorStop(0.5, "#111118");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Brand watermark
  ctx.fillStyle = "rgba(147,51,234,0.04)";
  ctx.font = "bold 120px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AC", w / 2, h / 2 + 40);

  // Top badge
  ctx.fillStyle = "rgba(147,51,234,0.15)";
  ctx.beginPath();
  const badgeW = 220;
  const badgeH = 32;
  const badgeX = (w - badgeW) / 2;
  const badgeY = 60;
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.font = "12px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(variantTitle ? "AURA TWIN COMPARISON" : "AURA CHECK RESULT", w / 2, badgeY + 21);

  // Score circle
  const cx = w / 2;
  const cy = 260;
  const radius = 100;

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
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();

  // Score ring fill
  const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  gradient.addColorStop(0, "#7c3aed");
  gradient.addColorStop(1, "#ec4899");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 12;
  const arcEnd = -Math.PI / 2 + (score / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, arcEnd);
  ctx.stroke();

  // Score number
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(score), cx, cy + 8);
  ctx.font = "14px -apple-system, sans-serif";
  ctx.fillStyle = "#888888";
  ctx.fillText("/ 100", cx + 42, cy - 18);
  ctx.font = "14px -apple-system, sans-serif";
  ctx.fillStyle = "#a78bfa";
  ctx.fillText("AURA SCORE", cx, cy + 48);

  if (variantTitle) {
    ctx.font = "13px -apple-system, sans-serif";
    ctx.fillStyle = "#c084fc";
    ctx.fillText(variantTitle, cx, cy + 68);
  }

  // Stats row
  const statY = 420;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.roundRect(32, statY, w - 64, 72, 16);
  ctx.fill();

  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(category, w / 2, statY + 26);
  ctx.font = "12px -apple-system, sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("CATEGORY", w / 2, statY + 46);

  // Signal + Leak
  const infoY = 530;
  // Strongest signal
  ctx.fillStyle = "rgba(16,185,129,0.08)";
  ctx.beginPath();
  ctx.roundRect(32, infoY, 260, 70, 12);
  ctx.fill();
  ctx.font = "11px -apple-system, sans-serif";
  ctx.fillStyle = "#10b981";
  ctx.textAlign = "left";
  ctx.fillText("STRONGEST SIGNAL", 52, infoY + 22);
  ctx.font = "bold 15px -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(strongestSignal, 52, infoY + 46);

  // Biggest leak
  ctx.fillStyle = "rgba(239,68,68,0.08)";
  ctx.beginPath();
  ctx.roundRect(308, infoY, 260, 70, 12);
  ctx.fill();
  ctx.font = "11px -apple-system, sans-serif";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "left";
  ctx.fillText("BIGGEST LEAK", 328, infoY + 22);
  ctx.font = "bold 15px -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(biggestLeak, 328, infoY + 46);

  // Footer
  const footerY = 660;
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.beginPath();
  ctx.roundRect(32, footerY, w - 64, 120, 16);
  ctx.fill();

  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillStyle = "#d8b4fe";
  ctx.textAlign = "center";
  ctx.fillText("Check your Aura Score", w / 2, footerY + 32);
  ctx.font = "13px -apple-system, sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText("auracheck.vercel.app • Local processing • No upload", w / 2, footerY + 56);

  // Brand
  ctx.font = "11px -apple-system, sans-serif";
  ctx.fillStyle = "#555";
  ctx.fillText("Presentation guidance only. Does not measure human worth.", w / 2, footerY + 80);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, footerY + 96);
  ctx.lineTo(w - 80, footerY + 96);
  ctx.stroke();

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auracheck-score-${score}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
