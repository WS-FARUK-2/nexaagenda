import React from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout.js';
import Home from './app/page.js';

// Polyfill process.env for the browser preview environment
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ''
    }
  };
}

const root = createRoot(document.getElementById('root')!);

const AppLayout = RootLayout as any;

// Simulating the Next.js App Router structure in the preview
root.render(
  <React.StrictMode>
    <AppLayout>
      <Home />
    </AppLayout>
  </React.StrictMode>
);