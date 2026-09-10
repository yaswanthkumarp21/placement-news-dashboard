import Link from "next/link";
import { OnchainContent } from "@/components/OnchainContent";
import { TamperDemo } from "@/components/TamperDemo";
import { siteIdentity } from "@/lib/site";
import { loadDailyDigest, loadState } from "@/lib/state";

export const metadata = {
  title: "Verify an edition",
  description: "Every frozen edition is sealed in public the day it is published. Here is how anyone can check one.",
};

export const dynamic = "force-dynamic";

/** The most recent day whose edition carries an onchain seal, for the live demo. */
async function latestAttestedDay(): Promise<{ date: string; uid: string } | null> {
  const state = await loadState();
  for (const date of (state.dailyDigestDates ?? []).slice(0, 10)) {
    const d = await loadDailyDigest(date);
    if (d && !d.inProgress && d.attestationUid) return { date, uid: d.attestationUid };
  }
  return null;
}

/** House style for this copy: no em dashes, no semicolons. */
export default async function VerifyPage() {
  const demo = await latestAttestedDay();
  const site = siteIdentity();
  return (
    <main className="wrap page single roomy">
      <div className="prose">
        <h1>Verify an edition</h1>
        <p>
          Each day&apos;s frozen edition gets a fingerprint, called a SHA-256 hash. The same day, that fingerprint is
          written to a public record on Base. {site.siteName} cannot edit that record. If a past edition ever changed,
          the fingerprint would stop matching, and anyone could see it.
        </p>
        <p>
          The record proves the page was not changed after midnight. It does not prove the page was right. A story
          that was wrong on the day stays wrong in the record. What you read later is what was published that day.
        </p>

        <h2 id="sha256">What the hash is</h2>
        <p>
          A{" "}
          <a href="https://en.wikipedia.org/wiki/SHA-2" rel="noopener" target="_blank">
            SHA-256
          </a>{" "}
          hash is a 64 character code computed from a file. The same file always gives the same code. Change one
          character in the file and the code is completely different. The code cannot be turned back into the file,
          and no one can make a second file with the same code. So a code written to a public record the day an
          edition froze shows, later, that the file you have is the one that was sealed.
        </p>
        <p>
          The sealed file holds the date, the moment it froze, the day&apos;s top stories with their headline,
          explainer, section, source links, importance, and keywords, the day in review, and the day&apos;s podcast
          episodes. It is everything the day page shows, in one json file.
        </p>

        <h2>The quick check</h2>
        <p>
          On any <Link href="/archive/daily">archived day</Link> that was sealed, the onchain record has a{" "}
          <em>Verify</em> link. Your browser downloads the file, computes the hash, reads the public record on Base,
          and compares the two.
        </p>

        <h2>Updates</h2>
        <p>
          An edition can be updated after it freezes. Every update makes a new version with its own file, its own hash,
          and its own record on Base. The new record names the hash and record it replaced. Every earlier version stays
          on the day page, and each one can be downloaded and checked. The editor&apos;s note says why the change was
          made.
        </p>
        <p>
          An update is made for a factual error in a headline or explainer, a story that was later killed or merged, a
          wrong source or a dead link, or a story filed to the wrong section. Rewording and re-ranking do not count
          and are not done.
        </p>
        <h2>What the chain holds</h2>
        <p>
          Each record on Base carries the sealed file itself, not only its hash. The record is complete on its own.
          The reader below pulls the newest sealed day from EAS&apos;s public index and decodes the file out of the
          transaction.
        </p>
        {demo ? <OnchainContent uid={demo.uid} /> : null}
        <p>
          If you open the transaction on Basescan, the input data starts with a run of unreadable characters before
          the JSON. That is the transaction&apos;s ABI encoding, the function selector, field offsets, and the ids as
          raw bytes, shown as if it were text. The readable file follows it. The reader above decodes the same bytes.
        </p>
        <h2>Check it without trusting this site</h2>
        <p>
          The Verify link is a convenience. A site could show the word Verified whether or not the check passed. The
          hash and the record are on Base, where any node or block explorer can read them, and you can hash the file
          yourself.
        </p>
        <ol>
          <li>
            Download the sealed file (<em>download json file</em> in the onchain record).
          </li>
          <li>
            Windows: <code>Get-FileHash edition-2026-08-28.json -Algorithm SHA256</code>
            <br />
            Mac or Linux: <code>shasum -a 256 edition-2026-08-28.json</code>
          </li>
          <li>
            Compare the output with the hash on the day page (<em>show hash</em> in the onchain record) and with the
            record on EAS.
          </li>
        </ol>
        <p>Hash the file exactly as downloaded. Saving it again from an editor can change the bytes.</p>

        {demo ? (
          <>
            <h2>Try changing the file</h2>
            <TamperDemo date={demo.date} uid={demo.uid} />
          </>
        ) : null}
      </div>
    </main>
  );
}
