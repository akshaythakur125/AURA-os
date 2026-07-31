/**
 * Builds a self-contained, printable "30-Day Glow-Up Checklist" as a single HTML
 * file the user can download, keep, print, or Save-as-PDF on their phone — the
 * tangible artifact that makes a ₹400 plan feel like something they own, not a
 * page they closed.
 */
import type { GlowupPlan, WeekPlan } from "@/types/audit";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function weekBlock(week: WeekPlan, n: number, completed: Set<number>): string {
  const done = week.dailyMissions.filter((m) => completed.has(m.day)).length;
  const rows = week.dailyMissions
    .map(
      (m) => `
      <li class="${completed.has(m.day) ? "done" : ""}">
        <span class="box">${completed.has(m.day) ? "☑" : "☐"}</span>
        <span class="day">Day ${m.day}</span>
        <span class="task"><b>${esc(m.title)}</b><br><small>${esc(m.description)}</small></span>
      </li>`,
    )
    .join("");
  return `
    <section class="week">
      <h2>Week ${n} · ${esc(week.title)} <span class="wprog">${done}/${week.dailyMissions.length}</span></h2>
      <p class="focus">${esc(week.focus)}</p>
      <ul>${rows}</ul>
    </section>`;
}

export function buildGlowupChecklistHtml(plan: GlowupPlan, completedDays: Set<number> = new Set()): string {
  const weeks = [plan.week1, plan.week2, plan.week3, plan.week4];
  const total = weeks.reduce((s, w) => s + w.dailyMissions.length, 0);
  const done = weeks.reduce((s, w) => s + w.dailyMissions.filter((m) => completedDays.has(m.day)).length, 0);
  const milestones = (plan.milestones || [])
    .map((ms) => `<li><b>Week ${ms.week}:</b> ${esc(ms.target)}</li>`)
    .join("");
  const budget = plan.budgetRoadmap;
  const budgetList = (label: string, items: string[]) =>
    items.length ? `<div class="btier"><h4>${label}</h4><ul class="plain">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>` : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>My 30-Day Glow-Up Checklist — AuraCheck</title>
<style>
  :root { --ink:#1C1917; --muted:#6f675e; --accent:#E14434; --line:rgba(28,25,23,0.12); --bg:#FBF8F2; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--ink); background:var(--bg); }
  .wrap { max-width:720px; margin:0 auto; padding:32px 20px 56px; }
  header { border-bottom:2px solid var(--ink); padding-bottom:14px; margin-bottom:20px; }
  .brand { font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); font-weight:700; }
  h1 { font-size:28px; margin:6px 0 2px; }
  .prog { margin:14px 0 4px; }
  .bar { height:10px; background:#F2ECE1; border-radius:6px; overflow:hidden; }
  .bar > i { display:block; height:100%; background:var(--accent); border-radius:6px; }
  .progtext { font-size:13px; color:var(--muted); margin-top:6px; }
  .focus { color:var(--muted); font-size:13px; margin:4px 0 12px; }
  .callout { background:#fff; border:1px solid var(--line); border-radius:12px; padding:14px 16px; margin:16px 0; }
  .callout h3 { margin:0 0 8px; font-size:14px; }
  ul { list-style:none; padding:0; margin:0; }
  ul.plain { list-style:disc; padding-left:18px; }
  .week { margin-top:24px; }
  .week h2 { font-size:17px; border-bottom:1px solid var(--line); padding-bottom:6px; }
  .wprog { float:right; font-size:12px; color:var(--muted); font-weight:600; }
  .week li { display:flex; gap:10px; padding:8px 0; border-bottom:1px dashed var(--line); align-items:flex-start; }
  .week li.done .task b { text-decoration:line-through; color:var(--muted); }
  .box { font-size:18px; line-height:1; }
  .day { font-size:11px; color:var(--muted); min-width:46px; padding-top:2px; }
  .task small { color:var(--muted); }
  .budget { margin-top:26px; }
  .btier h4 { margin:10px 0 4px; font-size:13px; }
  footer { margin-top:32px; font-size:11px; color:#9c9184; text-align:center; }
  @media print { body { background:#fff; } .wrap { padding:0; } a { color:inherit; } }
</style></head>
<body><div class="wrap">
  <header>
    <div class="brand">AuraCheck · 30-Day Glow-Up</div>
    <h1>My Glow-Up Checklist</h1>
    <div class="prog">
      <div class="bar"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>
      <div class="progtext">${done} of ${total} missions done · ${total ? Math.round((done / total) * 100) : 0}% complete</div>
    </div>
  </header>

  ${plan.focus ? `<div class="callout"><h3>Your focus</h3><p style="margin:0">${esc(plan.focus)}</p></div>` : ""}
  ${milestones ? `<div class="callout"><h3>Weekly milestones</h3><ul class="plain">${milestones}</ul></div>` : ""}

  ${weeks.map((w, i) => weekBlock(w, i + 1, completedDays)).join("")}

  <div class="budget">
    <h2 style="font-size:17px;border-bottom:1px solid var(--line);padding-bottom:6px">Budget roadmap</h2>
    ${budgetList("Free", budget.free)}
    ${budgetList("Under ₹2,000", budget.under2000)}
    ${budgetList("Under ₹5,000", budget.under5000)}
    ${budgetList("Under ₹10,000", budget.under10000)}
  </div>

  <footer>Generated by AuraCheck · fixmyaura.shop · Tick a box a day and re-scan on day 30 to see your glow-up.</footer>
</div></body></html>`;
}
