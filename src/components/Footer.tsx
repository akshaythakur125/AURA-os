import Link from "next/link";
import { Container } from "@/components/ui/Container";

const footerLinks = [
  {
    label: "Product",
    links: [
      { href: "/audit/new", label: "Start Audit" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/examples", label: "Examples" },
      { href: "/shop", label: "Shop" },
    ],
  },
  {
    label: "Trust & Safety",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy-center", label: "Privacy Center" },
      { href: "/data", label: "Your Local Data" },
      { href: "/help", label: "Help & FAQ" },
    ],
  },
  {
    label: "Features",
    links: [
      { href: "/challenges", label: "Challenges" },
      { href: "/progress", label: "Progress" },
      { href: "/install", label: "Install App" },
      { href: "/unlock", label: "Unlock Report" },
    ],
  },
  {
    label: "Support",
    links: [
      { href: "/help", label: "Help & FAQ" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-[#1c1917]/[0.08]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(225, 68, 52,0.04),transparent_60%)]" />
      <Container className="relative py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-[#E14434] text-[11px] font-bold text-white shadow-[var(--shadow-glow-red)]">
                A
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/15 to-transparent" />
              </div>
              <span className="text-[14px] font-semibold tracking-tight text-[#1C1917]">AuraCheck</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[#857b6e]">
              First-impression intelligence for the modern age.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#6f675e]">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#857b6e] transition-colors duration-200 hover:text-red-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-[#1c1917]/[0.08] pt-6 text-center text-[12px] text-[#9c9184]">
          &copy; {new Date().getFullYear()} AuraCheck. For informational and
          entertainment purposes only.
          <span className="mt-1 block text-[10px] text-[#b0a696]">
            3D: &ldquo;Fox&rdquo; by tomkranis (CC BY 4.0). Camera, fish &amp; boombox models CC0.
          </span>
        </div>
      </Container>
    </footer>
  );
}
