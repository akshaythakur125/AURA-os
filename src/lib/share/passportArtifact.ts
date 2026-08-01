/**
 * Builds the Style Passport as a self-contained, printable HTML card the user
 * downloads and keeps on their phone — the thing they pull up at the salon, the
 * optician, or mid-shop. Being keepable and reusable is the whole point: it
 * turns a ₹21 scan into a reference they come back to for months.
 */
import type { StylePassportData } from "@/lib/style/passport";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function chips(items: string[], accent = false): string {
  if (!items.length) return "";
  return `<div class="chips">${items.map((i) => `<span class="chip${accent ? " acc" : ""}">${esc(i)}</span>`).join("")}</div>`;
}

function swatches(colors: string[]): string {
  if (!colors.length) return "";
  return `<div class="chips">${colors
    .map((c) => `<span class="chip sw"><i style="background:${cssColor(c)}"></i>${esc(c)}</span>`)
    .join("")}</div>`;
}

// Best-effort colour name → CSS for the swatch dot; unknown names fall back to a dot.
function cssColor(name: string): string {
  const n = name.toLowerCase();
  const map: Record<string, string> = {
    olive: "#708238", rust: "#b7410e", cream: "#f5f0e1", navy: "#1f2a44", burgundy: "#5b1a2b",
    charcoal: "#36454f", camel: "#c19a6b", forest: "#228b22", teal: "#008080", mustard: "#e1ad01",
    coral: "#ff7f50", lavender: "#b57edc", "icy blue": "#a5d8ff", emerald: "#2ecc71", terracotta: "#e2725b",
    black: "#111", white: "#fafafa", grey: "#8a8a8a", gray: "#8a8a8a", brown: "#7a4a2b", beige: "#e8dcc4",
    pink: "#ff9fb2", red: "#c0392b", blue: "#2e5cff", green: "#2e8b57", yellow: "#f1c40f", orange: "#e67e22",
    purple: "#8e44ad", maroon: "#800000", tan: "#d2b48c", gold: "#d4af37", silver: "#c0c0c0",
  };
  for (const k of Object.keys(map)) if (n.includes(k)) return map[k];
  return "#b9b2a6";
}

function block(title: string, body: string): string {
  return body ? `<section class="b"><h2>${esc(title)}</h2>${body}</section>` : "";
}

export function buildStylePassportHtml(d: StylePassportData): string {
  const faceBody = d.face
    ? `${block("", "")}
       <p class="lab">Haircuts</p>${chips(d.face.haircuts)}
       <p class="lab">Glasses shapes</p>${chips(d.face.glasses)}
       <p class="lab">Necklines that suit you</p>${chips(d.face.necklines)}
       <p class="lab">Beard / facial hair</p>${chips(d.face.beard)}
       <p class="avoid">✕ Avoid: ${esc(d.face.avoid)}</p>`
    : "";

  const colorBody =
    (d.powerColors.length ? `<p class="lab">Wear these — your power colours</p>${swatches(d.powerColors)}` : "") +
    (d.avoidColors.length ? `<p class="lab">Skip these near your face</p>${swatches(d.avoidColors)}` : "") +
    (d.metals.length ? `<p class="lab">Metals & jewellery</p>${chips(d.metals)}` : "") +
    (d.frameColors.length ? `<p class="lab">Frame colours</p>${chips(d.frameColors)}` : "");

  const identityBody =
    (d.archetype ? `<p class="lab">Style archetype</p><p class="val">${esc(d.archetype)}</p>` : "") +
    (d.scent ? `<p class="lab">Signature scent family</p><p class="val">${esc(d.scent.label)}</p><p class="sub">${esc(d.scent.note)}</p>` : "") +
    (d.groomingFocus ? `<p class="lab">Grooming focus</p><p class="val">${esc(d.groomingFocus)}</p>` : "");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Style Passport — AuraCheck</title>
<style>
  :root { --ink:#1C1917; --muted:#6f675e; --faint:#9c9184; --accent:#E14434; --line:rgba(28,25,23,0.12); --bg:#FBF8F2; --card:#fff; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--ink); background:var(--bg); padding:22px; }
  .wrap { max-width:620px; margin:0 auto; }
  header { text-align:center; margin-bottom:18px; }
  .kicker { font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:var(--accent); font-weight:700; }
  h1 { font-size:22px; margin:.3em 0 .15em; }
  .head { font-size:13px; color:var(--muted); }
  .b { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px 18px; margin-bottom:12px; }
  .b h2 { font-size:14px; margin:0 0 10px; }
  .lab { font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--faint); font-weight:700; margin:12px 0 6px; }
  .lab:first-child { margin-top:0; }
  .val { font-size:15px; font-weight:600; margin:0; }
  .sub { font-size:12px; color:var(--muted); margin:2px 0 0; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { border:1px solid var(--line); background:rgba(28,25,23,.03); border-radius:999px; padding:4px 10px; font-size:12px; color:#4a443d; display:inline-flex; align-items:center; gap:6px; }
  .chip.acc { border-color:rgba(225,68,52,.3); color:var(--accent); }
  .chip.sw i { width:12px; height:12px; border-radius:50%; border:1px solid rgba(0,0,0,.15); display:inline-block; }
  .avoid { font-size:12px; color:var(--faint); margin:12px 0 0; }
  footer { text-align:center; font-size:11px; color:var(--faint); margin-top:8px; }
  @media print { body { background:#fff; padding:0; } .b { break-inside:avoid; } }
</style></head>
<body><div class="wrap">
  <header>
    <div class="kicker">Aura Style Passport</div>
    <h1>Your personal style spec</h1>
    <p class="head">${esc(d.headline)}</p>
  </header>
  ${block(d.faceShape ? `Face — ${d.faceShape}` : "Face", faceBody)}
  ${block("Colour" + (d.undertone ? ` — ${d.undertone} undertone` : ""), colorBody)}
  ${block("Your identity", identityBody)}
  <footer>Made with AuraCheck · fixmyaura.shop — carry this whenever you shop, groom or get a haircut.</footer>
</div></body></html>`;
}
