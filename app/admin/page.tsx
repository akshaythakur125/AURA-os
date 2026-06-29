"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("auracheck_admin_auth") === "true";
  });
  const [codeInput, setCodeInput] = useState("");

  function handleLogin() {
    const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
    if (codeInput === adminCode) {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm">
          <Card>
            <h1 className="mb-4 text-xl font-bold text-white">Admin Access</h1>
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter admin code"
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400"
            >
              Login
            </button>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Admin Panel</h1>
      <Card>
        <p className="text-gray-400">Admin dashboard — orders, analytics, and management will appear here.</p>
      </Card>
    </Container>
  );
}
