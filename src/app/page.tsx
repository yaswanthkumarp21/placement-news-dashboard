import { loadDailyTiles } from "@/lib/daily";
import { guestCompanies } from "@/lib/guest";
import { loadTiles } from "@/lib/tiles";
import { DailyClient } from "./DailyClient";

export const metadata = { title: "Daily News" };
export const dynamic = "force-dynamic";

export default async function Home() {
  // real daily stories once the daily job has stored some; until then the research archive stands in
  const daily = await loadDailyTiles();
  return (
    <main className="pn-main">
      <DailyClient
        tiles={daily.length ? daily : loadTiles()}
        demo={!daily.length}
        companies={guestCompanies()}
        today={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
      />
    </main>
  );
}
