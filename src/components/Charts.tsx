import type { Chart } from "@/lib/facts";

const COLORS = ["var(--yellow)", "var(--pink)", "var(--green)", "var(--yellow-soft)", "var(--pink-soft)", "var(--green-soft)"];

const fmt = (n: number) => (Math.abs(n) >= 100 ? Math.round(n).toLocaleString("en-IN") : Number(n.toFixed(2)).toString());

/** Horizontal bars: compare a few categories at a glance. Plain HTML so labels wrap on small phones. */
function Bars({ c }: { c: Chart }) {
  const max = Math.max(...c.items.map((i) => i.value), 1);
  return (
    <div className="pn-bars" role="img" aria-label={`${c.title}. ${c.items.map((i) => `${i.label} ${fmt(i.value)}`).join(", ")}`}>
      {c.items.map((it, i) => (
        <div className="pn-bar-row" key={it.label}>
          <div className="pn-bar-top">
            <span>{it.label}</span>
            <b>
              {fmt(it.value)} <small>{c.unit}</small>
              {it.note ? <em>{it.note}</em> : null}
            </b>
          </div>
          <div className="pn-bar-track">
            <div className="pn-bar-fill" style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: COLORS[i % COLORS.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Vertical columns for a short series (for example three years). Inline SVG. */
function Columns({ c }: { c: Chart }) {
  const W = 320, H = 170, padB = 34, padT = 22;
  const max = Math.max(...c.items.map((i) => i.value), 1);
  const n = c.items.length;
  const slot = W / n;
  const bw = Math.min(64, slot * 0.58);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pn-cols" role="img" aria-label={`${c.title}. ${c.items.map((i) => `${i.label} ${fmt(i.value)}${c.unit ?? ""}`).join(", ")}`}>
      <line x1="0" x2={W} y1={H - padB} y2={H - padB} stroke="var(--line)" />
      {c.items.map((it, i) => {
        const h = Math.max(3, ((H - padB - padT) * it.value) / max);
        const x = i * slot + (slot - bw) / 2;
        return (
          <g key={it.label}>
            <rect x={x} y={H - padB - h} width={bw} height={h} rx="8" fill={COLORS[i % COLORS.length]} />
            <text x={x + bw / 2} y={H - padB - h - 7} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ink)">
              {fmt(it.value)}
              {c.unit}
            </text>
            <text x={x + bw / 2} y={H - 12} textAnchor="middle" fontSize="11.5" fill="var(--dim)">{it.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Progress bars: achieved versus target. The percentage is computed, not typed in. */
function Progress({ c }: { c: Chart }) {
  return (
    <div className="pn-prog">
      {c.items.map((it, i) => {
        const pct = it.target ? Math.min(100, (it.value / it.target) * 100) : 0;
        return (
          <div className="pn-bar-row" key={it.label}>
            <div className="pn-bar-top">
              <span>{it.label}</span>
              <b>
                {fmt(it.value)} / {it.target ? fmt(it.target) : "?"}
                <em>{pct < 10 ? pct.toFixed(1) : Math.round(pct)}%</em>
              </b>
            </div>
            <div className="pn-bar-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={it.label}>
              <div className="pn-bar-fill" style={{ width: `${Math.max(1.5, pct)}%`, background: COLORS[(i + 1) % COLORS.length] }} />
            </div>
            {it.note ? <div className="pn-bar-note">{it.note}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function ChartCard({ c }: { c: Chart }) {
  return (
    <figure className="pn-chart">
      <figcaption>
        <b>{c.title}</b>
        {c.subtitle ? <span>{c.subtitle}</span> : null}
      </figcaption>
      {c.kind === "columns" ? <Columns c={c} /> : c.kind === "progress" ? <Progress c={c} /> : <Bars c={c} />}
      {c.sourceUrl ? (
        <a className="pn-chart-src" href={c.sourceUrl} target="_blank" rel="noreferrer">
          Source: {c.sourceName ?? "link"}
          {c.sourceDate ? `, ${c.sourceDate}` : ""}
        </a>
      ) : null}
    </figure>
  );
}
