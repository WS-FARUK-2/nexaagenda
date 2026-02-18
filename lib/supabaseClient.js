import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Custom storage that works better on mobile
class HybridStorage {
    setItem(key, value) {
        try {
            if (typeof window !== "undefined") {
                // Try localStorage first
                try {
                    window.localStorage.setItem(key, value);
                } catch (e) {
                    console.warn(
                        "localStorage failed, using sessionStorage:",
                        e,
                    );
                    window.sessionStorage.setItem(key, value);
                }
            }
        } catch (e) {
            console.warn("Storage failed:", e);
        }
    }

    getItem(key) {
        try {
            if (typeof window !== "undefined") {
                // Check localStorage first, then sessionStorage
                const item = window.localStorage.getItem(key);
                if (item) return item;
                return window.sessionStorage.getItem(key);
            }
        } catch (e) {
            console.warn("Storage retrieval failed:", e);
        }
        return null;
    }

    removeItem(key) {
        try {
            if (typeof window !== "undefined") {
                window.localStorage.removeItem(key);
                window.sessionStorage.removeItem(key);
            }
        } catch (e) {
            console.warn("Storage removal failed:", e);
        }
    }
}

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
                          ? new HybridStorage()
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
