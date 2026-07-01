import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "./env";

export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const url = getSupabaseUrl()!;
  const anonKey = getSupabaseAnonKey()!;
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that doesn't allow cookies to be set
        }
      },
    },
  });
}
