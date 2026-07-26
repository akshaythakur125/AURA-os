// Purpose-built 9:16 "glow-up" flex card for paid users. Tells the score story
// — where you are now → your measured ceiling — so a buyer can post their
// potential to a Story. Numbers only (no photo), brand-dark theme, safe canvas
// fonts so it renders identically everywhere without web-font loading.

export interface GlowupCardData {
  current: number;
  ceiling: number;
  edge?: string; // strongest signal
  move?: string; // the one move to hit the ceiling
}

const W = 1080;
const H = 1920;
const VERM = "#ff6a4d";

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

export function renderGlowupCard(data: GlowupCardData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const cx = W / 2;
  const gain = Math.max(0, data.ceiling - data.current);

  // ── Background ──
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#2a1410");
  grad.addColorStop(0.5, "#0d0705");
  grad.addColorStop(1, "#040406");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(225,68,52,0.22)";
  ctx.beginPath(); ctx.arc(W - 120, 360, 460, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(120, H - 460, 400, 0, Math.PI * 2); ctx.fill();

  // ── Wordmark ──
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px Arial, Helvetica, sans-serif";
  ctx.fillText("AuraCheck", cx, 130);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "24px Arial, Helvetica, sans-serif";
  ctx.fillText("MY  GLOW-UP", cx, 172);

  // ── Score story: now → ceiling ──
  let y = 560;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "bold 34px Arial, Helvetica, sans-serif";
  ctx.fillText("MY AURA CEILING", cx, 400);

  // three centred blocks: [current] [→] [ceiling]
  ctx.font = "bold 220px Arial, Helvetica, sans-serif";
  const curStr = `${data.current}`;
  const ceilStr = `${data.ceiling}`;
  const curW = ctx.measureText(curStr).width;
  const ceilW = ctx.measureText(ceilStr).width;
  ctx.font = "bold 90px Arial, Helvetica, sans-serif";
  const arrowW = ctx.measureText("→").width;
  const gap = 46;
  const totalW = curW + gap + arrowW + gap + ceilW;
  let x = cx - totalW / 2;

  ctx.textAlign = "left";
  ctx.font = "bold 220px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(curStr, x, y);
  x += curW + gap;
  ctx.font = "bold 90px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("→", x, y - 56);
  x += arrowW + gap;
  ctx.font = "bold 220px Arial, Helvetica, sans-serif";
  ctx.fillStyle = VERM;
  ctx.fillText(ceilStr, x, y);
  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "32px Arial, Helvetica, sans-serif";
  ctx.fillText("now                     ceiling", cx, y + 60);

  // ── Gain pill ──
  y += 190;
  if (gain > 0) {
    ctx.font = "bold 52px Arial, Helvetica, sans-serif";
    const pillTxt = `+${gain} to unlock 🔥`;
    const pw = ctx.measureText(pillTxt).width + 90;
    const ph = 108;
    ctx.fillStyle = "rgba(225,68,52,0.14)";
    roundRect(ctx, cx - pw / 2, y, pw, ph, 54); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = VERM;
    roundRect(ctx, cx - pw / 2, y, pw, ph, 54); ctx.stroke();
    ctx.fillStyle = VERM;
    ctx.textBaseline = "middle";
    ctx.fillText(pillTxt, cx, y + ph / 2 + 4);
    ctx.textBaseline = "alphabetic";
    y += ph + 120;
  } else {
    ctx.fillStyle = VERM;
    ctx.font = "bold 48px Arial, Helvetica, sans-serif";
    ctx.fillText("Already near the top 🔥", cx, y + 40);
    y += 150;
  }

  // ── Edge ──
  if (data.edge) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 30px Arial, Helvetica, sans-serif";
    ctx.fillText("MY EDGE", cx, y);
    y += 52;
    ctx.fillStyle = "#ffffff";
    ctx.font = "44px Arial, Helvetica, sans-serif";
    ctx.fillText(data.edge, cx, y);
    y += 96;
  }

  // ── The one move ──
  if (data.move) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 30px Arial, Helvetica, sans-serif";
    ctx.fillText("ONE MOVE TO GET THERE", cx, y);
    y += 52;
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Arial, Helvetica, sans-serif";
    for (const l of wrap(ctx, data.move, W - 200).slice(0, 2)) { ctx.fillText(l, cx, y); y += 52; }
  }

  // ── Footer CTA ──
  ctx.fillStyle = VERM;
  ctx.font = "bold 42px Arial, Helvetica, sans-serif";
  ctx.fillText("What's your aura?", cx, H - 150);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 46px Arial, Helvetica, sans-serif";
  ctx.fillText("fixmyaura.shop", cx, H - 94);
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.font = "22px Arial, Helvetica, sans-serif";
  ctx.fillText("Presentation guidance, not objective truth.", cx, H - 46);

  return canvas;
}
