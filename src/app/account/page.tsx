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
      <main className="pn-main">
        <h1 className="pn-page-h">My companies</h1>
        <p className="pn-note">Guest mode: login is switched off, so your choices are kept in this browser only.</p>
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
    <main className="pn-main">
      <h1 className="pn-page-h">My companies</h1>
      <p className="pn-note">
        Signed in as {profile?.email ?? user.email}
        {profile?.is_admin ? " (admin)" : ""}
      </p>
      <div className="pn-actions">
        <Link className="pn-btn" href="/saved">Saved</Link>
        {profile?.is_admin ? <Link className="pn-btn" href="/manage/users">Manage users</Link> : null}
        <form action="/auth/signout" method="post">
          <button className="pn-btn" type="submit">Sign out</button>
        </form>
      </div>
      <p className="pn-note">Every company is on by default. Tap the ones you don&apos;t want and they disappear from your dashboard.</p>
      <CompanyPicker
        userId={user.id}
        companies={companies ?? []}
        initiallyOff={(off ?? []).map((r) => r.company_id)}
      />
    </main>
  );
}
