"use client";

import { useState } from "react";
import type { DayMetrics } from "@/lib/metrics";
import type { RedditPostRecord } from "@/lib/types";
import { Bars, labelEveryFor, parts, useChartControls, type Series } from "@/components/admin/charts";
import { call, Toast, useAdminAct } from "../shared";

export interface DistributionData {
  /** every recorded UTC day in the last year, newest first; the panel windows and buckets them */
  days: DayMetrics[];
  /** clicked cluster ids resolved to headlines (aged-out ids resolve to themselves) */
  stories: Record<string, { headline: string; slug?: string }>;
  email: {
    /** every signup: its UTC day and whether it confirmed */
    signups: Array<{ day: string; confirmed: boolean }>;
    total: number;
    unconfirmed: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  reddit: {
    configured: boolean;
    enabled: boolean;
    subreddit: string;
    postHourUtc: number;
    posts: RedditPostRecord[];
    lastAttemptAt: string | null;
  };
  /** optional dashboard links from config/site.json (analytics.vercelUrl, analytics.googleUrl); the sentence hides when both are unset */
  analytics: { vercelUrl?: string; googleUrl?: string };
}

/** How many distinct callers a bucket saw (kept here: the metrics module touches the filesystem and must never reach a client chunk). */
function distinctCount(map: Record<string, 1> | undefined): number {
  return map ? Object.keys(map).length : 0;
}

function emptyDay(date: string): DayMetrics {
  return {
    date,
    feed: { hits: 0, readers: {}, distinct: {} },
    mcp: { tools: {}, clients: {}, initializes: 0, htmlViews: 0, distinct: {} },
    clicks: { total: 0, stories: {}, domains: {}, sponsored: 0 },
    searches: { total: 0, queries: {}, misses: {} },
  };
}

function addInto(target: Record<string, number>, from: Record<string, number> | undefined) {
  for (const [k, v] of Object.entries(from ?? {})) target[k] = (target[k] ?? 0) + v;
}

/** days folded into one bucket: counts add, reader gauges take the max, distinct callers union (a client-side twin of the server's bucketMetrics) */
function mergeDay(target: DayMetrics, d: DayMetrics) {
  target.feed.hits += d.feed.hits;
  for (const [name, r] of Object.entries(d.feed.readers)) {
    const cur = target.feed.readers[name] ?? { subs: 0, hits: 0, lastSeen: "" };
    cur.subs = Math.max(cur.subs, r.subs);
    cur.hits += r.hits;
    if (r.lastSeen > cur.lastSeen) cur.lastSeen = r.lastSeen;
    target.feed.readers[name] = cur;
  }
  for (const k of Object.keys(d.feed.distinct ?? {})) (target.feed.distinct ??= {})[k] = 1;
  addInto(target.mcp.tools, d.mcp.tools);
  addInto(target.mcp.clients, d.mcp.clients);
  target.mcp.initializes += d.mcp.initializes;
  target.mcp.htmlViews += d.mcp.htmlViews;
  for (const k of Object.keys(d.mcp.distinct ?? {})) (target.mcp.distinct ??= {})[k] = 1;
  target.clicks.total += d.clicks.total;
  target.clicks.sponsored += d.clicks.sponsored;
  addInto(target.clicks.stories, d.clicks.stories);
  addInto(target.clicks.domains, d.clicks.domains);
  const ts = (target.searches ??= { total: 0, queries: {}, misses: {} });
  ts.total += d.searches?.total ?? 0;
  addInto(ts.queries, d.searches?.queries);
  addInto(ts.misses, d.searches?.misses);
}

function sumMaps(days: DayMetrics[], pick: (d: DayMetrics) => Record<string, number>): Array<[string, number]> {
  const totals: Record<string, number> = {};
  for (const d of days) addInto(totals, pick(d));
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

/** The comment's Reddit markdown as HTML, close to how Reddit shows it: bold, links, numbered lists, paragraphs. */
function redditHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
      .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" rel="noopener">$2</a>');
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length > 0) out.push(`<ol>${list.map((l) => `<li>${l}</li>`).join("")}</ol>`);
    list = [];
  };
  for (const line of md.split("\n")) {
    const m = /^\d+\.\s+(.*)$/.exec(line);
    if (m) list.push(inline(m[1]));
    else {
      flush();
      if (line.trim()) out.push(`<p>${inline(line)}</p>`);
    }
  }
  flush();
  return out.join("");
}

