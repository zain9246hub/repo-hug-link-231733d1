const mask = (v?: string) => {
  if (!v) return "❌ MISSING / undefined";
  if (v.length < 12) return v;
  return `${v.slice(0, 8)}…${v.slice(-6)} (len=${v.length})`;
};

export default function DebugEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const pub = (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  const mode = import.meta.env.MODE;
  const ok = Boolean(url && (anon || pub));

  return (
    <div className="min-h-screen p-6 font-mono text-sm bg-background text-foreground">
      <h1 className="text-xl font-bold mb-4">Build env diagnostic</h1>
      <p className="mb-4">
        Status:{" "}
        <span className={ok ? "text-green-600" : "text-red-600"}>
          {ok ? "✅ Supabase env vars embedded" : "❌ Missing env vars in this build"}
        </span>
      </p>
      <ul className="space-y-1">
        <li>MODE: {mode}</li>
        <li>VITE_SUPABASE_URL: {mask(url)}</li>
        <li>VITE_SUPABASE_ANON_KEY: {mask(anon)}</li>
        <li>VITE_SUPABASE_PUBLISHABLE_KEY: {mask(pub)}</li>
        <li>VITE_SUPABASE_PROJECT_ID: {projectId || "(not set)"}</li>
      </ul>
      {!ok && (
        <p className="mt-4 text-muted-foreground">
          If this shows ❌ on Vercel, the env vars are not in the Production scope or
          the deployment was served from build cache. Add them in Vercel → Settings →
          Environment Variables (Production), then Redeploy with “Use existing Build
          Cache” unchecked.
        </p>
      )}
    </div>
  );
}