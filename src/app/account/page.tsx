import { guestCompanies } from "@/lib/guest";
import { AUTH_DISABLED } from "@/lib/guest";
import { supabaseConfigured } from "@/lib/supabase/env";
import { AccountBar } from "./AccountBar";
import { CompanyPicker } from "./CompanyPicker";

export const metadata = { title: "My companies" };
export const dynamic = "force-dynamic";

export default function AccountPage() {
  const authOn = supabaseConfigured && !AUTH_DISABLED;
  return (
    <main className="pn-main">
      <h1 className="pn-page-h">My companies</h1>
      {authOn ? <AccountBar /> : <p className="pn-note">Login is switched off, so your choices are kept in this browser only.</p>}
      <p className="pn-note">Every company is on by default. Tap the ones you don&apos;t want and they disappear from your dashboard.</p>
      <CompanyPicker userId={null} companies={guestCompanies()} initiallyOff={[]} />
    </main>
  );
}
