"use client";

import { useState } from "react";
import { Bars, DOW_NAMES, labelEveryFor, parts, useChartControls, type Series } from "@/components/admin/charts";

export interface FlowData {
  /** every story created in the last year: when, which section, whether it survived, which sources it carries */
  stories: Array<{ at: string; section: string; live: boolean; sources: string[] }>;
  /** every time the Latest in box was rewritten */
  rewrites: string[];
  sections: string[];
  /** whitelisted news feeds pointed at each section */
  configured: Record<string, number>;
}

/**
 * The inbound side: when stories get created, by bucket, by hour of day,
 * by weekday, any mix of sections, plus Latest in rewrites.
 */
export function FlowPanel({ data }: { data: FlowData }) {
  const sectionIds = [...data.sections];
  for (const s of data.stories) if (!sectionIds.includes(s.section)) sectionIds.push(s.section);
  const [chosen, setChosen] = useState<Set<string>>(new Set(data.sections));
  const [liveOnly, setLiveOnly] = useState(false);
  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const chip = (on: boolean, label: string, onClick: () => void, title?: string) => (
    <button key={label} type="button" className={`filter-chip${on ? " on" : ""}`} onClick={onClick} title={title}>
      {label}
    </button>
  );
  const c = useChartControls({
    clock: true,
    extraRows: (
      <>
        <div className="flow-filter-row">
          <span className="filter-label">Sections</span>
          <span>
            {chip(chosen.size === sectionIds.length, "all", () => setChosen(new Set(sectionIds)), "count every section")}
            {sectionIds.map((s) => chip(chosen.has(s), s, () => toggle(s), `toggle ${s}`))}
            <span className="org flow-filter-hint">click to toggle, any mix</span>
          </span>
        </div>
        <div className="flow-filter-row">
          <span className="filter-label">Count</span>
          <span>
            {chip(!liveOnly, "everything created", () => setLiveOnly(false), "every story the pipeline created, including ones later killed or merged away")}
            {chip(liveOnly, "still live", () => setLiveOnly(true), "only stories that are still on the site: not killed, not merged into another")}
          </span>
        </div>
      </>
    ),
  });

  const since = Date.now() - c.days * 86400000;
  const stories = data.stories.filter((s) => {
    if (new Date(s.at).getTime() < since || !chosen.has(s.section) || (liveOnly && !s.live)) return false;
    const p = parts(s.at, c.zone);
    return c.counted(p.day, p.dow);
  });
  const rewrites = data.rewrites.filter((t) => {
    if (new Date(t).getTime() < since) return false;
    const p = parts(t, c.zone);
    return c.counted(p.day, p.dow);
  });

  // hues follow the section, never its position in the pick
  const hueOf = (id: string) => (sectionIds.indexOf(id) % 5) + 1;
  const split = c.layout !== "combined" && chosen.size > 1;
  const series: Series[] = split
    ? sectionIds.filter((id) => chosen.has(id)).map((id) => ({ key: id, label: id, hue: hueOf(id) }))
    : [{ key: "all", label: chosen.size === sectionIds.length ? "all sections" : [...chosen].join(" + "), hue: chosen.size === 1 ? hueOf([...chosen][0]) : 1 }];
  const keyOf = (s: { section: string }) => (split ? s.section : "all");
  const empty = () => Object.fromEntries(series.map((s) => [s.key, 0])) as Record<string, number>;

  const perBucket = new Map<string, Record<string, number>>(c.bucketKeys.map((k) => [k, empty()]));
  const rewritesPer = new Map<string, number>(c.bucketKeys.map((k) => [k, 0]));
  const byHour = Array.from({ length: 24 }, () => empty());
  const byDow = Array.from({ length: 7 }, () => empty());
  for (const s of stories) {
    const p = parts(s.at, c.zone);
    const k = keyOf(s);
    const d = perBucket.get(c.bucketOf(p.day, p.dow));
    if (d) d[k] = (d[k] ?? 0) + 1;
    byHour[p.hour][k] = (byHour[p.hour][k] ?? 0) + 1;
    byDow[p.dow][k] = (byDow[p.dow][k] ?? 0) + 1;
  }
  for (const t of rewrites) {
    const p = parts(t, c.zone);
    const key = c.bucketOf(p.day, p.dow);
    if (rewritesPer.has(key)) rewritesPer.set(key, (rewritesPer.get(key) ?? 0) + 1);
  }
  // breadth beside volume: for the window and filters, each section's story
  // count, how many distinct sources produced them, and how many feeds
  // point at that section at all
  const breadth = sectionIds
    .filter((id) => chosen.has(id))
    .map((id) => {
      const mine = stories.filter((s) => s.section === id);
      const sources = new Set(mine.flatMap((s) => s.sources));
      return { id, stories: mine.length, sources: sources.size, configured: data.configured[id] ?? 0 };
    });
  const one: Series[] = [{ key: "all", label: "all", hue: 1 }];
  const hh = (h: number) => String(h).padStart(2, "0");
  const zoneName = c.zone === "UTC" ? "UTC" : (c.zone.split("/").pop()?.replace(/_/g, " ") ?? c.zone);
  const common = { decimals: c.decimals, allLabels: c.allLabels, showValues: c.showValues };

  return (
    <>
      <p className="status-line">
        When new stories arrive, by day, week, or month, by hour of the day, and by day of the week, so the
        pipeline&apos;s rhythm is visible. A story counts at the moment it was created. Rewrites of the Latest in box
        are charted underneath.
      </p>
      {c.controls}
      <p className="sub flow-breadth">
        {breadth.map((b, i) => (
          <span key={b.id}>
            {i > 0 ? " · " : ""}
            <span className={`flow-swatch viz-${hueOf(b.id)}`} /> {b.id}: {b.stories} {b.stories === 1 ? "story" : "stories"} from {b.sources}{" "}
            {b.sources === 1 ? "source" : "sources"}
            {b.configured > 0 ? `, of ${b.configured} configured` : ""}
          </span>
        ))}
      </p>
      <Bars
        title={c.avg ? `New stories per ${c.by}, daily average` : `New stories per ${c.by}`}
        series={series}
        layout={c.multi}
        labelEvery={labelEveryFor(c.by, perBucket.size)}
        buckets={[...perBucket.entries()].map(([label, values]) => ({
          label,
          values: c.scale(values, c.daysIn.get(label) ?? 0),
          hint: `${c.by === "week" ? `week of ${label}` : label}${c.countNote(label)}`,
        }))}
        {...common}
      />
      <Bars
        title={`New stories by hour of day, ${zoneName}${c.avg ? ", daily average" : ""}`}
        series={series}
        layout={c.multi}
        labelEvery={3}
        buckets={byHour.map((values, h) => ({ label: `${hh(h)}:00`, values: c.scale(values, c.countedDays), hint: `${hh(h)}:00 to ${hh(h)}:59` }))}
        {...common}
      />
      <Bars
        title={c.avg ? "New stories by day of week, average per such day" : "New stories by day of week"}
        series={series}
        layout={c.multi}
        labelEvery={1}
        buckets={byDow.map((values, i) => ({ label: DOW_NAMES[i], values: c.scale(values, c.dowDays[i]), hint: `${DOW_NAMES[i]}${c.avg ? ` (${c.dowDays[i]} counted)` : ""}` }))}
        {...common}
      />
      <Bars
        title={c.avg ? `Latest in rewrites per ${c.by}, daily average` : `Latest in rewrites per ${c.by}`}
        series={one}
        labelEvery={labelEveryFor(c.by, rewritesPer.size)}
        buckets={[...rewritesPer.entries()].map(([label, value]) => ({ label, values: c.scale({ all: value }, c.daysIn.get(label) ?? 0), hint: c.by === "week" ? `week of ${label}` : label }))}
        {...common}
      />
      {data.rewrites.length === 0 ? <p className="org">Rewrite times start logging with the next change to the box.</p> : null}
    </>
  );
}
