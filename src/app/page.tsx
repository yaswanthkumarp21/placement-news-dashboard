import { guestCompanies } from "@/lib/guest";
import { loadTiles } from "@/lib/tiles";
import { DailyClient } from "./DailyClient";

export const metadata = { title: "Daily News" };
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="pn-main">
      <DailyClient tiles={loadTiles()} companies={guestCompanies()} today={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />
    </main>
  );
}
