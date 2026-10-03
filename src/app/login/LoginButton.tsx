"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LoginButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setBusy(false);
  }
  return (
    <button
      onClick={go}
      disabled={busy}
      style={{ padding: "12px 20px", fontSize: 16, borderRadius: 8, border: "1px solid #8886", cursor: "pointer", width: "100%" }}
    >
      {busy ? "Redirecting to Google..." : "Sign in with Google"}
    </button>
  );
}
