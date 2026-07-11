import type { ShareCardData, ShareCardOptions } from "@/types/share";

const STORY_W = 1080;
const STORY_H = 1920;
const R = 40;

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

function drawAuroraBackground(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, STORY_W, STORY_H);
  grad.addColorStop(0, "#050508");
  grad.addColorStop(0.3, "#0a0516");
  grad.addColorStop(0.6, "#0f0a1a");
  grad.addColorStop(1, "#050508");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Purple orb top-right
  ctx.fillStyle = "rgba(147, 51, 234, 0.12)";
  ctx.beginPath();
  ctx.arc(STORY_W - 100, 300, 400, 0, Math.PI * 2);
  ctx.fill();

  // Pink orb bottom-left
  ctx.fillStyle = "rgba(236, 72, 153, 0.08)";
  ctx.beginPath();
  ctx.arc(100, STORY_H - 400, 350, 0, Math.PI * 2);
  ctx.fill();

  // Blue accent mid
  ctx.fillStyle = "rgba(14, 165, 233, 0.05)";
  ctx.beginPath();
  ctx.arc(STORY_W / 2, STORY_H * 0.6, 300, 0, Math.PI * 2);
  ctx.fill();
}

function drawStoryPremiumDark(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  drawAuroraBackground(ctx);

  const cx = STORY_W / 2;
  let y = 140;

  // Branding
  if (opts.includeBranding) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
    ctx.font = "bold 32px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AuraCheck", cx, y);
    y += 20;
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "16px Arial, Helvetica, sans-serif";
    ctx.fillText("First-Impression Intelligence", cx, y);
    y += 50;
  }

  // Category badge
  if (data.category) {
    drawRoundedRect(ctx, cx - 140, y, 280, 40, 20);
    ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.category, cx, y + 27);
    y += 60;
  }

  // HUGE score — the hero element
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 220px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${data.auraScore}`, cx, y + 200);
  y += 210;

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "32px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 24;

  // Score bar
  const barW = 500;
  const barH = 12;
  const barX = cx - barW / 2;
  drawRoundedRect(ctx, barX, y, barW, barH, 6);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  drawRoundedRect(ctx, barX, y, barW * (data.auraScore / 100), barH, 6);
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barGrad.addColorStop(0, "#9333ea");
  barGrad.addColorStop(0.5, "#ec4899");
  barGrad.addColorStop(1, "#f43f5e");
  ctx.fillStyle = barGrad;
  ctx.fill();
  y += 50;

  // Archetype
  if (data.archetype) {
    ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
    drawRoundedRect(ctx, cx - 200, y, 400, 38, 19);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.archetype, cx, y + 25);
    y += 56;
  }

  // Verdict
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "24px Arial, Helvetica, sans-serif";
  const verLines = wrapText(ctx, data.oneLineVerdict, 700);
  for (const l of verLines) {
    ctx.fillText(l, cx, y);
    y += 34;
  }
  y += 16;

  // One killer stat — strongest signal OR biggest leak
  if (opts.includeStatusLeak && data.biggestStatusLeak) {
    drawRoundedRect(ctx, cx - 320, y, 640, 56, 14);
    ctx.fillStyle = "rgba(251, 113, 133, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(251, 113, 133, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#fb7185";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    const leakText = data.biggestStatusLeak.length > 40
      ? data.biggestStatusLeak.slice(0, 38) + "..."
      : data.biggestStatusLeak;
    ctx.fillText(`Leak: ${leakText}`, cx - 290, y + 35);
    y += 72;
  }

  // Quick fix
  if (opts.includeQuickFix && data.quickFix) {
    drawRoundedRect(ctx, cx - 320, y, 640, 56, 14);
    ctx.fillStyle = "rgba(52, 211, 153, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(52, 211, 153, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 17px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    const fixLabel = `Fix: ${data.quickFix}`;
    const truncated = fixLabel.length > 45 ? fixLabel.slice(0, 43) + "..." : fixLabel;
    ctx.fillText(truncated, cx - 290, y + 35);
    y += 72;
  }

  // Spacer to push CTA to bottom
  const ctaY = STORY_H - 200;

  // CTA — "your turn" viral loop
  ctx.fillStyle = "rgba(147, 51, 234, 0.2)";
  drawRoundedRect(ctx, cx - 260, ctaY - 20, 520, 60, 30);
  ctx.fill();
  ctx.strokeStyle = "rgba(147, 51, 234, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 22px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Find your score → auracheck.app", cx, ctaY + 16);

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "14px Arial, Helvetica, sans-serif";
  ctx.fillText("presentation guidance, not objective truth", cx, STORY_H - 60);
}

function drawStoryCleanMinimal(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Top accent
  const accent = ctx.createLinearGradient(0, 0, STORY_W, 0);
  accent.addColorStop(0, "#9333ea");
  accent.addColorStop(1, "#ec4899");
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, STORY_W, 8);

  const cx = STORY_W / 2;
  let y = 200;

  if (opts.includeBranding) {
    ctx.fillStyle = "#9333ea";
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AuraCheck", cx, y);
    y += 60;
  }

  ctx.fillStyle = "#111111";
  ctx.font = "bold 200px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${data.auraScore}`, cx, y + 180);
  y += 190;

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.font = "30px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 24;

  const barW = 440;
  const barX = cx - barW / 2;
  drawRoundedRect(ctx, barX, y, barW, 10, 5);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fill();
  drawRoundedRect(ctx, barX, y, barW * (data.auraScore / 100), 10, 5);
  ctx.fillStyle = "#9333ea";
  ctx.fill();
  y += 40;

  if (data.category) {
    ctx.fillStyle = "rgba(147, 51, 234, 0.08)";
    drawRoundedRect(ctx, cx - 140, y, 280, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#9333ea";
    ctx.font = "bold 17px Arial, Helvetica, sans-serif";
    ctx.fillText(data.category, cx, y + 24);
    y += 56;
  }

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.font = "22px Arial, Helvetica, sans-serif";
  const lines = wrapText(ctx, data.oneLineVerdict, 700);
  for (const l of lines) {
    ctx.fillText(l, cx, y);
    y += 30;
  }
  y += 24;

  if (opts.includeStatusLeak && data.biggestStatusLeak) {
    ctx.fillStyle = "rgba(239, 68, 68, 0.06)";
    drawRoundedRect(ctx, cx - 320, y, 640, 50, 12);
    ctx.fill();
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Leak: ${data.biggestStatusLeak}`, cx - 290, y + 33);
    y += 66;
  }

  const ctaY = STORY_H - 200;
  ctx.fillStyle = "#9333ea";
  ctx.font = "bold 24px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Find your score → auracheck.app", cx, ctaY);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.font = "14px Arial, Helvetica, sans-serif";
  ctx.fillText("presentation guidance, not objective truth", cx, STORY_H - 60);
}

function drawStoryBoldScore(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  const grad = ctx.createRadialGradient(STORY_W / 2, STORY_H * 0.35, 50, STORY_W / 2, STORY_H * 0.35, 800);
  grad.addColorStop(0, "#1e0a3c");
  grad.addColorStop(1, "#050508");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Ghost score in background
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  ctx.font = "bold 500px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${data.auraScore}`, STORY_W / 2, STORY_H * 0.35);
  ctx.textBaseline = "alphabetic";

  const cx = STORY_W / 2;
  let y = 240;

  if (opts.includeBranding) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AuraCheck", cx, y);
    y += 60;
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 240px Arial, Helvetica, sans-serif";
  ctx.fillText(`${data.auraScore}`, cx, y + 220);
  y += 230;

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "32px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 24;

  const barW = 500;
  const barX = cx - barW / 2;
  drawRoundedRect(ctx, barX, y, barW, 14, 7);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  drawRoundedRect(ctx, barX, y, barW * (data.auraScore / 100), 14, 7);
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barGrad.addColorStop(0, "#a855f7");
  barGrad.addColorStop(0.5, "#ec4899");
  barGrad.addColorStop(1, "#f43f5e");
  ctx.fillStyle = barGrad;
  ctx.fill();
  y += 56;

  if (data.category) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.18)";
    drawRoundedRect(ctx, cx - 160, y, 320, 42, 21);
    ctx.fill();
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 19px Arial, Helvetica, sans-serif";
    ctx.fillText(data.category, cx, y + 28);
    y += 60;
  }

  if (opts.includeStatusLeak && data.biggestStatusLeak) {
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 22px Arial, Helvetica, sans-serif";
    ctx.fillText(`Leak: ${data.biggestStatusLeak}`, cx, y);
    y += 40;
  }

  const ctaY = STORY_H - 200;
  ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
  ctx.font = "bold 24px Arial, Helvetica, sans-serif";
  ctx.fillText("Find your score → auracheck.app", cx, ctaY);

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "14px Arial, Helvetica, sans-serif";
  ctx.fillText("presentation guidance, not objective truth", cx, STORY_H - 60);
}

