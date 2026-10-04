import fs from "node:fs";
import path from "node:path";

export const metadata = { title: "Ind. Facts" };
export const dynamic = "force-dynamic";

type Fact = { label: string; value: string; period?: string };
type Industry = { id: string; name: string; source: string; pageUpdated: string | null; facts: Fact[] };

function load(): Industry[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "industry-facts.json"), "utf-8");
    return (JSON.parse(raw) as { industries: Industry[] }).industries;
  } catch {
    return [];
  }
}

export default function FactsPage() {
  const industries = load();
  return (
    <main className="pn-main">
      <div className="pn-h"><h2>Industry facts</h2><span className="pn-sub">numbers only</span></div>
      <p className="pn-note">Key numbers for the main industries, with the source page and when that page was last updated.</p>
      <div className="pn-facts">
        {industries.map((ind) => {
          const first = ind.facts[0];
          return (
            <div className="pn-fact" key={ind.id}>
              <b>{ind.name}</b>
              <div className="big">{first ? first.value : "—"}</div>
              <small>{first ? `${first.label}${first.period ? `, ${first.period}` : ""}` : "Figures coming soon"}</small>
              <small>Source page updated: {ind.pageUpdated ?? "not checked yet"}</small>
              <a href={ind.source} target="_blank" rel="noreferrer">View source</a>
            </div>
          );
        })}
      </div>
    </main>
  );
}
