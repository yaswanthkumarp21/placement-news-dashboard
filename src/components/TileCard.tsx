"use client";
import Link from "next/link";
import { MdInline } from "@/components/MdInline";
import { useSaved } from "@/lib/local";
import type { Tile } from "@/lib/tiles";

// on-brand accents: yellow leads, pink and green support
const PALETTE = ["#ffd60a", "#ff5fa2", "#5be3a4", "#ffe97a", "#ff93c1", "#b4f3d3"];
export function themeColor(theme: string) {
  let h = 0;
  for (const ch of theme) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** One story: company, headline, three inference bullets. `rank` shows a big outlined number; `feature` makes it larger. */
export function TileCard({ t, showTheme = false, rank, feature = false, accent }: { t: Tile; showTheme?: boolean; rank?: number; feature?: boolean; accent?: string }) {
  const { saved, toggle } = useSaved();
  const on = saved.includes(t.id);
  return (
    <article className={`pn-tile${feature ? " feat" : ""}`} style={{ ["--tc" as string]: accent ?? themeColor(t.theme) }}>
      <div className="pn-tile-head">
        {rank ? <span className="pn-rank">{String(rank).padStart(2, "0")}</span> : null}
        <div className="pn-meta">
          <Link className="pn-co" href={`/year-news?company=${t.slug}`}>{t.co}</Link>
          <span>{t.date ? fmt(t.date) : "date not established"}</span>
          {showTheme ? <span className="pn-tag">{t.theme}</span> : null}
        </div>
        <button className={`pn-save${on ? " on" : ""}`} onClick={() => toggle(t.id)} aria-label={on ? "Remove from saved" : "Save story"} aria-pressed={on}>
          {on ? "★ Saved" : "☆ Save"}
        </button>
      </div>
      <h3><MdInline text={t.headline} /></h3>
      <ul>
        {t.bullets.map((b, i) => (
          <li key={i}><MdInline text={b} /></li>
        ))}
      </ul>
      <details className="pn-more">
        <summary>Details and sources</summary>
        <p><MdInline text={t.recap} /></p>
        {t.keyNumbers ? <p><b>Key numbers:</b> <MdInline text={t.keyNumbers} /></p> : null}
        <p>
          {t.sources.map((s, i) => (
            <span key={`${i}-${s.u}`}>
              {i ? " · " : ""}
              <a href={s.u} target="_blank" rel="noreferrer">{s.l}</a>
            </span>
          ))}
          {t.single ? " · single source" : ""}
        </p>
      </details>
    </article>
  );
}
