import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartCard } from "@/components/Charts";
import { hasRecap, loadIndustries, type Fact } from "@/lib/facts";

export const dynamic = "force-dynamic";

function FactRows({ items }: { items?: Fact[] }) {
  if (!items?.length) return <p className="pn-sub">Not available yet.</p>;
  return (
    <div className="pn-rows">
      {items.map((f, i) => (
        <div className="pn-row" key={i}>
          <div className="pn-row-v">{f.value}</div>
          <div className="pn-row-l">
            {f.label}
            {f.period ? <span> · {f.period}</span> : null}
          </div>
          {f.sourceUrl ? (
            <a className="pn-row-s" href={f.sourceUrl} target="_blank" rel="noreferrer">
              {f.sourceName ?? "Source"}
              {f.sourceDate ? `, ${f.sourceDate}` : ""}
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return <p className="pn-sub">Not available yet.</p>;
  return (
    <ul className="pn-plain">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

export default async function Recap({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ind = loadIndustries().find((i) => i.id === id);
  if (!ind || !hasRecap(ind)) notFound();

  const sections: { n: number; title: string; body: React.ReactNode }[] = [
    { n: 1, title: "What it is", body: <p className="pn-lead">{ind.overview}</p> },
    { n: 2, title: "Market size", body: <FactRows items={ind.marketSize} /> },
    { n: 3, title: "Growth and outlook", body: <FactRows items={ind.growth} /> },
    { n: 4, title: "Share of the economy and jobs", body: <FactRows items={ind.gdpJobs} /> },
    { n: 5, title: "Exports and trade", body: <FactRows items={ind.exportsFdi} /> },
    {
      n: 6,
      title: "Government policies",
      body: (
        <div className="pn-rows">
          {ind.policies?.map((p, i) => (
            <div className="pn-row" key={i}>
              <div className="pn-row-v">{p.name}</div>
              <div className="pn-row-l">{p.what}</div>
              {p.sourceUrl ? <a className="pn-row-s" href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceName ?? "Source"}{p.sourceDate ? `, ${p.sourceDate}` : ""}</a> : null}
            </div>
          ))}
        </div>
      ),
    },
    { n: 7, title: "Growth drivers", body: <List items={ind.drivers} /> },
    {
      n: 8,
      title: "Major players",
      body: (
        <>
          <p className="pn-lead">{ind.players?.structure}</p>
          <div className="pn-chips" style={{ flexWrap: "wrap", overflow: "visible" }}>
            {ind.players?.companies.map((c) => <span key={c} className="pn-chip">{c}</span>)}
          </div>
        </>
      ),
    },
    { n: 9, title: "Risks and challenges", body: <List items={ind.challenges} /> },
    { n: 10, title: "The Ops and supply chain angle", body: <List items={ind.opsAngle} /> },
  ];

  return (
    <main className="pn-main">
      <p><Link className="pn-sub" href="/facts">← All industries</Link></p>
      <h1 className="pn-page-h">{ind.name}</h1>
      <p className="pn-note">Ten-point recap · researched {ind.asOf} · official sources only</p>

      {ind.charts?.length ? (
        <section className="pn-sec">
          <h2><span>◔</span>The industry in charts</h2>
          <div className="pn-charts">
            {ind.charts.map((c) => <ChartCard key={c.id} c={c} />)}
          </div>
        </section>
      ) : null}

      {sections.map((s) => (
        <section className="pn-sec" key={s.n}>
          <h2><span>{String(s.n).padStart(2, "0")}</span>{s.title}</h2>
          {s.body}
        </section>
      ))}

      <section className="pn-sec feat">
        <h2><span>★</span>Numbers to quote</h2>
        <div className="pn-nums">
          {ind.interviewNumbers?.map((n, i) => (
            <div key={i}><b>{n.value}</b><small>{n.label}{n.period ? ` · ${n.period}` : ""}</small></div>
          ))}
        </div>
      </section>

      <section className="pn-sec">
        <h2><span>?</span>Likely GD questions</h2>
        <List items={ind.gdQuestions} />
      </section>

      {ind.conflicts?.length || ind.notFound?.length ? (
        <details className="pn-sec pn-caveats">
          <summary>Where sources disagree and what could not be verified</summary>
          {ind.conflicts?.length ? <><h3>Sources disagree</h3><List items={ind.conflicts} /></> : null}
          {ind.notFound?.length ? <><h3>Not shown (could not verify)</h3><List items={ind.notFound} /></> : null}
        </details>
      ) : null}
    </main>
  );
}
