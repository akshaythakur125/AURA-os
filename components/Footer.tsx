import Link from "next/link";
import { Container } from "@/components/ui/Container";

const footerGroups = [
  {
    label: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/before-after", label: "Before / After" },
      { href: "/examples", label: "Examples" },
      { href: "/challenges", label: "Challenges" },
      { href: "/progress", label: "Progress" },
    ],
  },
  {
    label: "Experience",
    links: [
      { href: "/shop", label: "Style Shop" },
      { href: "/wardrobe", label: "Aura Wardrobe" },
      { href: "/twin-simulator", label: "Aura Twin" },
      { href: "/install", label: "Install App" },
    ],
  },
  {
    label: "Support",
    links: [
      { href: "/help", label: "Help & FAQ" },
      { href: "/privacy-center", label: "Privacy Center" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 px-3 pb-4 sm:px-4">
      <Container className="glass-panel glow-frame rounded-[32px] px-6 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="shine-sweep relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(145deg,rgba(125,211,252,0.95),rgba(59,130,246,0.78),rgba(249,115,22,0.7))] text-sm font-black text-slate-950">
                <span className="display-font">A</span>
              </div>
              <div>
                <div className="display-font text-xl font-bold text-white">AuraCheck</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Premium signal diagnostics
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-white/62">
              A sharper first-impression platform for people who want cleaner photos, stronger style signals, and a more premium digital presence.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
              <span className="rounded-full border border-white/10 px-3 py-1">3D inspired UI</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Mobile ready</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Local-first MVP</span>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                {group.label}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/68 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="section-line mt-10 h-px w-full" />
        <div className="mt-6 flex flex-col gap-3 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} AuraCheck. Built for signal clarity, not vanity worship.</p>
          <p>Guidance only. Presentation advice is not a guarantee of outcomes.</p>
        </div>
      </Container>
    </footer>
  );
}
