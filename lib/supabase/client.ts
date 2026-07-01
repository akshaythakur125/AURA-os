"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "./env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;
  const url = getSupabaseUrl()!;
  const anonKey = getSupabaseAnonKey()!;
  client = createBrowserClient(url, anonKey);
  return client;
}
