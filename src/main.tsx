import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const rootEl = document.getElementById("root")!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:linear-gradient(180deg,#f8fafc,#eef2ff);">
      <div style="max-width:480px;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,.1);text-align:center;">
        <div style="width:56px;height:56px;border-radius:9999px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">⚠️</div>
        <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Configuration Error</h1>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.5;font-size:14px;">
          The app can't start because backend credentials are missing.
          If you're the site owner, add these environment variables to your hosting provider and redeploy:
        </p>
        <div style="text-align:left;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#111827;margin-bottom:16px;">
          VITE_SUPABASE_URL<br/>
          VITE_SUPABASE_PUBLISHABLE_KEY
        </div>
        <button onclick="location.reload()" style="background:#4f46e5;color:#fff;border:0;border-radius:8px;padding:10px 20px;font-size:14px;cursor:pointer;font-weight:500;">
          Retry
        </button>
      </div>
    </div>
  `;
} else {
  import('./App.tsx').then(({ default: App }) => {
    createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}
