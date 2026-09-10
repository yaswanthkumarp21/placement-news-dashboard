/** Days shown on the daily index before the full archive takes over. */
export const RECENT_DAYS = 14;

/** "Thursday, July 23, 2026" from a YYYY-MM-DD UTC day. */
export function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "July 2026" from a YYYY-MM month key. */
export function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

export type DayEntry = { date: string; published: boolean };

/**
 * Every day from the newest edition back to the first, newest first, with
 * the days that never froze marked unpublished so the archive says so
 * instead of skipping them silently. `firstDay` (the site's configured
 * first edition, YYYY-MM-DD) is the floor: days before it appear only when
 * they were published, and without a firstDay no gap is ever marked, the
 * list is just the published days.
 */
export function withGaps(dates: string[], firstDay?: string): DayEntry[] {
  const have = new Set(dates);
  const sorted = [...have].sort();
  if (sorted.length === 0) return [];
  if (!firstDay) return sorted.reverse().map((date) => ({ date, published: true }));
  const out: DayEntry[] = [];
  const floor = sorted[0] < firstDay ? sorted[0] : firstDay;
  const t = new Date(`${sorted[sorted.length - 1]}T00:00:00Z`);
  for (;;) {
    const d = t.toISOString().slice(0, 10);
    if (d < floor) break;
    const published = have.has(d);
    if (published || d >= firstDay) out.push({ date: d, published });
    t.setUTCDate(t.getUTCDate() - 1);
  }
  return out;
}

/**
 * Group day entries (newest first) into month buckets, newest month first.
 * Only months that actually have entries appear, so paging never lands on
 * an empty page.
 */
export function monthsWithDays(entries: DayEntry[]): Array<{ month: string; days: DayEntry[] }> {
  const byMonth = new Map<string, DayEntry[]>();
  for (const e of entries) {
    const key = e.date.slice(0, 7);
    const bucket = byMonth.get(key);
    if (bucket) bucket.push(e);
    else byMonth.set(key, [e]);
  }
  return [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([month, days]) => ({ month, days }));
}
