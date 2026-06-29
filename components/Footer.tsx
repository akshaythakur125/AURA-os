import Link from "next/link";
import { Container } from "@/components/ui/Container";

const footerGroups = [
  {
    label: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/audit/new", label: "Start Audit" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
  {
    label: "Support",
    links: [
      { href: "/unlock", label: "Unlock Report" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black">
      <Container className="py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-sm font-bold text-white">
                A
              </div>
              <span className="text-lg font-bold text-white">AuraCheck</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              First-impression intelligence for the modern age.
            </p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-3 text-sm font-semibold text-white">{group.label}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 transition-colors hover:text-gray-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} AuraCheck. For informational and entertainment purposes only.
        </div>
      </Container>
    </footer>
  );
}
