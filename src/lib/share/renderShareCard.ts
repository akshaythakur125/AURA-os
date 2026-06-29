import type { ShareCardData, ShareCardOptions } from "@/types/share";

const S = 1080;
const R = 32;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPremiumDark(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  // Background
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#0f0a1a");
  grad.addColorStop(0.5, "#1a0f2e");
  grad.addColorStop(1, "#0d0a1a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Subtle decorative circles
  ctx.fillStyle = "rgba(147, 51, 234, 0.06)";
  ctx.beginPath();
  ctx.arc(S - 120, S - 120, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-80, 200, 250, 0, Math.PI * 2);
  ctx.fill();

  // Image area
  if (opts.includeImage && data.imageDataUrl) {
    drawRoundedRect(ctx, 60, 60, S - 120, S - 120, R);
    ctx.save();
    ctx.clip();
    const img = new Image();
    try {
      img.src = data.imageDataUrl;
      const iw = img.width || S;
      const ih = img.height || S;
      const scale = Math.max((S - 120) / iw, (S - 120) / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (S - sw) / 2;
      const sy = (S - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
    } catch { /* fall through */ }
    ctx.restore();

    // Overlay
    const overlay = ctx.createLinearGradient(0, S * 0.55, 0, S);
    overlay.addColorStop(0, "rgba(15, 10, 26, 0)");
    overlay.addColorStop(1, "rgba(15, 10, 26, 0.92)");
    ctx.fillStyle = overlay;
    ctx.fillRect(60, S * 0.55, S - 120, S * 0.45);
  }

  const cx = S / 2;
  let y = opts.includeImage && data.imageDataUrl ? S * 0.58 : 160;

  // Branding
  if (opts.includeBranding) {
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AuraCheck", cx, y);
    y += 16;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "16px Arial, Helvetica, sans-serif";
    ctx.fillText("First-Impression Intelligence", cx, y);
    y += 40;
  }

  // Score
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 120px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${data.auraScore}`, cx, y + 100);
  y += 110;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "24px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 10;

  // Score bar
  const barW = 360;
  const barH = 10;
  const barX = cx - barW / 2;
  drawRoundedRect(ctx, barX, y, barW, barH, 5);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  drawRoundedRect(ctx, barX, y, barW * (data.auraScore / 100), barH, 5);
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barGrad.addColorStop(0, "#9333ea");
  barGrad.addColorStop(1, "#ec4899");
  ctx.fillStyle = barGrad;
  ctx.fill();
  y += 30;

  // Category badge
  if (data.category) {
    drawRoundedRect(ctx, cx - 130, y, 260, 36, 18);
    ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.fillText(data.category, cx, y + 24);
    y += 52;
  }

  // Verdict
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "20px Arial, Helvetica, sans-serif";
  const verLines = wrapText(ctx, data.oneLineVerdict, 700);
  for (const l of verLines) {
    ctx.fillText(l, cx, y);
    y += 30;
  }
  y += 10;

  // Status leak
  if (opts.includeStatusLeak && data.biggestStatusLeak) {
    ctx.fillStyle = "rgba(251, 113, 133, 0.15)";
    drawRoundedRect(ctx, cx - 290, y, 580, 44, 12);
    ctx.fill();
    ctx.fillStyle = "#fb7185";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Biggest Leak: ${data.biggestStatusLeak}`, cx - 260, y + 28);
    y += 56;
  }

  // Quick fix
  if (opts.includeQuickFix && data.quickFix) {
    ctx.fillStyle = "rgba(52, 211, 153, 0.12)";
    drawRoundedRect(ctx, cx - 290, y, 580, 44, 12);
    ctx.fill();
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    const fixLabel = `Fix: ${data.quickFix}`;
    const truncated = ctx.measureText(fixLabel).width > 540
      ? fixLabel.slice(0, 70) + "..."
      : fixLabel;
    ctx.fillText(truncated, cx - 260, y + 28);
    y += 56;
  }

  // CTA
  const ctaY = S - 80;
  ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
  drawRoundedRect(ctx, cx - 200, ctaY - 15, 400, 40, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 18px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Find your biggest status leak", cx, ctaY + 8);

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "13px Arial, Helvetica, sans-serif";
  ctx.fillText("auracheck.app — presentation guidance, not objective truth", cx, S - 28);
}

function drawCleanMinimal(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, S, S);

  // Subtle top accent
  const accent = ctx.createLinearGradient(0, 0, S, 0);
  accent.addColorStop(0, "#9333ea");
  accent.addColorStop(1, "#ec4899");
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, S, 6);

  const cx = S / 2;
  let y = 140;

  if (opts.includeBranding) {
    ctx.fillStyle = "#9333ea";
    ctx.font = "bold 24px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AuraCheck", cx, y);
    y += 40;
  }

  ctx.fillStyle = "#111111";
  ctx.font = "bold 110px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${data.auraScore}`, cx, y + 90);
  y += 100;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.font = "22px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 14;

  const barW = 320;
  const barX = cx - barW / 2;
  drawRoundedRect(ctx, barX, y, barW, 8, 4);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fill();
  drawRoundedRect(ctx, barX, y, barW * (data.auraScore / 100), 8, 4);
  ctx.fillStyle = "#9333ea";
  ctx.fill();
  y += 28;

  if (data.category) {
    ctx.fillStyle = "rgba(147, 51, 234, 0.1)";
    drawRoundedRect(ctx, cx - 120, y, 240, 32, 16);
    ctx.fill();
    ctx.fillStyle = "#9333ea";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText(data.category, cx, y + 21);
    y += 46;
  }

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.font = "18px Arial, Helvetica, sans-serif";
  const lines = wrapText(ctx, data.oneLineVerdict, 640);
  for (const l of lines) {
    ctx.fillText(l, cx, y);
    y += 26;
  }
  y += 16;

  if (opts.includeStatusLeak && data.biggestStatusLeak) {
    ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
    drawRoundedRect(ctx, cx - 280, y, 560, 40, 10);
    ctx.fill();
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Leak: ${data.biggestStatusLeak}`, cx - 250, y + 26);
    y += 52;
  }

  if (opts.includeQuickFix && data.quickFix) {
    ctx.fillStyle = "rgba(5, 150, 105, 0.08)";
    drawRoundedRect(ctx, cx - 280, y, 560, 40, 10);
    ctx.fill();
    ctx.fillStyle = "#059669";
    ctx.font = "bold 14px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    const fixText = ctx.measureText(data.quickFix).width > 520
      ? data.quickFix.slice(0, 65) + "..."
      : data.quickFix;
    ctx.fillText(`Fix: ${fixText}`, cx - 250, y + 26);
    y += 52;
  }

  ctx.fillStyle = "#9333ea";
  ctx.font = "bold 17px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Find your biggest status leak", cx, S - 80);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.font = "12px Arial, Helvetica, sans-serif";
  ctx.fillText("auracheck.app — presentation guidance, not objective truth", cx, S - 36);
}

function drawBoldScore(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  const grad = ctx.createRadialGradient(S / 2, S / 2, 100, S / 2, S / 2, 700);
  grad.addColorStop(0, "#1e0a3c");
  grad.addColorStop(1, "#0a0612");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Huge score in background
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.font = "bold 320px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${data.auraScore}`, S / 2, S / 2 + 20);
  ctx.textBaseline = "alphabetic";

  const cx = S / 2;
  let y = 200;

  if (opts.includeBranding) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.6)";
    ctx.font = "bold 22px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AuraCheck", cx, y);
    y += 50;
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 130px Arial, Helvetica, sans-serif";
  ctx.fillText(`${data.auraScore}`, cx, y + 110);
  y += 120;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "24px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 20;

  const barW = 400;
  const barX = cx - barW / 2;
  drawRoundedRect(ctx, barX, y, barW, 12, 6);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  drawRoundedRect(ctx, barX, y, barW * (data.auraScore / 100), 12, 6);
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barGrad.addColorStop(0, "#a855f7");
  barGrad.addColorStop(0.5, "#ec4899");
  barGrad.addColorStop(1, "#f43f5e");
  ctx.fillStyle = barGrad;
  ctx.fill();
  y += 50;

  if (data.category) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
    drawRoundedRect(ctx, cx - 140, y, 280, 38, 19);
    ctx.fill();
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.fillText(data.category, cx, y + 25);
    y += 54;
  }

  if (opts.includeStatusLeak && data.biggestStatusLeak) {
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.fillText(`Biggest Leak: ${data.biggestStatusLeak}`, cx, y);
    y += 36;
  }

  if (opts.includeQuickFix && data.quickFix) {
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    const fixT = `Fix: ${data.quickFix}`;
    const truncated = fixT.length > 55 ? fixT.slice(0, 55) + "..." : fixT;
    ctx.fillText(truncated, cx, y);
    y += 46;
  }

  ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
  ctx.font = "bold 20px Arial, Helvetica, sans-serif";
  ctx.fillText("Find your biggest status leak", cx, S - 90);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "13px Arial, Helvetica, sans-serif";
  ctx.fillText("auracheck.app — presentation guidance, not objective truth", cx, S - 36);
}

export async function renderShareCardToCanvas(
  data: ShareCardData,
  opts: ShareCardOptions
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  switch (opts.cardStyle) {
    case "clean_minimal":
      drawCleanMinimal(ctx, data, opts);
      break;
    case "bold_score":
      drawBoldScore(ctx, data, opts);
      break;
    default:
      drawPremiumDark(ctx, data, opts);
      break;
  }

  return canvas;
}
