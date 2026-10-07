"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { KEYS } from "@/lib/local";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Header link: "Sign in" for guests, "Sign out" when signed in. Signing out clears this browser's saved copy so the next person starts clean. */
export function AuthMenu() {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  useEffect(() => {
    const db = supabaseBrowser();
    db.auth.getUser().then(({ data }) => setState(data.user ? "in" : "out"));
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => setState(s?.user ? "in" : "out"));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (state === "loading") return null;
  if (state === "out") return <Link className="pn-navlink" href="/login">Sign in</Link>;
  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={() => {
        try {
          for (const k of [KEYS.saved, KEYS.off, KEYS.onboarded]) localStorage.removeItem(k);
        } catch {}
      }}
    >
      <button className="pn-navlink" type="submit">Sign out</button>
    </form>
  );
}
