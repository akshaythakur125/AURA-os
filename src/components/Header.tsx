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
    <header className="sticky top-0 z-50 glass-deep border-b border-white/5">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-shadow group-hover:shadow-purple-500/50">
              A
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <span className="text-lg font-bold text-white">AuraCheck</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                onBlur={() => setTimeout(() => setProductsOpen(false), 200)}
                className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
              >
                Products
                <svg className={`h-3 w-3 transition-transform ${productsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {productsOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl glass-card shadow-2xl shadow-black/50">
                  <div className="p-1.5">
                    {productLinks.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        onClick={() => setProductsOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/audit/new">
              <Button size="sm">Start Aura Check</Button>
            </Link>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-400 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/5 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/5 pt-4">
                <p className="mb-2 text-xs text-gray-600">Products</p>
                {productLinks.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
              <Link href="/audit/new" onClick={() => setMobileOpen(false)}>
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
