import { DataClient, type DataTab } from "./DataClient";
import type { DistributionData } from "./DistributionPanel";
import type { FlowData } from "./FlowPanel";
import { buildChrome, NotLoggedIn } from "../server";
import { isAdmin } from "@/lib/auth";
import { applyBotOverrides, effectiveFeeds, loadSiteConfig } from "@/lib/config";
import { isMediaFeed } from "@/lib/feeds";
import { loadMetricsRange } from "@/lib/metrics";
import { siteIdentity } from "@/lib/site";
import { redditConfigured } from "@/lib/social/reddit";
import { loadState } from "@/lib/state";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin · Data", robots: { index: false } };

/**
 * The data section: Flow (stories created) and Distribution (feed, MCP,
 * clicks, searches, signups) under one set of chart controls. The server
 * hands over a year of each and the client windows and buckets it, so
 * every control works without a round trip.
 */
export default async function AdminDataPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await isAdmin())) return <NotLoggedIn />;
  const sp = await searchParams;
  const tab: DataTab = sp.tab === "distribution" ? "distribution" : "flow";
  const state = await loadState();
  const cfg = applyBotOverrides(loadSiteConfig(), state);
  const since = Date.now() - 366 * 86400000;

  // flow: a year of creation times, never pruned from state
  const rewrites = [...(state.frontSummary?.changeTimes ?? [])];
  for (const h of state.frontSummary?.history ?? []) if (!rewrites.includes(h.at)) rewrites.push(h.at);
  // how many whitelisted news feeds point at each section, so the panel can
  // say how much of the whitelist is actually producing
  const configured: Record<string, number> = {};
  for (const f of effectiveFeeds(state)) {
    if (isMediaFeed(f)) continue;
    const sec = f.sectionHint ?? "general";
    configured[sec] = (configured[sec] ?? 0) + 1;
  }
  const flow: FlowData = {
    stories: Object.values(state.clusters)
      .filter((c) => new Date(c.createdAt).getTime() >= since)
      .map((c) => ({
        at: c.createdAt,
        section: c.section,
        live: !c.killed && !c.mergedInto,
        sources: [...new Set(c.links.map((l) => l.sourceId))],
      }))
      .sort((a, b) => a.at.localeCompare(b.at)),
    rewrites,
    sections: cfg.sections.map((s) => s.id),
    configured,
  };

  // distribution: a year of recorded days, only when that tab shows, since
  // the rollups are one fetch per recorded day
  let distribution: DistributionData = {
    days: [],
    stories: {},
    email: { signups: [], total: 0, unconfirmed: 0, daily: 0, weekly: 0, monthly: 0 },
    reddit: { configured: false, enabled: false, subreddit: "", postHourUtc: 10, posts: [], lastAttemptAt: null },
    analytics: {},
  };
  if (tab === "distribution") {
    const days = await loadMetricsRange(366);
    // resolve clicked cluster ids to headlines while the clusters still exist;
    // stories aged out of state degrade to their bare id
    const stories: Record<string, { headline: string; slug?: string }> = {};
    for (const day of days) {
      for (const id of Object.keys(day.clicks.stories)) {
        if (stories[id]) continue;
        const c = state.clusters[id];
        stories[id] = c ? { headline: c.headline, slug: c.slug } : { headline: id };
      }
    }
    const subs = state.digestSubscribers ?? [];
    const confirmed = subs.filter((s) => s.confirmed !== false);
    distribution = {
      days,
      stories,
      email: {
        signups: subs.map((s) => ({ day: s.addedAt.slice(0, 10), confirmed: s.confirmed !== false })),
        total: confirmed.length,
        unconfirmed: subs.length - confirmed.length,
        daily: confirmed.filter((s) => s.daily).length,
        weekly: confirmed.filter((s) => s.weekly).length,
        monthly: confirmed.filter((s) => s.monthly).length,
      },
      reddit: {
        configured: redditConfigured(),
        enabled: Boolean(cfg.bots.reddit?.dailyComment),
        subreddit: cfg.bots.reddit?.subreddit ?? "",
        postHourUtc: cfg.bots.reddit?.postHourUtc ?? 10,
        posts: (state.redditPosts ?? []).slice(0, 14),
        lastAttemptAt: state.redditLastAttemptAt ?? null,
      },
      analytics: {
        ...(process.env.VERCEL_ANALYTICS_URL || siteIdentity().analytics?.vercelUrl
          ? { vercelUrl: process.env.VERCEL_ANALYTICS_URL || siteIdentity().analytics?.vercelUrl }
          : {}),
        ...(process.env.GOOGLE_ANALYTICS_URL || siteIdentity().analytics?.googleUrl
          ? { googleUrl: process.env.GOOGLE_ANALYTICS_URL || siteIdentity().analytics?.googleUrl }
          : {}),
      },
    };
  }

  return (
    <main className="wrap page single admin">
      <DataClient chrome={buildChrome(state, cfg)} tab={tab} flow={flow} distribution={distribution} />
    </main>
  );
}
