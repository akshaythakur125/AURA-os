// Purpose-built 9:16 "Post or Not?" Story card. Designed to be screenshot-and-
// shared — bold verdict, the user's aura score, and the one measured reason.
// Uses safe canvas fonts (Arial stack) so it renders identically everywhere
// without waiting on web-font loading.

export type PostVerdict = "post" | "almost" | "notyet";

export interface PostCardData {
  verdict: PostVerdict;
  score: number;
  oneLiner: string;
  evidence?: string;
  fix?: string;
  imageDataUrl?: string;
  includeImage: boolean;
}

const W = 1080;
const H = 1920;

const THEME: Record<PostVerdict, { label: string; emoji: string; top: string; bottom: string; accent: string; glow: string }> = {
  post: { label: "POST IT", emoji: "✅", top: "#0c2f24", bottom: "#050d0a", accent: "#34d399", glow: "rgba(52,211,153,0.20)" },
  almost: { label: "ALMOST", emoji: "🟡", top: "#33290b", bottom: "#0d0a04", accent: "#f5b342", glow: "rgba(245,179,66,0.20)" },
  notyet: { label: "NOT YET", emoji: "🔴", top: "#331010", bottom: "#0d0505", accent: "#f2544a", glow: "rgba(242,84,74,0.20)" },
};

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

export async function renderPostVerdictCard(data: PostCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const t = THEME[data.verdict];
  const cx = W / 2;

  // ── Background ──
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, t.top);
  grad.addColorStop(0.55, t.bottom);
  grad.addColorStop(1, "#040406");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // accent glow orb
  ctx.fillStyle = t.glow;
  ctx.beginPath();
  ctx.arc(W - 120, 340, 460, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(120, H - 420, 380, 0, Math.PI * 2);
  ctx.fill();

  // ── Wordmark ──
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px Arial, Helvetica, sans-serif";
  ctx.fillText("AuraCheck", cx, 118);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "22px Arial, Helvetica, sans-serif";
  ctx.fillText("POST  OR  NOT?", cx, 158);

  let y = 250;

  // ── Optional photo ──
  if (data.includeImage && data.imageDataUrl) {
    const img = await loadImg(data.imageDataUrl);
    if (img) {
      const bw = 560, bh = 560, bx = cx - bw / 2, by = y;
      ctx.save();
      roundRect(ctx, bx, by, bw, bh, 44);
      ctx.clip();
      // cover-fit
      const s = Math.max(bw / img.width, bh / img.height);
      const sw = img.width * s, sh = img.height * s;
      ctx.drawImage(img, cx - sw / 2, by + bh / 2 - sh / 2, sw, sh);
      ctx.restore();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      roundRect(ctx, bx, by, bw, bh, 44);
      ctx.stroke();
      y = by + bh + 80;
    } else {
      y = 430;
    }
  } else {
    y = 430;
  }

  // ── Verdict pill ──
  ctx.font = "bold 84px Arial, Helvetica, sans-serif";
  const label = `${t.emoji}  ${t.label}`;
  const pw = ctx.measureText(label).width + 96;
  const ph = 140;
  const px = cx - pw / 2;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, px, y, pw, ph, 70);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = t.accent;
  roundRect(ctx, px, y, pw, ph, 70);
  ctx.stroke();
  ctx.fillStyle = t.accent;
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, y + ph / 2 + 4);
  ctx.textBaseline = "alphabetic";
  y += ph + 175;

  // ── Score ──
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 150px Arial, Helvetica, sans-serif";
  ctx.fillText(`${data.score}`, cx, y);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "40px Arial, Helvetica, sans-serif";
  ctx.fillText("AURA SCORE / 100", cx, y + 52);
  y += 130;

  // ── One-liner ──
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "40px Arial, Helvetica, sans-serif";
  for (const line of wrap(ctx, data.oneLiner, W - 200).slice(0, 3)) {
    ctx.fillText(line, cx, y);
    y += 56;
  }
  y += 30;

  // ── Measured evidence chip ──
  if (data.evidence) {
    ctx.font = "bold 30px Arial, Helvetica, sans-serif";
    const et = `📊  ${data.evidence}`;
    const lines = wrap(ctx, et, W - 260);
    const chipH = 40 + lines.length * 42;
    const chipW = W - 160;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, 80, y, chipW, chipH, 28);
    ctx.fill();
    ctx.fillStyle = t.accent;
    let cyc = y + 46;
    for (const l of lines.slice(0, 2)) { ctx.fillText(l, cx, cyc); cyc += 42; }
    y += chipH + 44;
  }

  // ── Fix ──
  if (data.fix) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.fillText("THE ONE FIX", cx, y);
    y += 46;
    ctx.fillStyle = "#ffffff";
    ctx.font = "34px Arial, Helvetica, sans-serif";
    for (const l of wrap(ctx, data.fix, W - 200).slice(0, 2)) { ctx.fillText(l, cx, y); y += 46; }
  }

  // ── Footer CTA ──
  ctx.fillStyle = t.accent;
  ctx.font = "bold 40px Arial, Helvetica, sans-serif";
  ctx.fillText("Get your free verdict", cx, H - 150);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 44px Arial, Helvetica, sans-serif";
  ctx.fillText("fixmyaura.shop", cx, H - 96);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "22px Arial, Helvetica, sans-serif";
  ctx.fillText("Presentation guidance, not objective truth.", cx, H - 46);

  return canvas;
}
