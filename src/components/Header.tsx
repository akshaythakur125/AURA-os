"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/examples", label: "Examples" },
  { href: "/shop", label: "Shop" },
  { href: "/dashboard", label: "Dashboard" },
];

const productLinks = [
  { href: "/products/aura-report", label: "Aura Report — ₹99" },
  { href: "/products/dating-audit", label: "Dating Audit — ₹299" },
  { href: "/products/glowup-plan", label: "Glow-Up Plan — ₹499" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-deep border-b border-white/[0.04]">
      <Container>
        <div className="flex h-[60px] items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-xs font-bold text-white shadow-[0_2px_12px_rgba(147,51,234,0.3)] transition-shadow group-hover:shadow-[0_4px_20px_rgba(147,51,234,0.4)]">
              A
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/15 to-transparent" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">AuraCheck</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-lg px-3 py-2 text-[13px] text-gray-400 transition-colors duration-200 hover:text-white hover:bg-white/[0.04]"
              >
                {link.label}
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                onBlur={() => setTimeout(() => setProductsOpen(false), 200)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] text-gray-400 transition-colors duration-200 hover:text-white hover:bg-white/[0.04]"
              >
                Products
                <svg className={`h-3 w-3 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {productsOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 overflow-hidden rounded-xl glass-elevated shadow-2xl shadow-black/40">
                  <div className="p-1.5">
                    {productLinks.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        onClick={() => setProductsOpen(false)}
                        className="block rounded-lg px-3.5 py-2.5 text-[13px] text-gray-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ml-2">
              <Link href="/audit/new">
                <Button size="sm">Start Aura Check</Button>
              </Link>
            </div>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-400 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.04] py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[13px] text-gray-400 transition-colors hover:text-white hover:bg-white/[0.04]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.04] mt-2 pt-3">
                <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wider text-gray-600">Products</p>
                {productLinks.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-[13px] text-gray-400 transition-colors hover:text-white hover:bg-white/[0.04]"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
              <Link href="/audit/new" onClick={() => setMobileOpen(false)} className="mt-2">
                <Button className="w-full" size="sm">
                  Start Aura Check
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
