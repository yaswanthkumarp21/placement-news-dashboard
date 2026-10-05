import type { Industry } from "@/lib/facts";

const ACC = ["var(--yellow)", "var(--pink)", "var(--green)", "var(--yellow-soft)"];

/** Quick-jump pills so a student can hop between the ten points. */
export function JumpBar({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="pn-jump" aria-label="Jump to a section">
      {items.map((s) => (
        <a key={s.id} href={`#${s.id}`}>{s.label}</a>
      ))}
    </nav>
  );
}

/** The one-sentence big idea plus the numbers to remember, in tiles. */
export function Glance({ ind }: { ind: Industry }) {
  const nums = ind.interviewNumbers?.slice(0, 4) ?? [];
  return (
    <section className="pn-glance" id="glance">
      <p className="pn-kicker">The big idea</p>
      <p className="pn-big">{ind.bigIdea ?? ind.overview}</p>
      {nums.length ? (
        <div className="pn-kpis">
          {nums.map((n, i) => (
            <div className="pn-kpi" key={i} style={{ ["--kc" as string]: ACC[i % ACC.length] }}>
              <b>{n.value}</b>
              <span>{n.label}</span>
              {n.period ? <small>{n.period}</small> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/** How the industry works, as numbered steps with one number each. */
export function ValueChain({ steps }: { steps: NonNullable<Industry["flow"]> }) {
  return (
    <ol className="pn-flow">
      {steps.map((s, i) => (
        <li key={i} style={{ ["--kc" as string]: ACC[i % ACC.length] }}>
          <span className="pn-flow-n">{i + 1}</span>
          <div>
            <b>{s.label}</b>
            <strong>{s.stat}</strong>
            <small>{s.note}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Dated events, oldest first. Future deadlines are drawn in pink. */
export function Timeline({ items }: { items: NonNullable<Industry["timeline"]> }) {
  return (
    <ul className="pn-tl">
      {items.map((t, i) => (
        <li key={i} className={t.future ? "future" : ""}>
          <time>{t.date}{t.future ? " · deadline" : ""}</time>
          <b>{t.title}</b>
          <span>{t.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/** Two lists side by side (for example growth drivers against risks). */
export function VersusPanel({ left, right }: { left: { title: string; items: string[] }; right: { title: string; items: string[] } }) {
  return (
    <div className="pn-vs">
      <div className="pn-vs-col up">
        <h3>▲ {left.title}</h3>
        <ul>{left.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
      <div className="pn-vs-col down">
        <h3>▼ {right.title}</h3>
        <ul>{right.items.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
    </div>
  );
}

/** Interview lines to say out loud, drawn as speech bubbles. */
export function SayCards({ lines }: { lines: string[] }) {
  return (
    <div className="pn-say">
      {lines.map((l, i) => (
        <div className="pn-bubble" key={i} style={{ ["--kc" as string]: ACC[i % 3] }}>
          <small>Say it #{i + 1}</small>
          <p>“{l}”</p>
        </div>
      ))}
    </div>
  );
}
