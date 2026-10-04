import Link from "next/link";
import { loadArchive, type ArchiveEntry } from "@/lib/archive";
import { MdBlock, MdInline } from "@/components/MdInline";

export const metadata = { title: "Year Archive" };
export const dynamic = "force-dynamic";

const PALETTE = ["#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#60a5fa", "#fb923c", "#2dd4bf", "#f472b6"];
function themeColor(theme: string) {
  let h = 0;
  for (const ch of theme) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

type SP = { company?: string; theme?: string; month?: string; q?: string };

export default async function YearArchive({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const docs = loadArchive();
  const all: ArchiveEntry[] = docs.flatMap((d) => d.entries);

  const themes = [...new Set(all.map((e) => e.theme))].sort();
  const months = [...new Set(all.map((e) => e.date?.slice(0, 7)).filter(Boolean) as string[])].sort();
  const q = (sp.q ?? "").trim().toLowerCase();

  const shown = all
    .filter((e) => !sp.company || e.slug === sp.company)
    .filter((e) => !sp.theme || e.theme === sp.theme)
    .filter((e) => !sp.month || (sp.month === "undated" ? !e.date : e.date?.startsWith(sp.month)))
    .filter((e) => !q || `${e.headline} ${e.recap} ${e.why} ${e.company}`.toLowerCase().includes(q))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const company = sp.company ? docs.find((d) => d.slug === sp.company) : undefined;
  const sec = (name: string) => company?.sections[Object.keys(company.sections).find((k) => k.toLowerCase().startsWith(name)) ?? ""];

  return (
    <main style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ margin: 0 }}>Year Archive</h1>
        <nav style={{ display: "flex", gap: 14 }}>
          <Link href="/account">My companies</Link>
          <Link href="/saved">Saved</Link>
        </nav>
      </header>
      <p style={{ opacity: 0.7, margin: "6px 0 16px" }}>
        {all.length} stories across {docs.length} companies, January to October 2026. Each one says why it matters for your interview or GD.
      </p>

      <form method="get" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 16px" }}>
        <select name="company" defaultValue={sp.company ?? ""}>
          <option value="">All companies</option>
          {docs.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name} ({d.entries.length})
            </option>
          ))}
        </select>
        <select name="theme" defaultValue={sp.theme ?? ""}>
          <option value="">All themes</option>
          {themes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="month" defaultValue={sp.month ?? ""}>
          <option value="">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
          <option value="undated">Date not established</option>
        </select>
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search..." style={{ minWidth: 160 }} />
        <button type="submit">Filter</button>
        {sp.company || sp.theme || sp.month || sp.q ? <Link href="/year-archive" style={{ alignSelf: "center" }}>Clear</Link> : null}
      </form>

      {company ? (
        <section style={{ border: "1px solid #8886", borderRadius: 12, padding: "12px 16px", margin: "0 0 20px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>
            {company.name} <span style={{ opacity: 0.6, fontSize: 13, fontWeight: 400 }}>{company.sector}</span>
          </h2>
          {sec("top") ? (
            <>
              <h3 style={{ fontSize: 14, margin: "10px 0 0" }}>Top talking points</h3>
              <MdBlock lines={sec("top")!} />
            </>
          ) : null}
          {sec("likely") ? (
            <>
              <h3 style={{ fontSize: 14, margin: "10px 0 0" }}>Likely interview questions</h3>
              <MdBlock lines={sec("likely")!} />
            </>
          ) : null}
          {(["operations snapshot", "operations deep dive", "negative news", "unverified"] as const).map((k) =>
            sec(k) ? (
              <details key={k} style={{ margin: "8px 0" }}>
                <summary style={{ cursor: "pointer", textTransform: "capitalize" }}>{k}</summary>
                <MdBlock lines={sec(k)!} />
              </details>
            ) : null,
          )}
        </section>
      ) : null}

      <p style={{ opacity: 0.7 }}>{shown.length} stories shown</p>
      <div style={{ display: "grid", gap: 14 }}>
        {shown.map((e) => {
          const color = themeColor(e.theme);
          return (
            <article key={e.id} style={{ border: "1px solid #8886", borderLeft: `4px solid ${color}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontSize: 12 }}>
                <span style={{ background: color, color: "#0b0d12", fontWeight: 700, borderRadius: 999, padding: "2px 9px" }}>{e.theme}</span>
                <Link href={`/year-archive?company=${e.slug}`} style={{ fontWeight: 600 }}>{e.company}</Link>
                <span style={{ opacity: 0.7 }}>{e.date ? fmtDate(e.date) : `Date not established (${e.dateNote})`}</span>
                {/single/i.test(e.confidence) ? <span style={{ opacity: 0.7 }}>· single source</span> : null}
              </div>
              <h3 style={{ margin: "8px 0 6px", fontSize: 17, lineHeight: 1.3 }}>{e.headline}</h3>
              <p style={{ margin: "0 0 8px" }}>
                <MdInline text={e.recap} />
              </p>
              {e.keyNumbers ? (
                <p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.85 }}>
                  <strong>Key numbers: </strong>
                  <MdInline text={e.keyNumbers} />
                </p>
              ) : null}
              <div style={{ background: `${color}22`, borderRadius: 8, padding: "8px 12px", margin: "0 0 8px" }}>
                <strong>Why it matters{e.roleRelevance ? ` (${e.roleRelevance})` : ""}: </strong>
                <MdInline text={e.why} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Sources:{" "}
                {e.sources.map((s, i) => (
                  <span key={s.url}>
                    {i ? " · " : ""}
                    <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                  </span>
                ))}
                {e.sourceQuality ? ` · ${e.sourceQuality}` : ""}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
