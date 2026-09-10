import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClusterCard } from "@/components/ClusterCard";
import { DigestEpisodes } from "@/components/DigestEpisodes";
import { RecordRow } from "@/components/RecordRow";
import { SummaryBlock } from "@/components/SummaryBlock";
import { loadSiteConfig } from "@/lib/config";
import { attestationTxFor } from "@/lib/eas";
import { loadDailyDigest, loadDailyDigestVersion, loadState } from "@/lib/state";
import { siteIdentity } from "@/lib/site";
import { parseSummaryLines, truncate } from "@/lib/util";

export const dynamic = "force-dynamic";

function dateLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const digest = await loadDailyDigest(date);
  if (!digest) return {};
  return {
    title: `${siteIdentity().siteName}, ${dateLabel(date)}`,
    description: digest.summary
      ? truncate(
          parseSummaryLines(digest.summary)
            .map((l) => l.text)
            .join(" "),
          250
        )
      : `The ${digest.clusters.length} stories that mattered on ${dateLabel(date)}.`,
  };
}

/** "Sun, Aug 30" for the walk-the-archive arrows. */
function shortLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const digest = await loadDailyDigest(date);
  if (!digest) notFound();
  const site = siteIdentity();
  const fcHandle = site.social?.farcasterHandle;
  // neighbors from the archive's own date list, so gaps are skipped honestly
  const days = [...((await loadState()).dailyDigestDates ?? [])].sort();
  const at = days.indexOf(date);
  const prev = at > 0 ? days[at - 1] : undefined;
  const next = at >= 0 && at < days.length - 1 ? days[at + 1] : undefined;
  const today = new Date().toISOString().slice(0, 10);
  // the attesting transaction: kept on the digest once the pipeline records
  // it, looked up once (and cached a day) for days sealed before that
  const attestationTx = digest.attestationTx ?? (digest.attestationUid ? await attestationTxFor(digest.attestationUid) : null);
  // the original freeze's own attestation: every later version records its
  // uid in the corrections list, but v1's lives only on the v1 file (or on
  // supersedesUid while v2 is the newest), so an updated day reads it there
  let v1Uid: string | undefined;
  if (digest.corrections && digest.corrections.length > 0) {
    v1Uid = (await loadDailyDigestVersion(date, 1))?.attestationUid;
    if (!v1Uid && digest.corrections.length === 1) v1Uid = digest.supersedesUid;
  }
  const versions = digest.corrections && digest.corrections.length > 0 ? digest.corrections.length + 1 : 0;
  const current = digest.version ?? 1;
  const dayStart = Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);

  return (
    <main className="wrap page single">
      <div>
        <div className="section-head">
          <div className="month-nav day-nav">
            <span>{prev ? <Link href={`/day/${prev}`}>← {shortLabel(prev)}</Link> : null}</span>
            <span className="day-nav-mid">
              <Link href="/archive/daily">Archive</Link>
              {date !== today ? (
                <>
                  <span className="record-sep">·</span>
                  <Link href={`/day/${today}`}>Today</Link>
                </>
              ) : null}
            </span>
            {next ? (
              <span>
                <Link href={`/day/${next}`}>{shortLabel(next)} →</Link>
              </span>
            ) : null}
          </div>
          <h1>
            {site.siteName}: {dateLabel(date)}
          </h1>
          {/* the day's onchain record: while the day runs it is the live state
              itself, dot and all; frozen, one line with the rest under details.
              Days sealed before attestations began have nothing to verify, so
              they carry no box */}
          {digest.inProgress || digest.attestationUid ? (
            <div className={`day-record${digest.inProgress ? " live" : " sealed"}`}>
              {digest.inProgress ? (
                <span className="day-record-label">
                  <span className="live-dot" aria-hidden="true" />
                  In progress
                </span>
              ) : null}
              {digest.inProgress ? (
                (() => {
                  // time left until the day freezes, fixed at render (the page
                  // is dynamic, so each load gets a fresh figure without a clock)
                  const left = Math.max(0, Math.round((dayStart + 86400 - Date.now() / 1000) / 60));
                  const h = Math.floor(left / 60);
                  const m = left % 60;
                  const wait = left === 0 ? "any minute now" : `in ${h > 0 ? `${h}h ` : ""}${m}m`;
                  return (
                    <div className="day-colophon">
                      <div>
                        Enters the <Link href="/archive/daily">daily archive</Link> {wait}, at midnight UTC.
                      </div>
                    </div>
                  );
                })()
              ) : (
                <RecordRow
                  date={date}
                  uid={digest.attestationUid}
                  easHref={digest.attestationUid ? `https://base.easscan.org/attestation/view/${digest.attestationUid}` : undefined}
                  baseHref={attestationTx ? `https://basescan.org/tx/${attestationTx}` : undefined}
                  downloadHref={`/day/${date}/edition.json`}
                  hash={digest.contentHash ?? ""}
                  versionsLabel={versions ? `v${current} of ${versions}` : undefined}
                  versions={
                    digest.corrections && digest.corrections.length > 0 ? (
                      // every version of this edition, newest first, one row each: the
                      // original is never edited in place, so the history is the record
                      <div className="updates">
                        <ul>
                          {[...digest.corrections].reverse().map((c) => (
                            <li key={c.version} title={`sha256 ${c.contentHash}`}>
                              <span className="upd-v">v{c.version}</span> {c.at.slice(0, 16).replace("T", " ")} UTC · {c.note} ·{" "}
                              <a href={c.version === current ? `/day/${date}/edition.json` : `/day/${date}/edition.json?v=${c.version}`}>file</a>
                              {c.attestationUid && c.version !== current ? (
                                <>
                                  {" · "}
                                  <a href={`https://base.easscan.org/attestation/view/${c.attestationUid}`} rel="noopener">
                                    attestation
                                  </a>
                                </>
                              ) : null}
                            </li>
                          ))}
                          <li title={digest.corrections[0]?.supersedes ? `sha256 ${digest.corrections[0].supersedes}` : undefined}>
                            <span className="upd-v">v1</span> {digest.takenAt.slice(0, 16).replace("T", " ")} UTC · the original freeze ·{" "}
                            <a href={`/day/${date}/edition.json?v=1`}>file</a>
                            {v1Uid ? (
                              <>
                                {" · "}
                                <a href={`https://base.easscan.org/attestation/view/${v1Uid}`} rel="noopener">
                                  attestation
                                </a>
                              </>
                            ) : null}
                          </li>
                        </ul>
                      </div>
                    ) : undefined
                  }
                />
              )}
            </div>
          ) : null}
          {(digest.castHash && fcHandle) || digest.tweetId ? (
            <p className={`day-colophon day-posted${digest.inProgress || digest.attestationUid ? "" : " unboxed"}`}>
              Posted to{" "}
              {digest.castHash && fcHandle ? (
                <a
                  href={`https://farcaster.xyz/${fcHandle}/${digest.castHash.slice(0, 10)}`}
                  rel="noopener"
                  title="This day's post on Farcaster"
                >
                  Farcaster
                </a>
              ) : null}
              {digest.castHash && fcHandle && digest.tweetId ? " and " : ""}
              {digest.tweetId ? (
                <a href={`https://x.com/i/web/status/${digest.tweetId}`} rel="noopener" title="This day's post on X">
                  X
                </a>
              ) : null}
              .
            </p>
          ) : null}
        </div>
        {digest.summary ? (
          <SummaryBlock
            sections={loadSiteConfig().sections.map((x) => ({ id: x.id, title: x.title }))}
            heading="The day in review"
            quietText="A quiet day here."
            text={digest.summary}
            storyHrefs={new Map(digest.clusters.map((c) => [c.id, `#s-${c.id}`]))}
          />
        ) : null}
        {digest.clusters.map((c) => (
          <ClusterCard key={c.id} cluster={c} showSection />
        ))}
        {digest.episodes && digest.episodes.length > 0 ? (
          <>
            {/* the id anchors the digest email's Podcasts heading link */}
            <h2 className="list-label" id="podcasts">Top podcasts this day</h2>
            <DigestEpisodes episodes={digest.episodes} idPrefix="day" />
          </>
        ) : null}
        {digest.alsoActive && digest.alsoActive.length > 0 ? (
          <>
            <h2 className="list-label">Also in the news this day</h2>
            <p className="sub">
              Stories that gathered new coverage this day but broke earlier, so they live on their own day&apos;s page.
            </p>
            <ul className="also-active">
              {digest.alsoActive.map((s) => (
                <li key={s.slug} className="newest-item">
                  <Link href={`/story/${s.slug}`}>{s.headline}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </main>
  );
}
