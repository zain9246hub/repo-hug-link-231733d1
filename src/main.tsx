import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const rootEl = document.getElementById("root")!;

const renderBootError = (title: string, message: string, details?: string) => {
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:linear-gradient(180deg,#f8fafc,#eef2ff);">
      <div style="max-width:560px;width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,.1);text-align:center;">
        <div style="width:56px;height:56px;border-radius:9999px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">⚠️</div>
        <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">${title}</h1>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.5;font-size:14px;">${message}</p>
        ${details ? `<pre style="text-align:left;white-space:pre-wrap;word-break:break-word;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#111827;margin-bottom:16px;">${details}</pre>` : ''}
        <button onclick="location.reload()" style="background:#4f46e5;color:#fff;border:0;border-radius:8px;padding:10px 20px;font-size:14px;cursor:pointer;font-weight:500;">
          Retry
        </button>
      </div>
    </div>
  `;
};

console.log("BOOT ENV:", SUPABASE_URL, SUPABASE_KEY);

window.addEventListener("error", (event) => {
  console.error("BOOT WINDOW ERROR:", event.error || event.message);
  renderBootError(
    "Runtime Error",
    "The app crashed during startup.",
    String(event.error?.stack || event.error?.message || event.message || "Unknown error")
  );
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("BOOT UNHANDLED REJECTION:", event.reason);
  renderBootError(
    "Startup Promise Rejection",
    "An async startup task failed before the app could render.",
    String(event.reason?.stack || event.reason?.message || event.reason || "Unknown promise rejection")
  );
});

const unregisterServiceWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log("SERVICE WORKER REGISTRATIONS:", registrations.length);
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if (registrations.length > 0) {
      console.warn("Service workers were unregistered to rule out stale-cache issues.");
    }
  } catch (error) {
    console.error("SERVICE WORKER UNREGISTER FAILED:", error);
  }
};

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
  renderBootError(
    "Configuration Error",
    "The app can't start because backend credentials are missing. Add these environment variables to your hosting provider and redeploy.",
    "VITE_SUPABASE_URL\nVITE_SUPABASE_PUBLISHABLE_KEY"
  );
} else {
  unregisterServiceWorkers().finally(() => {
    import('./App.tsx')
      .then(({ default: App }) => {
        createRoot(rootEl).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      })
      .catch((error) => {
        console.error("APP IMPORT FAILED:", error);
        renderBootError(
          "App Load Failed",
          "The app bundle failed during startup.",
          String(error?.stack || error?.message || error || "Unknown import error")
        );
      });
  });
}