// ─── Square format (legacy) ───

const SQ = 1080;

function drawSquarePremiumDark(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  const grad = ctx.createLinearGradient(0, 0, SQ, SQ);
  grad.addColorStop(0, "#0f0a1a");
  grad.addColorStop(0.5, "#1a0f2e");
  grad.addColorStop(1, "#0d0a1a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SQ, SQ);

  ctx.fillStyle = "rgba(147, 51, 234, 0.06)";
  ctx.beginPath();
  ctx.arc(SQ - 120, SQ - 120, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-80, 200, 250, 0, Math.PI * 2);
  ctx.fill();

  const cx = SQ / 2;
  let y = opts.includeImage && data.imageDataUrl ? SQ * 0.58 : 160;

  if (opts.includeImage && data.imageDataUrl) {
    drawRoundedRect(ctx, 60, 60, SQ - 120, SQ - 120, R);
    ctx.save();
    ctx.clip();
    const img = new Image();
    try {
      img.src = data.imageDataUrl;
      const iw = img.width || SQ;
      const ih = img.height || SQ;
      const scale = Math.max((SQ - 120) / iw, (SQ - 120) / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      ctx.drawImage(img, (SQ - sw) / 2, (SQ - sh) / 2, sw, sh);
    } catch { /* fall through */ }
    ctx.restore();
    const overlay = ctx.createLinearGradient(0, SQ * 0.55, 0, SQ);
    overlay.addColorStop(0, "rgba(15, 10, 26, 0)");
    overlay.addColorStop(1, "rgba(15, 10, 26, 0.92)");
    ctx.fillStyle = overlay;
    ctx.fillRect(60, SQ * 0.55, SQ - 120, SQ * 0.45);
  }

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

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 120px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${data.auraScore}`, cx, y + 100);
  y += 110;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "24px Arial, Helvetica, sans-serif";
  ctx.fillText("/ 100", cx, y);
  y += 10;

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

  if (data.archetype) {
    ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
    drawRoundedRect(ctx, cx - 180, y, 360, 32, 16);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "13px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Archetype: ${data.archetype}`, cx, y + 21);
    y += 42;
  }

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "20px Arial, Helvetica, sans-serif";
  const verLines = wrapText(ctx, data.oneLineVerdict, 700);
  for (const l of verLines) {
    ctx.fillText(l, cx, y);
    y += 30;
  }
  y += 10;

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

  const ctaY = SQ - 80;
  ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
  drawRoundedRect(ctx, cx - 200, ctaY - 15, 400, 40, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 18px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Find your biggest photo-quality issue", cx, ctaY + 8);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "13px Arial, Helvetica, sans-serif";
  ctx.fillText("auracheck.app — presentation guidance, not objective truth", cx, SQ - 28);
}

function drawSquareCleanMinimal(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SQ, SQ);
  const accent = ctx.createLinearGradient(0, 0, SQ, 0);
  accent.addColorStop(0, "#9333ea");
  accent.addColorStop(1, "#ec4899");
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, SQ, 6);

  const cx = SQ / 2;
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
  ctx.fillText("Find your biggest photo-quality issue", cx, SQ - 80);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.font = "12px Arial, Helvetica, sans-serif";
  ctx.fillText("auracheck.app — presentation guidance, not objective truth", cx, SQ - 36);
}

