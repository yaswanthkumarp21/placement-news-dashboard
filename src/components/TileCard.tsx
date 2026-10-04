"use client";
import Link from "next/link";
import { MdInline } from "@/components/MdInline";
import { useSaved } from "@/lib/local";
import type { Tile } from "@/lib/tiles";

const PALETTE = ["#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#60a5fa", "#fb923c", "#2dd4bf", "#f472b6"];
export function themeColor(theme: string) {
  let h = 0;
  for (const ch of theme) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** One story: company (small), headline, three inference bullets. Tap "Details" for recap, numbers and sources. */
export function TileCard({ t, showTheme = false }: { t: Tile; showTheme?: boolean }) {
  const { saved, toggle } = useSaved();
  const on = saved.includes(t.id);
  return (
    <article className="pn-tile" style={{ ["--tc" as string]: themeColor(t.theme) }}>
      <div className="pn-tile-top">
        <span>
          <Link className="pn-co" href={`/year-news?company=${t.slug}`}>{t.co}</Link>
          {" · "}
          {t.date ? fmt(t.date) : "date not established"}
          {showTheme ? <> {" "}<span className="pn-tag">{t.theme}</span></> : null}
        </span>
        <button className={`pn-save${on ? " on" : ""}`} onClick={() => toggle(t.id)} aria-label={on ? "Remove from saved" : "Save story"} aria-pressed={on}>
          {on ? "★" : "☆"}
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
            <span key={s.u}>
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
