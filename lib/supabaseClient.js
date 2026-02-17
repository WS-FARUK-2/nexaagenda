import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize the client only if env vars are present to avoid crash in preview if not set
export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                  persistSession: true,
                  autoRefreshToken: true,
                  detectSessionInUrl: true,
                  storage:
                      typeof window !== "undefined"
                          ? window.localStorage
                          : undefined,
              },
              global: {
                  headers: {
                      "x-client-info": "@supabase/auth-helpers-nextjs",
                  },
                  // Otimizar timeout para conexões lentas
                  fetch: (url, options = {}) => {
                      return fetch(url, {
                          ...options,
                          timeout: 10000, // 10 segundos de timeout
                      }).catch((err) => {
                          console.warn("Fetch timeout:", err);
                          throw err;
                      });
                  },
              },
              // Otimizar realtime para mobile
              realtime: {
                  params: {
                      eventsPerSecond: 5,
                  },
                  timeout: 30000,
              },
          })
        : null;
