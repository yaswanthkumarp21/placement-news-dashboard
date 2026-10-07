import { loadDailyTiles } from "@/lib/daily";
import { AUTH_DISABLED } from "@/lib/guest";
import { loadTiles } from "@/lib/tiles";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SavedGuest } from "./SavedGuest";

export const metadata = { title: "Saved" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const authOn = supabaseConfigured && !AUTH_DISABLED;
  // saved ids can point at a daily story (d123) or an archive story, so look in both
  const tiles = [...(await loadDailyTiles()), ...loadTiles()];
  return (
    <main className="pn-main">
      <div className="pn-h"><h2>Saved</h2><span className="pn-sub">{authOn ? "synced to your account when signed in" : "kept in this browser"}</span></div>
      <SavedGuest tiles={tiles} />
    </main>
  );
}
