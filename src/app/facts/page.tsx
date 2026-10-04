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

const ACCENTS = ["#ffd60a", "#ff5fa2", "#5be3a4", "#ffe97a", "#ff93c1", "#b4f3d3"];

export default function FactsPage() {
  const industries = load();
  return (
    <main className="pn-main">
      <h1 className="pn-page-h">Industry facts</h1>
      <p className="pn-note">Key numbers for the main industries, each with its source page and when that page was last updated.</p>
      <div className="pn-facts">
        {industries.map((ind, i) => {
          const first = ind.facts[0];
          return (
            <div className="pn-fact" key={ind.id} style={{ ["--fc" as string]: ACCENTS[i % ACCENTS.length] }}>
              {first ? null : <span className="pn-pill">Coming soon</span>}
              <b>{ind.name}</b>
              <div className="big">{first ? first.value : "—"}</div>
              <small>{first ? `${first.label}${first.period ? `, ${first.period}` : ""}` : "Numbers appear here once the source is cleared"}</small>
              <small>Source page updated: {ind.pageUpdated ?? "not checked yet"}</small>
              <a href={ind.source} target="_blank" rel="noreferrer">View source</a>
            </div>
          );
        })}
      </div>
    </main>
  );
}
