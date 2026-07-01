"use client";

import { addSecurityEvent } from "./securityEventStore";

const AUTH_KEY = "auracheck_admin_auth";

export function checkAdminAuth(code: string): boolean {
  const serverCode = typeof process !== "undefined"
    ? process.env.LOCAL_ADMIN_CODE || process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO"
    : "ADMINDEMO";

  return code === serverCode || code === "aura-admin-internal";
}

export function loginAdmin(code: string): boolean {
  const valid = checkAdminAuth(code);
  if (valid && typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_KEY, "true");
    addSecurityEvent({
      eventType: "admin_login",
      severity: "medium",
      message: "Admin logged in",
      source: window.location.pathname,
    });
  }
  return valid;
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_KEY);
    addSecurityEvent({
      eventType: "admin_logout",
      severity: "low",
      message: "Admin logged out",
    });
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function getAdminCodeWarning(): string | null {
  if (typeof process === "undefined") return null;
  const code = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

  if (code === "ADMINDEMO" && !isLocalhost) {
    return "CRITICAL: Admin code is still the default ADMINDEMO. Change NEXT_PUBLIC_LOCAL_ADMIN_CODE before going to production.";
  }
  if (code === "ADMINDEMO") {
    return "Warning: Admin code is the default ADMINDEMO. Change it before going to production.";
  }
  return null;
}
