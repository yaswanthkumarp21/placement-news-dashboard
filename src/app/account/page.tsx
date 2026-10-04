import Link from "next/link";
import { redirect } from "next/navigation";
import { AUTH_DISABLED, guestCompanies } from "@/lib/guest";
import { currentProfile } from "@/lib/supabase/server";
import { CompanyPicker } from "./CompanyPicker";

export const metadata = { title: "My companies" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (AUTH_DISABLED) {
    return (
      <main style={{ maxWidth: 820, margin: "24px auto", padding: "0 16px" }}>
        <h1 style={{ margin: 0 }}>My companies</h1>
        <p style={{ opacity: 0.7, margin: "4px 0 16px" }}>
          Guest mode: login is switched off, so your choices are kept in this browser only.
        </p>
        <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link href="/saved">Saved</Link>
        </nav>
        <CompanyPicker userId={null} companies={guestCompanies()} initiallyOff={[]} />
      </main>
    );
  }
  const { supabase, user, profile } = await currentProfile();
  if (!user) redirect("/login?next=/account");

  const [{ data: companies }, { data: off }] = await Promise.all([
    supabase.from("companies").select("id,name,industry").order("name"),
    supabase.from("user_deselected_companies").select("company_id").eq("user_id", user.id),
  ]);

  return (
    <main style={{ maxWidth: 820, margin: "24px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ margin: 0 }}>My companies</h1>
          <p style={{ opacity: 0.7, margin: "4px 0 0" }}>
            Signed in as {profile?.email ?? user.email}
            {profile?.is_admin ? " (admin)" : ""}
          </p>
        </div>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/saved">Saved</Link>
          {profile?.is_admin ? <Link href="/manage/users">Manage users</Link> : null}
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ cursor: "pointer" }}>Sign out</button>
          </form>
        </nav>
      </header>
      <p style={{ margin: "16px 0" }}>
        Every company is on by default. Untick the ones you don&apos;t want and they disappear from your dashboard.
      </p>
      <CompanyPicker
        userId={user.id}
        companies={companies ?? []}
        initiallyOff={(off ?? []).map((r) => r.company_id)}
      />
    </main>
  );
}
