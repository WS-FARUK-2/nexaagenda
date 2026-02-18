import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Custom storage that only works on client side
let hybridStorage = null;

if (typeof window !== "undefined") {
    hybridStorage = {
        setItem(key, value) {
            try {
                try {
                    window.localStorage.setItem(key, value);
                } catch (e) {
                    console.warn(
                        "localStorage failed, using sessionStorage:",
                        e,
                    );
                    window.sessionStorage.setItem(key, value);
                }
            } catch (e) {
                console.warn("Storage failed:", e);
            }
        },

        getItem(key) {
            try {
                const item = window.localStorage.getItem(key);
                if (item) return item;
                return window.sessionStorage.getItem(key);
            } catch (e) {
                console.warn("Storage retrieval failed:", e);
            }
            return null;
        },

        removeItem(key) {
            try {
                window.localStorage.removeItem(key);
                window.sessionStorage.removeItem(key);
            } catch (e) {
                console.warn("Storage removal failed:", e);
            }
        },
    };
}

// Initialize the client only if env vars are present to avoid crash in preview if not set
export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                  persistSession: true,
                  autoRefreshToken: true,
                  detectSessionInUrl: true,
                  storage: hybridStorage || undefined,
              },
              global: {
                  headers: {
                      "x-client-info": "@supabase/auth-helpers-nextjs",
                  },
              },
          })
        : null;
