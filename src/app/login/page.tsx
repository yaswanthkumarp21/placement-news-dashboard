import { redirect } from "next/navigation";
import { AUTH_DISABLED } from "@/lib/guest";
import { supabaseConfigured } from "@/lib/supabase/env";
import { currentUser } from "@/lib/supabase/server";
import { LoginButton } from "./LoginButton";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  if (AUTH_DISABLED) redirect("/account");
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (supabaseConfigured) {
    const { user } = await currentUser();
    if (user) redirect(safeNext);
  }
  return (
    <main className="pn-main" style={{ maxWidth: 420, textAlign: "center", paddingTop: 48 }}>
      <h1 style={{ marginBottom: 8 }}>OpsPulse</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        Sign in to keep your saved stories and company picks on every device. You can also browse without an account; your picks then stay in this browser.
      </p>
      {!supabaseConfigured ? (
        <p>Sign-in is not configured yet (missing Supabase settings).</p>
      ) : (
        <LoginButton next={safeNext} />
      )}
      {error ? <p className="pn-err">Sign-in did not complete. Please try again.</p> : null}
      <p className="pn-note" style={{ marginTop: 32 }}>
        We only receive your name and email. <a href="https://github.com/yaswanthkumarp21/placement-news-dashboard/blob/main/PRIVACY.md">Privacy</a>
      </p>
    </main>
  );
}
