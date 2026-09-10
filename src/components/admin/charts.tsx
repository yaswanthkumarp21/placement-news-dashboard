"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The admin's shared chart kit: one control bar (window, bucket, clock,
 * totals or averages, which days count, detail) and one bar chart that
 * draws a single series, a stack, side by side bars, or an inner bar,
 * so every data page reads with the same controls and the same marks.
 */

export type Zone = string;

/** hour of day, weekday, and calendar day of an instant in a zone, without a date library */
export function parts(iso: string, zone: Zone): { hour: number; dow: number; day: string } {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", hour12: false, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return { hour: Number(p.hour) % 24, dow: DOW_NAMES.indexOf(p.weekday), day: `${p.year}-${p.month}-${p.day}` };
}

export const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** nth weekday (0 Sun to 6 Sat) of a month, as YYYY-MM-DD; n < 0 counts from the end */
function nthWeekday(year: number, month: number, dow: number, n: number): string {
  const days: string[] = [];
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(Date.UTC(year, month - 1, d));
    if (dt.getUTCMonth() !== month - 1) break;
    if (dt.getUTCDay() === dow) days.push(dt.toISOString().slice(0, 10));
  }
  return n > 0 ? days[n - 1] : days[days.length + n];
}

/**
 * The days when news and business slow, the day itself (observed shifts
 * ignored): the US federal holidays people actually take, plus Black
 * Friday, Christmas Eve, and New Year's Eve. Columbus Day and Veterans Day
 * are left out, since markets and newsrooms run as normal on both. The
 * site's own list for now; a per-holiday picker can replace it.
 */
export function holidaysFor(year: number): Map<string, string> {
  const y = String(year);
  const thanksgiving = nthWeekday(year, 11, 4, 4);
  const blackFriday = new Date(`${thanksgiving}T00:00:00Z`);
  blackFriday.setUTCDate(blackFriday.getUTCDate() + 1);
  return new Map([
    [`${y}-01-01`, "New Year's Day"],
    [nthWeekday(year, 1, 1, 3), "MLK Day"],
    [nthWeekday(year, 2, 1, 3), "Presidents' Day"],
    [nthWeekday(year, 5, 1, -1), "Memorial Day"],
    [`${y}-06-19`, "Juneteenth"],
    [`${y}-07-04`, "Independence Day"],
    [nthWeekday(year, 9, 1, 1), "Labor Day"],
    [thanksgiving, "Thanksgiving"],
    [blackFriday.toISOString().slice(0, 10), "Black Friday"],
    [`${y}-12-24`, "Christmas Eve"],
    [`${y}-12-25`, "Christmas"],
    [`${y}-12-31`, "New Year's Eve"],
  ]);
}

export interface Series {
  key: string;
  label: string;
  hue: number;
}

export interface Bucket {
  label: string;
  hint?: string;
  /** count per series key; a single-series chart has one key */
  values: Record<string, number>;
}

/**
 * A row of bars sharing the width, values on hover, sparse labels by
 * default. Layouts: "stacked" piles the series, "beside" draws one thin bar
 * per series so heights compare, "inner" draws the second series as a
 * darker bar inside the first (distinct callers inside hits), and a single
 * series is just bars.
 */