function drawSquareBoldScore(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  opts: ShareCardOptions
) {
  const grad = ctx.createRadialGradient(SQ / 2, SQ / 2, 100, SQ / 2, SQ / 2, 700);
  grad.addColorStop(0, "#1e0a3c");
  grad.addColorStop(1, "#0a0612");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SQ, SQ);

  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.font = "bold 320px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${data.auraScore}`, SQ / 2, SQ / 2 + 20);
  ctx.textBaseline = "alphabetic";

  const cx = SQ / 2;
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
  ctx.fillText("Find your biggest photo-quality issue", cx, SQ - 90);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "13px Arial, Helvetica, sans-serif";
  ctx.fillText("auracheck.app — presentation guidance, not objective truth", cx, SQ - 36);
}

export async function renderShareCardToCanvas(
  data: ShareCardData,
  opts: ShareCardOptions
): Promise<HTMLCanvasElement> {
  const isStory = opts.format === "story";
  const w = isStory ? STORY_W : SQ;
  const h = isStory ? STORY_H : SQ;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  if (isStory) {
    switch (opts.cardStyle) {
      case "clean_minimal":
        drawStoryCleanMinimal(ctx, data, opts);
        break;
      case "bold_score":
        drawStoryBoldScore(ctx, data, opts);
        break;
      default:
        drawStoryPremiumDark(ctx, data, opts);
        break;
    }
  } else {
    switch (opts.cardStyle) {
      case "clean_minimal":
        drawSquareCleanMinimal(ctx, data, opts);
        break;
      case "bold_score":
        drawSquareBoldScore(ctx, data, opts);
        break;
      default:
        drawSquarePremiumDark(ctx, data, opts);
        break;
    }
  }

  return canvas;
}
