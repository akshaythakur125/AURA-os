"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/examples", label: "Examples" },
  { href: "/twin-simulator", label: "Aura Twin" },
  { href: "/shop", label: "Shop" },
  { href: "/challenges", label: "Challenges" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <Container className="glass-panel glow-frame rounded-[26px] px-4 sm:px-6">
        <div className="flex h-18 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="scene-3d shine-sweep relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(145deg,rgba(125,211,252,0.95),rgba(59,130,246,0.78),rgba(249,115,22,0.7))] text-sm font-black text-slate-950 shadow-[0_16px_40px_rgba(56,189,248,0.25)]">
              <span className="relative z-10 display-font text-base">A</span>
              <div className="pulse-glow absolute inset-1 rounded-[14px] border border-white/25" />
              <div className="orbital-ring" />
            </div>
            <div>
              <div className="display-font text-lg font-bold text-white sm:text-xl">AuraCheck</div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                Image Signal Engine
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/65 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/pricing">View Plans</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/audit/new">Start Aura Check</Link>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 pb-5 pt-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-white/6 bg-white/4 px-4 py-3 text-sm text-white/75"
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button asChild className="w-full" variant="secondary" size="sm">
                  <Link href="/pricing" onClick={() => setMobileOpen(false)}>View Plans</Link>
                </Button>
                <Button asChild className="w-full" size="sm">
                  <Link href="/audit/new" onClick={() => setMobileOpen(false)}>Start</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
