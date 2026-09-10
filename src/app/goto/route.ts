import { NextRequest, NextResponse } from "next/server";
import { loadState } from "@/lib/state";

export const dynamic = "force-dynamic";

/**
 * Time-travel resolver behind the header's date picker. Accepts
 * ?t=<ISO datetime> and redirects to the archived front-page snapshot that
 * was showing at that instant (the newest snapshot at or before it, or the
 * oldest one when the moment predates the archive).
 */

function snapshotTime(id: string): number {
  // YYMMDD-HHMM (UTC)
  return Date.parse(`20${id.slice(0, 2)}-${id.slice(2, 4)}-${id.slice(4, 6)}T${id.slice(7, 9)}:${id.slice(9, 11)}:00Z`);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const state = await loadState();
  let target = Number.NaN;
  let asked: string | null = null;

  // a calendar day goes to its edition page when one exists (or today's page
  // in progress); a day before the archive falls through to the snapshot
  // resolver at that day's end
  const day = q.get("day");
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const today = new Date().toISOString().slice(0, 10);
    if (day === today || (state.dailyDigestDates ?? []).includes(day)) {
      return NextResponse.redirect(new URL(`/day/${day}`, req.url));
    }
    target = Date.parse(`${day}T23:59:00Z`);
    asked = `t-${new Date(target).toISOString()}`;
  }

  const t = q.get("t");
  if (t) {
    target = Date.parse(t);
    // what was asked for, echoed to the snapshot page so the reader can see
    // their request resolved (the snapshot's own timestamp will differ a little)
    if (!Number.isNaN(target)) asked = `t-${new Date(target).toISOString()}`;
  }
  if (Number.isNaN(target) || !asked) return NextResponse.redirect(new URL("/", req.url));

  const ids = [...state.snapshots].sort();
  if (ids.length === 0) return NextResponse.redirect(new URL("/", req.url));
  const atOrBefore = ids.filter((id) => snapshotTime(id) <= target);
  const dest = atOrBefore.length > 0 ? atOrBefore[atOrBefore.length - 1] : ids[0];
  return NextResponse.redirect(new URL(`/${dest}?req=${encodeURIComponent(asked)}`, req.url));
}
