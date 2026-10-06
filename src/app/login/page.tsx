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
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (supabaseConfigured) {
    const { user } = await currentUser();
    if (user) redirect(safeNext);
  }
  return (
    <main style={{ maxWidth: 420, margin: "64px auto", padding: "0 16px", textAlign: "center" }}>
      <h1 style={{ marginBottom: 8 }}>OpsPulse</h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        News that matters for your interviews and GDs. Sign in to pick your companies and save stories.
      </p>
      {!supabaseConfigured ? (
        <p>Sign-in is not configured yet (missing Supabase settings).</p>
      ) : (
        <LoginButton next={safeNext} />
      )}
      {error ? <p style={{ color: "#c33", marginTop: 16 }}>Sign-in did not complete. Please try again.</p> : null}
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: 32 }}>
        We only receive your name and email. <a href="https://github.com/yaswanthkumarp21/placement-news-dashboard/blob/main/PRIVACY.md">Privacy</a>
      </p>
    </main>
  );
}