/** The five engagement series, in fixed order with fixed hues (never repainted by a filter). */
const SERIES = [
  { key: "feed", label: "RSS hits", hue: 1, anchor: "feed" },
  { key: "mcp", label: "MCP tool calls", hue: 2, anchor: "mcp" },
  { key: "clicks", label: "Story clicks", hue: 3, anchor: "clicks" },
  { key: "searches", label: "Searches", hue: 4, anchor: "search" },
  { key: "signups", label: "Email signups", hue: 5, anchor: "email" },
] as const;

/**
 * The outbound side: feed hits, MCP calls, story clicks, searches, and
 * signups, per bucket, under the shared controls. The counters exist per
 * UTC day only, so there is no clock here.
 */
export function DistributionPanel({ data }: { data: DistributionData }) {
  const { busy, status, setStatus, act } = useAdminAct();
  const [preview, setPreview] = useState("");
  const [previewRaw, setPreviewRaw] = useState(false);
  const c = useChartControls({ clock: false, windows: [7, 14, 30, 90, 365] });

  // the days that count: in the window and passing the day filters; then
  // folded into the current buckets, every bucket present even when empty
  const since = new Date(Date.now() - (c.days - 1) * 86400000).toISOString().slice(0, 10);
  const countedDay = (day: string) => day >= since && c.counted(day, parts(`${day}T12:00:00Z`, "UTC").dow);
  const inWindow = data.days.filter((d) => countedDay(d.date));
  const buckets = new Map<string, DayMetrics>(c.bucketKeys.map((k) => [k, emptyDay(k)]));
  for (const d of inWindow) {
    const key = c.bucketOf(d.date, parts(`${d.date}T12:00:00Z`, "UTC").dow);
    const t = buckets.get(key);
    if (t) mergeDay(t, d);
  }
  const signups = new Map<string, { all: number; confirmed: number }>(c.bucketKeys.map((k) => [k, { all: 0, confirmed: 0 }]));
  for (const s of data.email.signups) {
    if (!countedDay(s.day)) continue;
    const b = signups.get(c.bucketOf(s.day, parts(`${s.day}T12:00:00Z`, "UTC").dow));
    if (!b) continue;
    b.all += 1;
    if (s.confirmed) b.confirmed += 1;
  }
  const rows = [...buckets.values()];
  const hint = (key: string) => `${c.by === "week" ? `week of ${key}` : key}${c.countNote(key)}`;
  const common = { decimals: c.decimals, allLabels: c.allLabels, showValues: c.showValues, labelEvery: labelEveryFor(c.by, rows.length) };
  const chart = (title: string, sub: string, series: Series[], value: (d: DayMetrics) => Record<string, number>) => (
    <Bars
      title={c.avg ? `${title}, daily average` : title}
      sub={sub}
      series={series}
      layout="inner"
      buckets={rows.map((d) => ({ label: d.date, values: c.scale(value(d), c.daysIn.get(d.date) ?? 0), hint: hint(d.date) }))}
      {...common}
    />
  );

  // per-reader rollup: max subs across the window, last seen
  const readers: Record<string, { window: number; hits: number; lastSeen: string }> = {};
  for (const d of inWindow) {
    for (const [name, r] of Object.entries(d.feed.readers)) {
      const cur = readers[name] ?? { window: 0, hits: 0, lastSeen: "" };
      cur.window = Math.max(cur.window, r.subs);
      cur.hits += r.hits;
      if (r.lastSeen > cur.lastSeen) cur.lastSeen = r.lastSeen;
      readers[name] = cur;
    }
  }
  const readerRows = Object.entries(readers).sort((a, b) => b[1].window - a[1].window);
  const toolTotals = sumMaps(inWindow, (d) => d.mcp.tools);
  const clientTotals = sumMaps(inWindow, (d) => d.mcp.clients);
  const storyTotals = sumMaps(inWindow, (d) => d.clicks.stories).slice(0, 20);
  const domainTotals = sumMaps(inWindow, (d) => d.clicks.domains).slice(0, 20);
  const sponsoredTotal = inWindow.reduce((n, d) => n + d.clicks.sponsored, 0);
  const searchTotal = inWindow.reduce((n, d) => n + (d.searches?.total ?? 0), 0);
  const queryTotals = sumMaps(inWindow, (d) => d.searches?.queries ?? {}).slice(0, 40);
  const missTotals = sumMaps(inWindow, (d) => d.searches?.misses ?? {}).slice(0, 20);
  const mcpHtmlTotal = inWindow.reduce((n, d) => n + d.mcp.htmlViews, 0);
  const mcpInitTotal = inWindow.reduce((n, d) => n + d.mcp.initializes, 0);
  const overview = rows.map((d) => ({
    label: d.date,
    hint: hint(d.date),
    values: c.scale(
      {
        feed: d.feed.hits,
        mcp: Object.values(d.mcp.tools).reduce((n, x) => n + x, 0),
        clicks: d.clicks.total,
        searches: d.searches?.total ?? 0,
        signups: signups.get(d.date)?.all ?? 0,
      },
      c.daysIn.get(d.date) ?? 0
    ),
  }));
  const overviewTotals = Object.fromEntries(SERIES.map((s) => [s.key, overview.reduce((n, r) => n + (r.values[s.key] ?? 0), 0)]));
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: c.decimals });

  return (
    <>
      <Toast status={status} onClear={() => setStatus("")} />
      <p className="status-line">
        The consumption side the site measures itself: feed hits, MCP tool calls, outbound story clicks, site
        search, and email signups. Counters exist per UTC day, so there is no clock here.
        {data.analytics.vercelUrl || data.analytics.googleUrl ? (
          <>
            {" "}
            Inbound traffic and its sources live in{" "}
            {[
              data.analytics.vercelUrl ? { href: data.analytics.vercelUrl, label: "Vercel Analytics" } : null,
              data.analytics.googleUrl ? { href: data.analytics.googleUrl, label: "Google Analytics" } : null,
            ]
              .filter((l): l is { href: string; label: string } => l !== null)
              .map((l, i) => (
                <span key={l.href}>
                  {i > 0 ? " and " : ""}
                  <a href={l.href} rel="noopener">
                    {l.label}
                  </a>
                </span>
              ))}
            .
          </>
        ) : null}
      </p>
      {c.controls}

      <div className="admin-card viz-root">
        <div className="headline">All channels</div>
        <Bars
          sub="Reader actions across every channel, one bar per bucket. Hover a bar for the split."
          series={SERIES.map((s) => ({ key: s.key, label: s.label, hue: s.hue }))}
          layout={c.multi}
          height={120}
          legend={false}
          buckets={overview}
          {...common}
        />
        <div className="viz-legend">
          {SERIES.map((s) => (
            <a key={s.key} className="viz-key" href={`#${s.anchor}`} title={`Jump to the ${s.label.toLowerCase()} detail below`}>
              <span className={`viz-swatch viz-${s.hue}`} /> {s.label} · {fmt(overviewTotals[s.key] ?? 0)}
            </a>
          ))}
        </div>
      </div>

      <h2 id="email">Email</h2>
      <div className="admin-card">
        <div className="headline">
          {data.email.total} confirmed subscriber{data.email.total === 1 ? "" : "s"} · {data.email.daily} daily / {data.email.weekly} weekly /{" "}
          {data.email.monthly} monthly
          {data.email.unconfirmed > 0 ? ` · ${data.email.unconfirmed} unconfirmed` : ""}
        </div>
        <Bars
          sub={
            <>
              Signups per bucket, confirmed as the darker bar. The list itself, sends, and previews live on <a href="/admin/email">Email</a>.
            </>
          }
          series={[
            { key: "all", label: "signups", hue: 1 },
            { key: "confirmed", label: "confirmed", hue: 1 },
          ]}
          layout="inner"
          buckets={rows.map((d) => ({ label: d.date, hint: hint(d.date), values: c.scale({ all: signups.get(d.date)?.all ?? 0, confirmed: signups.get(d.date)?.confirmed ?? 0 }, c.daysIn.get(d.date) ?? 0) }))}
          {...common}
        />
      </div>

      <h2 id="reddit">Reddit daily comment</h2>
      <div className="admin-card">
        <div className="headline">
          r/{data.reddit.subreddit} daily thread ·{" "}
          {!data.reddit.enabled || !data.reddit.subreddit
            ? "off in config"
            : data.reddit.configured
              ? `posting automatically after ${String(data.reddit.postHourUtc).padStart(2, "0")}:00 UTC`
              : "no credentials yet, runs dry"}
        </div>
        <div className="sub">
          Yesterday&apos;s frozen edition goes in as one comment, top stories with site and source links, where the
          thread&apos;s regulars and any mod roundup can pick it up. Credentials live in Vercel env (REDDIT_CLIENT_ID,
          REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN). Mint the refresh token once at{" "}
          <a href="/api/admin/reddit-auth">/api/admin/reddit-auth</a>.
          {data.reddit.lastAttemptAt ? ` Last attempt ${data.reddit.lastAttemptAt.slice(0, 16).replace("T", " ")} UTC.` : ""}
        </div>
        <div className="form-row">
          <button
            className="btn"
            disabled={busy}
            onClick={async () => {
              const r = (await call("previewReddit")) as { ok: boolean; message?: string; text?: string };
              setStatus(r.message ?? (r.ok ? "Done." : "Failed."));
              setPreview(r.text ?? "");
            }}
          >
            Preview comment
          </button>
          <button className="btn primary" disabled={busy} onClick={() => act("postReddit", {}, "Post yesterday's edition into the daily thread now?")}>
            Post now
          </button>
        </div>
        {preview ? (
          <>
            <div className="btn-row" style={{ marginTop: 8 }}>
              <button type="button" className={`filter-chip${previewRaw ? "" : " on"}`} onClick={() => setPreviewRaw(false)}>
                as Reddit shows it
              </button>
              <button type="button" className={`filter-chip${previewRaw ? " on" : ""}`} onClick={() => setPreviewRaw(true)}>
                markdown
              </button>
            </div>
            {previewRaw ? <pre className="reddit-preview">{preview}</pre> : <div className="reddit-preview reddit-rendered" dangerouslySetInnerHTML={{ __html: redditHtml(preview) }} />}
          </>
        ) : null}
        {data.reddit.posts.length > 0 ? (
          <ul className="search-items">
            {data.reddit.posts.map((p) => (
              <li key={p.postedAt} className="newest-item">
                {p.commentUrl ? <a href={p.commentUrl}>edition {p.date}</a> : <span>edition {p.date}</span>}
                <div className="org">
                  posted {p.postedAt.slice(0, 16).replace("T", " ")} UTC{p.manual ? " · by hand" : ""}
                  {p.threadUrl ? (
                    <>
                      {" · "}
                      <a href={p.threadUrl}>thread</a>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="sub">No comments made yet.</div>
        )}
      </div>

      {data.days.length === 0 ? (
        <p className="empty-state">No distribution metrics recorded yet. Counters start filling in as the feed, the MCP server, and story links get traffic.</p>
      ) : null}

      <h2 id="feed">RSS feed</h2>
      <div className="admin-card">
        <div className="headline">Requests</div>
        {chart(
          "Feed hits",
          "Hits count CDN misses only (the feed is cached five minutes at the edge), with distinct callers as the darker bar: different addresses and agents that fetched the feed. The subscriber column below is the real audience number for readers that report it in their User-Agent.",
          [
            { key: "hits", label: "hits", hue: 1 },
            { key: "distinct", label: "distinct callers", hue: 1 },
          ],
          (d) => ({ hits: d.feed.hits, distinct: distinctCount(d.feed.distinct) })
        )}
      </div>
      {readerRows.length > 0 ? (
        <div className="admin-card">
          <div className="headline">Feed readers</div>
          {readerRows.map(([name, r]) => (
            <div key={name} className="sub" style={{ margin: "4px 0" }}>
              <strong>{name}</strong> · {r.window > 0 ? `${r.window} subscribers` : "no subscriber count reported"} · {r.hits} fetches · last seen{" "}
              {r.lastSeen ? new Date(r.lastSeen).toUTCString().replace("GMT", "UTC") : "unknown"}
            </div>
          ))}
        </div>
      ) : null}

      <h2 id="mcp">MCP server</h2>
      <div className="admin-card">
        <div className="headline">Tool calls</div>
        {chart(
          "MCP tool calls",
          "Tool calls per bucket, with distinct callers (different addresses and agents) as the darker bar. A caller keyed the same all day counts once however many calls it makes.",
          [
            { key: "calls", label: "tool calls", hue: 2 },
            { key: "distinct", label: "distinct callers", hue: 2 },
          ],
          (d) => ({ calls: Object.values(d.mcp.tools).reduce((n, v) => n + v, 0), distinct: distinctCount(d.mcp.distinct) })
        )}
      </div>
      <div className="admin-card">
        <div className="headline">Tool calls in the window</div>
        {toolTotals.length === 0 ? <div className="sub">No tool calls recorded yet.</div> : null}
        {toolTotals.map(([tool, n]) => (
          <div key={tool} className="sub" style={{ margin: "4px 0" }}>
            <strong>{tool}</strong> · {n}
          </div>
        ))}
        <div className="sub" style={{ marginTop: 8 }}>
          {mcpInitTotal} session{mcpInitTotal === 1 ? "" : "s"} (the server is stateless, so every client connection re-initializes) · {mcpHtmlTotal} browser visit
          {mcpHtmlTotal === 1 ? "" : "s"} to the explainer page
        </div>
      </div>
      {clientTotals.length > 0 ? (
        <div className="admin-card">
          <div className="headline">Clients</div>
          {clientTotals.map(([name, n]) => (
            <div key={name} className="sub" style={{ margin: "4px 0" }}>
              <strong>{name}</strong> · {n} session{n === 1 ? "" : "s"}
            </div>
          ))}
        </div>
      ) : null}

      <h2 id="clicks">Outbound story clicks</h2>
      <div className="admin-card">
        <div className="headline">Clicks</div>
        {chart(
          "Story clicks",
          "Sponsored clicks as the darker bar inside.",
          [
            { key: "clicks", label: "clicks", hue: 3 },
            { key: "sponsored", label: "sponsored", hue: 3 },
          ],
          (d) => ({ clicks: d.clicks.total, sponsored: d.clicks.sponsored })
        )}
        {sponsoredTotal > 0 ? (
          <div className="sub" style={{ marginTop: 8 }}>
            {sponsoredTotal} sponsored click{sponsoredTotal === 1 ? "" : "s"} in the window
          </div>
        ) : null}
      </div>
      {storyTotals.length > 0 ? (
        <div className="admin-card">
          <div className="headline">Most clicked stories</div>
          {storyTotals.map(([id, n]) => {
            const s = data.stories[id] ?? { headline: id };
            return (
              <div key={id} className="sub" style={{ margin: "4px 0" }}>
                {s.slug ? <a href={`/story/${s.slug}`}>{s.headline}</a> : s.headline} · {n}
              </div>
            );
          })}
        </div>
      ) : null}
      {domainTotals.length > 0 ? (
        <div className="admin-card">
          <div className="headline">Most clicked destinations</div>
          {domainTotals.map(([domain, n]) => (
            <div key={domain} className="sub" style={{ margin: "4px 0" }}>
              <strong>{domain}</strong> · {n}
            </div>
          ))}
        </div>
      ) : null}

      <h2 id="search">Site search</h2>
      <div className="admin-card">
        <div className="headline">
          {searchTotal} search{searchTotal === 1 ? "" : "es"} in the window
        </div>
        {chart(
          "Searches",
          "What readers typed into the search box, your own searches excluded. Misses are queries that found no story and no stream item, the clearest signal of a source or a story the site is missing.",
          [
            { key: "searches", label: "searches", hue: 4 },
            { key: "misses", label: "found nothing", hue: 4 },
          ],
          (d) => ({ searches: d.searches?.total ?? 0, misses: Object.values(d.searches?.misses ?? {}).reduce((n, v) => n + v, 0) })
        )}
      </div>
      {queryTotals.length > 0 ? (
        <div className="admin-card">
          <div className="headline">Most searched</div>
          {queryTotals.map(([q, n]) => (
            <div key={q} className="sub" style={{ margin: "4px 0" }}>
              <a href={`/search?q=${encodeURIComponent(q)}`}>{q}</a> · {n}
            </div>
          ))}
        </div>
      ) : null}
      {missTotals.length > 0 ? (
        <div className="admin-card">
          <div className="headline">Searches that found nothing</div>
          {missTotals.map(([q, n]) => (
            <div key={q} className="sub" style={{ margin: "4px 0" }}>
              <a href={`/search?q=${encodeURIComponent(q)}`}>{q}</a> · {n}
            </div>
          ))}
        </div>
      ) : null}

      <p className="status-line">
        Inbound attribution per channel lives in your web analytics under utm_source x, farcaster, reddit, and email.
      </p>
    </>
  );
}
