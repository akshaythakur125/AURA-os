"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const navLinks = [
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/examples", label: "Examples" },
  { href: "/challenges", label: "Challenges" },
  { href: "/progress", label: "Progress" },
  { href: "/shop", label: "Shop" },
  { href: "/pricing", label: "Pricing" },
  { href: "/install", label: "Install" },
  { href: "/privacy", label: "Privacy" },
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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-sm font-bold text-white">
              A
            </div>
            <span className="text-lg font-bold text-white">AuraCheck</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {/* Products dropdown */}
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
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl">
                  {productLinks.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setProductsOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {p.label}
                    </Link>
                  ))}
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
