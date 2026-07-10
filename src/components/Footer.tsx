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
    <footer className="relative mt-auto border-t border-white/[0.04]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.04),transparent_60%)]" />
      <Container className="relative py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-[11px] font-bold text-white shadow-[var(--shadow-glow-purple)]">
                A
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/15 to-transparent" />
              </div>
              <span className="text-[14px] font-semibold tracking-tight text-white">AuraCheck</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-gray-500">
              First-impression intelligence for the modern age.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-gray-500 transition-colors duration-200 hover:text-purple-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-white/[0.04] pt-6 text-center text-[12px] text-gray-600">
          &copy; {new Date().getFullYear()} AuraCheck. For informational and
          entertainment purposes only.
        </div>
      </Container>
    </footer>
  );
}
