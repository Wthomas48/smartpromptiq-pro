import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnon) {
  console.error("Supabase env missing in production:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnon,
  });
}

export const supabase = createClient(supabaseUrl!, supabaseAnon!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
