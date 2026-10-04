import Link from "next/link";
import { TileCard } from "@/components/TileCard";
import { MdBlock } from "@/components/MdInline";
import { loadArchive } from "@/lib/archive";
import { loadTiles } from "@/lib/tiles";

export const metadata = { title: "Year News" };
export const dynamic = "force-dynamic";

type SP = { company?: string; month?: string; q?: string };
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short" });

export default async function YearNews({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const docs = loadArchive();
  const all = loadTiles().sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.score - a.score);
  const q = (sp.q ?? "").trim().toLowerCase();

  const counts = new Map<string, number>();
  for (const t of all) counts.set(t.slug, (counts.get(t.slug) ?? 0) + 1);
  const months = [...new Set(all.map((t) => t.date?.slice(0, 7)).filter(Boolean) as string[])].sort();

  const shown = all
    .filter((t) => !sp.company || t.slug === sp.company)
    .filter((t) => !sp.month || t.date?.startsWith(sp.month))
    .filter((t) => !q || `${t.headline} ${t.co} ${t.bullets.join(" ")}`.toLowerCase().includes(q));

  const href = (over: Partial<SP>) => {
    const p = new URLSearchParams();
    const m = { ...sp, ...over };
    for (const [k, v] of Object.entries(m)) if (v) p.set(k, v);
    const s = p.toString();
    return `/year-news${s ? `?${s}` : ""}`;
  };
  const doc = sp.company ? docs.find((d) => d.slug === sp.company) : undefined;
  const sec = (name: string) => doc?.sections[Object.keys(doc.sections).find((k) => k.toLowerCase().startsWith(name)) ?? ""];

  return (
    <main className="pn-main">
      <form method="get" action="/year-news">
        {sp.company ? <input type="hidden" name="company" value={sp.company} /> : null}
        {sp.month ? <input type="hidden" name="month" value={sp.month} /> : null}
        <input className="pn-search" name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Search all stories" aria-label="Search all stories" />
      </form>

      <div className="pn-chips" style={{ marginTop: 10 }}>
        <Link className={`pn-chip${!sp.company ? " on" : ""}`} href={href({ company: undefined })}>All companies</Link>
        {docs.map((d) => (
          <Link key={d.slug} className={`pn-chip${sp.company === d.slug ? " on" : ""}`} href={href({ company: d.slug })}>
            {d.name} {counts.get(d.slug) ?? 0}
          </Link>
        ))}
      </div>
      <div className="pn-chips">
        <Link className={`pn-chip${!sp.month ? " on" : ""}`} href={href({ month: undefined })}>All year</Link>
        {months.map((m) => (
          <Link key={m} className={`pn-chip${sp.month === m ? " on" : ""}`} href={href({ month: m })}>{monthLabel(m)}</Link>
        ))}
      </div>

      {doc ? (
        <section className="pn-panel">
          <h3>{doc.name} · top talking points</h3>
          {sec("top") ? <MdBlock lines={sec("top")!} /> : <p className="pn-sub">None yet.</p>}
          {sec("likely") ? (
            <>
              <h3>Likely interview questions</h3>
              <MdBlock lines={sec("likely")!} />
            </>
          ) : null}
        </section>
      ) : null}

      <div className="pn-h"><h2>Year news</h2><span className="pn-sub">{shown.length} stories</span></div>
      <div className="pn-list">
        {shown.map((t) => <TileCard key={t.id} t={t} showTheme />)}
        {!shown.length ? <div className="pn-empty">No stories match.</div> : null}
      </div>
    </main>
  );
}