export function Bars({
  buckets,
  series,
  labelEvery,
  title,
  sub,
  layout = "stacked",
  decimals = 0,
  allLabels = false,
  showValues = false,
  height = 48,
  legend = true,
}: {
  buckets: Bucket[];
  series: Series[];
  labelEvery?: number;
  title?: string;
  sub?: ReactNode;
  layout?: "stacked" | "beside" | "inner";
  decimals?: number;
  allLabels?: boolean;
  showValues?: boolean;
  height?: number;
  legend?: boolean;
}) {
  const H = height;
  const totalOf = (b: Bucket) => (layout === "inner" ? b.values[series[0].key] ?? 0 : series.reduce((a, s) => a + (b.values[s.key] ?? 0), 0));
  const stacked = series.length > 1 && layout === "stacked";
  const beside = series.length > 1 && layout === "beside";
  const inner = series.length > 1 && layout === "inner";
  const max = Math.max(1, ...buckets.map((b) => (beside ? Math.max(...series.map((s) => b.values[s.key] ?? 0)) : totalOf(b))));
  const total = buckets.reduce((a, b) => a + totalOf(b), 0);
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
  const many = series.length > 1;
  return (
    <div className="flow-chart">
      {title ? (
        <div className="sub">
          {title} · {decimals > 0 ? `${fmt(total / Math.max(1, buckets.filter((b) => totalOf(b) > 0).length))} average across buckets` : `${fmt(total)} total`}
        </div>
      ) : null}
      {sub ? <div className="sub">{sub}</div> : null}
      <div className={`bars-row${beside ? " bars-row-grouped" : ""}${allLabels && buckets.length > 16 ? " bars-row-tall" : ""}${showValues ? " bars-row-valued" : ""}`}>
        {buckets.map((b, i) => {
          const show = allLabels ? true : labelEvery ? i % labelEvery === 0 : i === 0 || i === buckets.length - 1 || b.label.endsWith("-01");
          const t = totalOf(b);
          const hint = many ? `${b.hint ?? b.label}: ${fmt(t)}\n${series.map((s) => `${s.label}: ${fmt(b.values[s.key] ?? 0)}`).join("\n")}` : `${b.hint ?? b.label}: ${fmt(t)}`;
          return (
            <div key={b.label} className={`bars-col${beside ? " bars-col-wide" : ""}`} title={hint}>
              {showValues && beside && buckets.length <= 24 ? (
                <div className="bars-values">
                  {series.map((s) => (
                    <span key={s.key} className="bars-value">
                      {(b.values[s.key] ?? 0) > 0 ? fmt(b.values[s.key] ?? 0) : ""}
                    </span>
                  ))}
                </div>
              ) : showValues ? (
                <div className="bars-value">{t > 0 ? fmt(t) : ""}</div>
              ) : null}
              {beside ? (
                <div className="bars-group" style={{ height: H }}>
                  {series.map((s) => (
                    <div key={s.key} className={`bars-mini viz-${s.hue}`} style={{ height: `${((b.values[s.key] ?? 0) / max) * H}px` }} />
                  ))}
                </div>
              ) : stacked ? (
                <div className="viz-bar" style={{ height: H }}>
                  {series
                    .filter((s) => (b.values[s.key] ?? 0) > 0)
                    .map((s) => (
                      <div key={s.key} className={`viz-seg viz-${s.hue}`} style={{ height: `${((b.values[s.key] ?? 0) / max) * H}px` }} />
                    ))}
                </div>
              ) : inner ? (
                <div className="bars-bar" style={{ height: H }}>
                  <div className="all" style={{ height: `${((b.values[series[0].key] ?? 0) / max) * H}px` }} />
                  <div className="conf" style={{ height: `${((b.values[series[1].key] ?? 0) / max) * H}px` }} />
                </div>
              ) : (
                <div className="bars-bar" style={{ height: H }}>
                  <div className="conf" style={{ height: `${(t / max) * H}px` }} />
                </div>
              )}
              <div className={`bars-label${allLabels && buckets.length > 16 ? " bars-label-side" : ""}`}>{show ? b.label.replace(/^\d{4}-/, "") : " "}</div>
            </div>
          );
        })}
      </div>
      {legend && (stacked || beside) ? (
        <div className="viz-legend">
          {series.map((s) => (
            <span key={s.key} className="viz-key">
              <span className={`flow-swatch viz-${s.hue}`} /> {s.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type Window = 7 | 14 | 30 | 90 | 365;
export type By = "day" | "week" | "month";
export type Layout = "combined" | "stacked" | "beside";

export interface ChartControlsState {
  days: Window;
  by: By;
  zone: Zone;
  layout: Layout;
  avg: boolean;
  decimals: number;
  dows: Set<number>;
  skipHolidays: boolean;
  allLabels: boolean;
  showValues: boolean;
  /** whether a calendar day counts under the day filters */
  counted: (day: string, dow: number) => boolean;
  /** the bucket a day falls in under the current "per" */
  bucketOf: (day: string, dow: number) => string;
  /** every bucket in the window, oldest first, with the counted days each holds so far */
  bucketKeys: string[];
  daysIn: Map<string, number>;
  dowDays: number[];
  countedDays: number;
  /** the hint suffix for a bucket under averages */
  countNote: (key: string) => string;
  /** divide by n under averages, leave alone under totals */
  scale: (values: Record<string, number>, n: number) => Record<string, number>;
  /** the bar layout for a multi-series chart */
  multi: "stacked" | "beside";
  /** the control bar itself */
  controls: ReactNode;
}

/**
 * The shared control bar and everything derived from it. `clock` is off
 * for data that only exists per UTC day (the distribution counters), on
 * for data with real timestamps. `extraRows` slot in a page's own rows,
 * such as Flow's sections.
 */
export function useChartControls(opts: { clock: boolean; extraRows?: ReactNode; windows?: Window[]; layouts?: boolean }): ChartControlsState {
  const [days, setDays] = useState<Window>(30);
  const [by, setBy] = useState<By>("day");
  const [layout, setLayout] = useState<Layout>("combined");
  const [show, setShow] = useState<"totals" | "average">("totals");
  const [dows, setDows] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));
  const [skipHolidays, setSkipHolidays] = useState(false);
  const [allLabels, setAllLabels] = useState(false);
  const [showValues, setShowValues] = useState(false);

  // the clock: the browser's own zone once known, UTC, or any named zone
  // remembered in this browser
  const [local, setLocal] = useState<string>("UTC");
  const [zone, setZoneState] = useState<Zone>("UTC");
  const [zones, setZones] = useState<string[]>([]);
  const [custom, setCustom] = useState<string>("");
  useEffect(() => {
    if (!opts.clock) return;
    let mine = "UTC";
    try {
      const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (z && z !== "UTC") mine = z;
    } catch {}
    setLocal(mine);
    let picked = mine;
    try {
      const saved = localStorage.getItem("flow-zone");
      if (saved) {
        picked = saved;
        if (saved !== mine && saved !== "UTC") setCustom(saved);
      }
    } catch {}
    setZoneState(picked);
    try {
      const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
      setZones(all);
    } catch {}
  }, [opts.clock]);
  const setZone = (z: string) => {
    setZoneState(z);
    try {
      localStorage.setItem("flow-zone", z);
    } catch {}
  };
  const city = (z: string) => z.split("/").pop()?.replace(/_/g, " ") ?? z;

  const since = Date.now() - days * 86400000;
  const holidays = new Map<string, string>();
  for (const y of new Set([new Date(since).getUTCFullYear(), new Date().getUTCFullYear()])) for (const [d, n] of holidaysFor(y)) holidays.set(d, n);
  const counted = (day: string, dow: number) => dows.has(dow) && !(skipHolidays && holidays.has(day));
  const bucketOf = (day: string, dow: number) => {
    if (by === "day") return day;
    if (by === "month") return day.slice(0, 7);
    const d = new Date(`${day}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((dow + 1) % 7));
    return d.toISOString().slice(0, 10);
  };
  const bucketKeys: string[] = [];
  const daysIn = new Map<string, number>();
  const dowDays = Array.from({ length: 7 }, () => 0);
  let countedDays = 0;
  const skipped: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const p = parts(new Date(Date.now() - i * 86400000).toISOString(), zone);
    const key = bucketOf(p.day, p.dow);
    if (!daysIn.has(key)) {
      bucketKeys.push(key);
      daysIn.set(key, 0);
    }
    if (skipHolidays && dows.has(p.dow) && holidays.has(p.day)) skipped.push(`${holidays.get(p.day)} (${p.day.slice(5)})`);
    if (counted(p.day, p.dow)) {
      daysIn.set(key, (daysIn.get(key) ?? 0) + 1);
      dowDays[p.dow] += 1;
      countedDays += 1;
    }
  }
  const avg = show === "average";
  const scale = (values: Record<string, number>, n: number) =>
    avg ? Object.fromEntries(Object.entries(values).map(([k, v]) => [k, n > 0 ? v / n : 0])) : values;
  const countNote = (key: string) => (avg ? ` (${daysIn.get(key) ?? 0} counted days)` : "");

  const chip = (on: boolean, label: string, onClick: () => void, title?: string) => (
    <button key={label} type="button" className={`filter-chip${on ? " on" : ""}`} onClick={onClick} title={title}>
      {label}
    </button>
  );
  const windows = opts.windows ?? [7, 30, 90, 365];
  const controls = (
    <div className="flow-filters">
      <div className="flow-filter-row">
        <span className="filter-label">Window</span>
        <span>{windows.map((d) => chip(days === d, d === 365 ? "a year" : `${d} days`, () => setDays(d)))}</span>
      </div>
      <div className="flow-filter-row">
        <span className="filter-label">Per</span>
        <span>
          {chip(by === "day", "day", () => setBy("day"))}
          {chip(by === "week", "week", () => setBy("week"), "Saturday to Friday, the site's week, labeled by its Saturday")}
          {chip(by === "month", "month", () => setBy("month"))}
        </span>
      </div>
      {opts.extraRows}
      {opts.layouts !== false ? (
        <div className="flow-filter-row">
          <span className="filter-label">Draw</span>
          <span>
            {chip(layout === "combined", "combined", () => setLayout("combined"), "one bar per bucket, the series added together")}
            {chip(layout === "stacked", "stacked", () => setLayout("stacked"), "one bar per bucket, the series piled in it")}
            {chip(layout === "beside", "side by side", () => setLayout("beside"), "one thin bar per series in each bucket, heights comparable")}
          </span>
        </div>
      ) : null}
      {opts.clock ? (
        <div className="flow-filter-row">
          <span className="filter-label">Clock</span>
          <span>
            {chip(zone === local && local !== "UTC", local === "UTC" ? "local" : `local (${city(local)})`, () => setZone(local), "the clock this browser is on")}
            {chip(zone === "UTC", "UTC", () => setZone("UTC"))}
            {chip(
              zone !== "UTC" && zone !== local,
              custom && zone === custom ? `other (${city(custom)})` : "other",
              () => {
                if (custom) setZone(custom);
                else setCustom(zones[0] ?? "Europe/London");
              },
              "any named zone, remembered in this browser"
            )}
            {custom || (zone !== "UTC" && zone !== local) ? (
              <select
                value={zone !== "UTC" && zone !== local ? zone : custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  setZone(e.target.value);
                }}
              >
                {(zones.length > 0 ? zones : [custom]).map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            ) : null}
          </span>
        </div>
      ) : null}
      <div className="flow-filter-row">
        <span className="filter-label">Show</span>
        <span>
          {chip(show === "totals", "totals", () => setShow("totals"))}
          {chip(show === "average", "daily average", () => setShow("average"), "each bar divided by the counted days in it, so a half month compares with a whole one")}
        </span>
      </div>
      <div className="flow-filter-row">
        <span className="filter-label">Days</span>
        <span>
          {chip(dows.size === 7, "all", () => setDows(new Set([0, 1, 2, 3, 4, 5, 6])))}
          {chip(dows.size === 5 && !dows.has(0) && !dows.has(6), "weekdays", () => setDows(new Set([1, 2, 3, 4, 5])))}
          {chip(dows.size === 2 && dows.has(0) && dows.has(6), "weekends", () => setDows(new Set([0, 6])))}
          <span className="flow-filter-gap" />
          {DOW_NAMES.map((n, i) =>
            chip(dows.has(i), n, () =>
              setDows((prev) => {
                const next = new Set(prev);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              })
            )
          )}
          <span className="flow-filter-gap" />
          {chip(skipHolidays, "exclude holidays", () => setSkipHolidays((v) => !v), "leave out the days when news and business slow, the day itself; the list is the site's own for now")}
          {skipHolidays ? <span className="org flow-filter-hint">{skipped.length > 0 ? `excluding ${skipped.join(", ")}` : "none fall in this window"}</span> : null}
        </span>
      </div>
      <div className="flow-filter-row">
        <span className="filter-label">Detail</span>
        <span>
          {chip(!allLabels, "sparse axis", () => setAllLabels(false), "labels at the ends and each new month")}
          {chip(allLabels, "label every bar", () => setAllLabels(true), "every bucket labeled, sideways when there are many")}
          <span className="flow-filter-gap" />
          {chip(showValues, "values on bars", () => setShowValues((v) => !v), "print each bar's number above it: one per series side by side when there are 24 buckets or fewer, else the bucket's total")}
        </span>
      </div>
    </div>
  );

  return {
    days,
    by,
    zone,
    layout,
    avg,
    decimals: avg ? 1 : 0,
    dows,
    skipHolidays,
    allLabels,
    showValues,
    counted,
    bucketOf,
    bucketKeys,
    daysIn,
    dowDays,
    countedDays,
    countNote,
    scale,
    multi: layout === "beside" ? "beside" : "stacked",
    controls,
  };
}

/** the label spacing for a per-bucket chart: sparse for days, every bucket for months, every few weeks */
export function labelEveryFor(by: By, count: number): number | undefined {
  return by === "day" ? undefined : by === "month" ? 1 : count <= 16 ? 1 : 4;
}
