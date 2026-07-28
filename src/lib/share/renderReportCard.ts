// A premium, downloadable one-page "Aura Report" card (1080 × 2160) — the pro
// keepsake. Light/branded document look, self-contained (safe canvas fonts,
// optional embedded photo), so it renders identically everywhere and downloads
// as a crisp PNG. Summarises the paid report: score → ceiling, verdict, the
// measured breakdown, and the top fixes.

export interface ReportCardData {
  score: number;
  ceiling: number;
  category: string;
  verdict: string;
  breakdown: { label: string; value: number }[];
  topFixes: { title: string; fix: string }[];
  strengths: string[];
  imageDataUrl?: string;
}

const W = 1080;
const H = 1460;
const INK = "#1C1917";
const MUT = "#857b6e";
const VERM = "#E14434";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderReportCard(data: ReportCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const cx = W / 2;

  // ── Background ──
  ctx.fillStyle = "#FBF8F2";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(225,68,52,0.06)";
  ctx.beginPath(); ctx.arc(W, 0, 460, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(245,158,11,0.05)";
  ctx.beginPath(); ctx.arc(0, H, 420, 0, Math.PI * 2); ctx.fill();

  // ── Header ──
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = "bold 40px Arial, Helvetica, sans-serif";
  ctx.fillText("AuraCheck", 70, 100);
  ctx.textAlign = "right";
  ctx.fillStyle = MUT;
  ctx.font = "26px Arial, Helvetica, sans-serif";
  ctx.fillText("AURA REPORT · " + new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), W - 70, 96);
  ctx.strokeStyle = "rgba(28,25,23,0.10)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(70, 140); ctx.lineTo(W - 70, 140); ctx.stroke();

  let y = 210;

  // ── Photo (optional) + score block ──
  const photo = data.imageDataUrl ? await loadImg(data.imageDataUrl) : null;
  if (photo) {
    const s = 260, px = 70, py = y;
    ctx.save();
    roundRect(ctx, px, py, s, s, 32);
    ctx.clip();
    const sc = Math.max(s / photo.width, s / photo.height);
    ctx.drawImage(photo, px + s / 2 - (photo.width * sc) / 2, py + s / 2 - (photo.height * sc) / 2, photo.width * sc, photo.height * sc);
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = "rgba(225,68,52,0.30)";
    roundRect(ctx, px, py, s, s, 32); ctx.stroke();
  }

  // score → ceiling to the right of the photo
  const sx = photo ? 380 : 70;
  ctx.textAlign = "left";
  ctx.fillStyle = MUT;
  ctx.font = "bold 28px Arial, Helvetica, sans-serif";
  ctx.fillText("YOUR AURA SCORE", sx, y + 40);
  ctx.fillStyle = INK;
  ctx.font = "bold 150px Arial, Helvetica, sans-serif";
  ctx.fillText(`${data.score}`, sx, y + 175);
  const sw = ctx.measureText(`${data.score}`).width;
  ctx.fillStyle = MUT;
  ctx.font = "40px Arial, Helvetica, sans-serif";
  ctx.fillText("/100", sx + sw + 14, y + 175);
  ctx.fillStyle = VERM;
  ctx.font = "bold 34px Arial, Helvetica, sans-serif";
  ctx.fillText(`${data.category}  ·  ceiling ${data.ceiling}`, sx, y + 225);
  y += 300;

  // ── Verdict ──
  ctx.fillStyle = "#4a443d";
  ctx.font = "34px Arial, Helvetica, sans-serif";
  for (const line of wrap(ctx, data.verdict, W - 140).slice(0, 3)) {
    ctx.fillText(line, 70, y);
    y += 48;
  }
  y += 30;

  // ── Breakdown bars ──
  ctx.fillStyle = INK;
  ctx.font = "bold 34px Arial, Helvetica, sans-serif";
  ctx.fillText("Score breakdown", 70, y);
  y += 40;
  const barW = W - 140, barX = 70;
  for (const b of data.breakdown.slice(0, 7)) {
    ctx.fillStyle = "#6f675e";
    ctx.font = "28px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(b.label, barX, y);
    ctx.textAlign = "right";
    ctx.fillStyle = INK;
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.fillText(`${Math.round(b.value)}`, barX + barW, y);
    ctx.textAlign = "left";
    y += 16;
    ctx.fillStyle = "rgba(28,25,23,0.07)";
    roundRect(ctx, barX, y, barW, 14, 7); ctx.fill();
    const v = Math.max(3, Math.min(100, b.value));
    const col = b.value >= 70 ? "#22c55e" : b.value >= 45 ? "#E9A23B" : VERM;
    ctx.fillStyle = col;
    roundRect(ctx, barX, y, (barW * v) / 100, 14, 7); ctx.fill();
    y += 46;
  }
  y += 14;

  // ── Fix these first ──
  ctx.fillStyle = INK;
  ctx.font = "bold 34px Arial, Helvetica, sans-serif";
  ctx.fillText("Fix these first", 70, y);
  y += 46;
  data.topFixes.slice(0, 3).forEach((f, i) => {
    ctx.fillStyle = VERM;
    ctx.beginPath(); ctx.arc(88, y - 10, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${i + 1}`, 88, y - 2);
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "bold 30px Arial, Helvetica, sans-serif";
    ctx.fillText(f.title, 122, y);
    y += 40;
    ctx.fillStyle = "#6f675e";
    ctx.font = "27px Arial, Helvetica, sans-serif";
    for (const line of wrap(ctx, f.fix.split(/(?<=\.)\s/)[0], W - 200).slice(0, 2)) {
      ctx.fillText(line, 122, y);
      y += 38;
    }
    y += 22;
  });

  // ── Footer ──
  ctx.textAlign = "center";
  ctx.fillStyle = VERM;
  ctx.font = "bold 40px Arial, Helvetica, sans-serif";
  ctx.fillText("fixmyaura.shop", cx, H - 90);
  ctx.fillStyle = "rgba(28,25,23,0.35)";
  ctx.font = "24px Arial, Helvetica, sans-serif";
  ctx.fillText("Presentation guidance, not objective truth.", cx, H - 48);

  return canvas;
}
