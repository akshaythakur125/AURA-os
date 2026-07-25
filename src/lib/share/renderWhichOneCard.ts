// 9:16 "Which One?" comparison card — two photos, two scores, a clear winner.

export interface WhichOneCardData {
  scoreA: number;
  scoreB: number;
  winner: "A" | "B" | "tie";
  reason: string;
  imageA?: string;
  imageB?: string;
  includeImages: boolean;
}

const W = 1080;
const H = 1920;
const ACCENT = "#E14434";

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
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

export async function renderWhichOneCard(data: WhichOneCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const cx = W / 2;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#160a08");
  grad.addColorStop(0.5, "#0b0706");
  grad.addColorStop(1, "#040406");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(225,68,52,0.14)";
  ctx.beginPath(); ctx.arc(W - 120, 320, 420, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff"; ctx.font = "bold 38px Arial, sans-serif";
  ctx.fillText("AuraCheck", cx, 116);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "24px Arial, sans-serif";
  ctx.fillText("WHICH  ONE?", cx, 158);

  // Two panels
  const panelW = 430, panelH = 620, gap = 40;
  const totalW = panelW * 2 + gap;
  const startX = cx - totalW / 2;
  const panelY = 250;
  const imgs = data.includeImages ? await Promise.all([data.imageA ? loadImg(data.imageA) : null, data.imageB ? loadImg(data.imageB) : null]) : [null, null];

  const panels: Array<{ x: number; label: string; score: number; win: boolean }> = [
    { x: startX, label: "A", score: data.scoreA, win: data.winner === "A" },
    { x: startX + panelW + gap, label: "B", score: data.scoreB, win: data.winner === "B" },
  ];
  panels.forEach((pn, i) => {
    // panel bg
    ctx.fillStyle = pn.win ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)";
    roundRect(ctx, pn.x, panelY, panelW, panelH, 36); ctx.fill();
    // photo
    if (imgs[i]) {
      const im = imgs[i]!;
      const ph = 380, pw = panelW - 48, ix = pn.x + 24, iy = panelY + 24;
      ctx.save(); roundRect(ctx, ix, iy, pw, ph, 24); ctx.clip();
      const s = Math.max(pw / im.width, ph / im.height);
      ctx.drawImage(im, ix + pw / 2 - im.width * s / 2, iy + ph / 2 - im.height * s / 2, im.width * s, im.height * s);
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, pn.x + 24, panelY + 24, panelW - 48, 380, 24); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "bold 120px Arial, sans-serif";
      ctx.fillText(pn.label, pn.x + panelW / 2, panelY + 24 + 260);
    }
    // score
    ctx.fillStyle = pn.win ? "#34d399" : "#fff"; ctx.font = "bold 92px Arial, sans-serif";
    ctx.fillText(`${pn.score}`, pn.x + panelW / 2, panelY + 500);
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "26px Arial, sans-serif";
    ctx.fillText(`PHOTO ${pn.label} · /100`, pn.x + panelW / 2, panelY + 545);
    if (pn.win) {
      ctx.font = "48px Arial, sans-serif"; ctx.fillText("👑", pn.x + panelW / 2, panelY - 6);
      ctx.lineWidth = 4; ctx.strokeStyle = "#34d399"; roundRect(ctx, pn.x, panelY, panelW, panelH, 36); ctx.stroke();
    }
  });

  // VS
  ctx.fillStyle = ACCENT; ctx.font = "bold 60px Arial, sans-serif";
  ctx.fillText("VS", cx, panelY + panelH / 2 + 20);

  // Winner banner
  let y = panelY + panelH + 130;
  ctx.fillStyle = "#fff"; ctx.font = "bold 72px Arial, sans-serif";
  ctx.fillText(data.winner === "tie" ? "IT'S A TIE" : `POST PHOTO ${data.winner}`, cx, y);
  y += 80;
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "38px Arial, sans-serif";
  for (const l of wrap(ctx, data.reason, W - 200).slice(0, 3)) { ctx.fillText(l, cx, y); y += 52; }

  // Footer
  ctx.fillStyle = ACCENT; ctx.font = "bold 40px Arial, sans-serif";
  ctx.fillText("Settle it free", cx, H - 150);
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillText("fixmyaura.shop", cx, H - 96);
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "22px Arial, sans-serif";
  ctx.fillText("Presentation guidance, not objective truth.", cx, H - 46);

  return canvas;
}
