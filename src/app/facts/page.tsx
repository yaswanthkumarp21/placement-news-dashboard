import Link from "next/link";
import { hasRecap, loadIndustries } from "@/lib/facts";

export const metadata = { title: "Ind. Facts" };
export const dynamic = "force-dynamic";

const ACCENTS = ["#ffd60a", "#ff5fa2", "#5be3a4", "#ffe97a", "#ff93c1", "#b4f3d3"];

export default function FactsPage() {
  const industries = loadIndustries();
  return (
    <main className="pn-main">
      <h1 className="pn-page-h">Industry facts</h1>
      <p className="pn-note">A ten-point recap for each industry, built from official sources. Every number shows its period and a link to where it came from.</p>
      <div className="pn-facts">
        {industries.map((ind, i) => {
          const ready = hasRecap(ind);
          const head = ind.interviewNumbers?.[0];
          return (
            <div className="pn-fact" key={ind.id} style={{ ["--fc" as string]: ACCENTS[i % ACCENTS.length] }}>
              {ready ? <span className="pn-pill">10-point recap</span> : <span className="pn-pill">Coming soon</span>}
              <b>{ind.name}</b>
              <div className="big">{head ? head.value : "—"}</div>
              <small>{head ? `${head.label}${head.period ? `, ${head.period}` : ""}` : "Recap is being researched"}</small>
              <small>{ind.asOf ? `Researched ${ind.asOf}` : ""}</small>
              {ready ? <Link href={`/facts/${ind.id}`}>Open recap →</Link> : null}
            </div>
          );
        })}
      </div>
    </main>
  );
}
