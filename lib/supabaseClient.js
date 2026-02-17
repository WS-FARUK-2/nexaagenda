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
              },
              global: {
                  headers: {
                      "x-client-info": "@supabase/auth-helpers-nextjs",
                  },
              },
              // Melhorar timeout para mobile
              realtime: {
                  params: {
                      eventsPerSecond: 10,
                  },
              },
          })
        : null;
