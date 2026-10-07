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
      className="pn-primary"
      style={{ width: "100%" }}
    >
      {busy ? "Redirecting to Google..." : "Sign in with Google"}
    </button>
  );
}
