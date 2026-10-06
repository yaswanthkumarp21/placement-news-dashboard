"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompanyPicker } from "@/app/account/CompanyPicker";
import { QuoteRotator } from "@/components/QuoteRotator";
import { TileCard } from "@/components/TileCard";
import { KEYS, useLocal, useSaved } from "@/lib/local";
import type { Tile } from "@/lib/tiles";

type Company = { id: string; name: string; industry: string | null };

function SavedStrip({ byId }: { byId: Map<string, Tile> }) {
  const { saved } = useSaved();
  const [order, setOrder] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  // saved stories appear in a random order, reshuffled whenever the saved list changes
  useEffect(() => {
    const a = [...saved];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setOrder(a);
  }, [saved.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = order.map((id) => byId.get(id)).filter(Boolean) as Tile[];

  function step(dir: number) {
    const el = ref.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? 220;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * (w + 10), behavior: "smooth" });
  }
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      if (!paused.current) step(1);
    }, 3500);
    return () => clearInterval(id);
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items.length)
    return <div className="pn-empty">Tap the star on any story to save it. Your saved stories will scroll here in random order.</div>;
  const hold = (v: boolean) => () => {
    paused.current = v;
  };
  return (
    <div className="pn-strip" onMouseEnter={hold(true)} onMouseLeave={hold(false)} onTouchStart={hold(true)} onTouchEnd={hold(false)}>
      <button className="pn-arrow" onClick={() => step(-1)} aria-label="Previous saved story">‹</button>
      <div className="pn-strip-scroll" ref={ref}>
        {items.map((t) => (
          <a key={t.id} className="pn-mini" href={t.sources[0]?.u ?? "#"} target="_blank" rel="noreferrer">
            <span>{t.co}</span>
            <b>{t.headline}</b>
          </a>
        ))}
      </div>
      <button className="pn-arrow" onClick={() => step(1)} aria-label="Next saved story">›</button>
    </div>
  );
}

/** Top-N by rank, but at most `max` cards per company, so one busy company cannot fill the whole list. */
function diversify(list: Tile[], n: number, max = 2): Tile[] {
  const per = new Map<string, number>();
  const out: Tile[] = [];
  for (const t of list) {
    const c = (per.get(t.slug) ?? 0) + 1;
    if (c > max) continue;
    per.set(t.slug, c);
    out.push(t);
    if (out.length === n) break;
  }
  return out;
}

export function DailyClient({ tiles, companies, today, demo }: { tiles: Tile[]; companies: Company[]; today: string; demo: boolean }) {
  const [off] = useLocal<string[]>(KEYS.off, []);
  const [onboarded, setOnboarded, ready] = useLocal<boolean>(KEYS.onboarded, false);
  const [q, setQ] = useState("");

  const offSet = useMemo(() => new Set(off), [off]);
  const selectable = useMemo(() => new Set(companies.map((c) => c.id)), [companies]);
  const byId = useMemo(() => new Map(tiles.map((t) => [t.id, t])), [tiles]);

  const mine = tiles.filter((t) => t.csvId && selectable.has(t.csvId) && !offSet.has(t.csvId));
  const forYou = diversify(mine, 10);
  const forYouIds = new Set(forYou.map((t) => t.id));
  const overall = diversify(tiles.filter((t) => !forYouIds.has(t.id)), 10);

  const query = q.trim().toLowerCase();
  const results = query ? mine.filter((t) => `${t.headline} ${t.co} ${t.bullets.join(" ")}`.toLowerCase().includes(query)) : null;
  const selectedCount = companies.length - off.filter((id) => selectable.has(id)).length;
  const withStories = new Set(mine.map((t) => t.csvId)).size;

  return (
    <>
      <section className="pn-hero">
        <p className="pn-kicker">{today}</p>
        <h1>Walk in <em>ready.</em></h1>
        <QuoteRotator />
        <div className="pn-stats">
          <div className="pn-stat"><b>{tiles.length}</b><span>stories</span></div>
          <div className="pn-stat"><b>{new Set(tiles.map((t) => t.slug)).size}</b><span>companies</span></div>
          <div className="pn-stat"><b>{selectedCount}</b><span>yours</span></div>
        </div>
      </section>

      {demo ? <span className="pn-demo">Demo mode · stories come from your research archive until the daily job is live</span> : null}
      <div className="pn-search-wrap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input className="pn-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my companies" aria-label="Search my companies" />
      </div>

      {results ? (
        <>
          <div className="pn-h"><h2>Results</h2><span className="pn-sub">{results.length} in my companies</span></div>
          <div className="pn-list">
            {results.map((t) => <TileCard key={t.id} t={t} />)}
            {!results.length ? <div className="pn-empty">Nothing found in your companies.</div> : null}
          </div>
        </>
      ) : (
        <>
          <div className="pn-h" style={{ ["--hc" as string]: "var(--pink)" }}>
            <h2>Saved</h2>
            <Link className="pn-sub" href="/saved">See all</Link>
          </div>
          <SavedStrip byId={byId} />

          <div className="pn-h">
            <h2>Top 10 for you</h2>
            <Link className="pn-sub" href="/account">{selectedCount} companies · edit</Link>
          </div>
          <p className="pn-note" style={{ marginTop: 0 }}>Ranked for interviews and GDs. {withStories} of your companies have stories so far.</p>
          <div className="pn-list">
            {forYou.map((t, i) => <TileCard key={t.id} t={t} rank={i + 1} feature={i === 0} accent="#ffd60a" />)}
            {!forYou.length ? <div className="pn-empty">No stories yet for your companies. Add more companies or check back after the next research batch.</div> : null}
          </div>

          <div className="pn-h" style={{ ["--hc" as string]: "var(--green)" }}>
            <h2>Ops overall</h2>
            <span className="pn-sub">top 10 · all companies</span>
          </div>
          <div className="pn-list">
            {overall.map((t, i) => <TileCard key={t.id} t={t} rank={i + 1} accent="#5be3a4" />)}
          </div>
        </>
      )}

      {ready && !onboarded ? (
        <div className="pn-sheet-bg" role="dialog" aria-modal="true" aria-label="Pick your companies">
          <div className="pn-sheet">
            <p className="pn-kicker">Step 1</p>
            <h2>Pick your companies</h2>
            <p className="pn-note">Your Daily News follows only these. Everything is on to start; tap a company to switch it off. You can change this any time.</p>
            <div className="pn-picker">
              <CompanyPicker userId={null} companies={companies} initiallyOff={[]} />
            </div>
            <button className="pn-primary" onClick={() => setOnboarded(true)}>Continue</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
