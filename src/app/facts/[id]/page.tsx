import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartCard } from "@/components/Charts";
import { Flashcards } from "@/components/Flashcards";
import { Glance, JumpBar, SayCards, Timeline, ValueChain, VersusPanel } from "@/components/RecapParts";
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

function Sec({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="pn-sec" id={id}>
      <h2><span>{icon}</span>{title}</h2>
      {children}
    </section>
  );
}

export default async function Recap({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ind = loadIndustries().find((i) => i.id === id);
  if (!ind || !hasRecap(ind)) notFound();

  const jump = [
    { id: "glance", label: "Big idea" },
    ...(ind.flow?.length ? [{ id: "how", label: "How it works" }] : []),
    ...(ind.charts?.length ? [{ id: "charts", label: "Charts" }] : []),
    ...(ind.timeline?.length ? [{ id: "timeline", label: "Timeline" }] : []),
    { id: "numbers", label: "Numbers" },
    { id: "policies", label: "Policies" },
    { id: "versus", label: "Drivers vs risks" },
    { id: "players", label: "Players" },
    { id: "ops", label: "Ops angle" },
    { id: "quiz", label: "Test yourself" },
  ];

  const cards = (ind.interviewNumbers ?? []).map((n) => ({ q: n.label, sub: n.period, a: n.value }));

  return (
    <main className="pn-main">
      <p><Link className="pn-sub" href="/facts">← All industries</Link></p>
      <h1 className="pn-page-h">{ind.name}</h1>
      <p className="pn-note">A study page you can finish in five minutes · researched {ind.asOf} · official sources only</p>

      <JumpBar items={jump} />
      <Glance ind={ind} />

      <Sec id="what" icon="🧭" title="What it is">
        <p className="pn-lead">{ind.overview}</p>
      </Sec>

      {ind.flow?.length ? (
        <Sec id="how" icon="⚙️" title="How it works, in four steps">
          <ValueChain steps={ind.flow} />
        </Sec>
      ) : null}

      {ind.charts?.length ? (
        <Sec id="charts" icon="📊" title="The industry in charts">
          <div className="pn-charts">
            {ind.charts.map((c) => <ChartCard key={c.id} c={c} />)}
          </div>
        </Sec>
      ) : null}

      {ind.timeline?.length ? (
        <Sec id="timeline" icon="🗓️" title="Timeline: what happened and what is coming">
          <Timeline items={ind.timeline} />
        </Sec>
      ) : null}

      <Sec id="numbers" icon="🔢" title="Key numbers">
        <h3 className="pn-mini-h">Market size</h3>
        <FactRows items={ind.marketSize} />
        <h3 className="pn-mini-h">Growth and outlook</h3>
        <FactRows items={ind.growth} />
        <h3 className="pn-mini-h">Share of the economy and jobs</h3>
        <FactRows items={ind.gdpJobs} />
        <h3 className="pn-mini-h">Exports and trade</h3>
        <FactRows items={ind.exportsFdi} />
      </Sec>

      <Sec id="policies" icon="🏛️" title="Government policies">
        <div className="pn-rows">
          {ind.policies?.map((p, i) => (
            <div className="pn-row" key={i}>
              <div className="pn-row-v">{p.name}</div>
              <div className="pn-row-l">{p.what}</div>
              {p.sourceUrl ? <a className="pn-row-s" href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceName ?? "Source"}{p.sourceDate ? `, ${p.sourceDate}` : ""}</a> : null}
            </div>
          ))}
        </div>
      </Sec>

      <Sec id="versus" icon="⚖️" title="What pushes it up, what holds it back">
        <VersusPanel left={{ title: "Growth drivers", items: ind.drivers ?? [] }} right={{ title: "Risks", items: ind.challenges ?? [] }} />
      </Sec>

      <Sec id="players" icon="🏭" title="Major players">
        <p className="pn-lead">{ind.players?.structure}</p>
        <div className="pn-chips" style={{ flexWrap: "wrap", overflow: "visible" }}>
          {ind.players?.companies.map((c) => <span key={c} className="pn-chip">{c}</span>)}
        </div>
      </Sec>

      <Sec id="ops" icon="🎤" title="Say it in your interview: the Ops angle">
        <SayCards lines={ind.opsAngle ?? []} />
      </Sec>

      <Sec id="quiz" icon="🧠" title="Test yourself">
        <Flashcards cards={cards} />
        <h3 className="pn-mini-h">Practise these out loud (GD questions)</h3>
        <ol className="pn-gdq">
          {ind.gdQuestions?.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </Sec>

      {ind.conflicts?.length || ind.notFound?.length ? (
        <details className="pn-sec pn-caveats">
          <summary>Where sources disagree and what could not be verified</summary>
          {ind.conflicts?.length ? <><h3>Sources disagree</h3><ul className="pn-plain">{ind.conflicts.map((x, i) => <li key={i}>{x}</li>)}</ul></> : null}
          {ind.notFound?.length ? <><h3>Not shown (could not verify)</h3><ul className="pn-plain">{ind.notFound.map((x, i) => <li key={i}>{x}</li>)}</ul></> : null}
        </details>
      ) : null}
    </main>
  );
}
