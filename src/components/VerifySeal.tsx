"use client";

import { useEffect, useRef, useState } from "react";

/** Browser-native sha256 of a string, hex. The same math as the freeze-time hasher. */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The sealed hash and seal time for an attestation, read from EAS's public index (not from this site). */
export async function sealedRecord(uid: string): Promise<{ hash: string; sealedAt: string } | null> {
  const res = await fetch("https://base.easscan.org/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: "query($id:String!){ attestation(where:{id:$id}){ decodedDataJson timeCreated } }",
      variables: { id: uid },
    }),
  });
  const att = (await res.json())?.data?.attestation;
  if (!att) return null;
  const decoded = JSON.parse(att.decodedDataJson) as Array<{ name: string; value: { value: unknown } }>;
  const hash = String(decoded.find((d) => d.name === "contentHash")?.value?.value ?? "").replace(/^0x/, "");
  if (!hash) return null;
  // "29 Aug 2026 18:50:30 UTC": comma-free and exact to the second
  const [, day, month, year, time] = new Date(att.timeCreated * 1000).toUTCString().split(" ");
  return { hash, sealedAt: `${Number(day)} ${month} ${year} ${time} UTC` };
}

/**
 * One-click verification: re-hash the frozen edition in THIS browser and
 * compare against the seal on Base, read via EAS's public index rather than
 * anything this site stores. The reader sees a check mark and a sentence; the
 * math underneath is the real thing, inspectable in devtools.
 */
export interface VerifyResult {
  state: "idle" | "working" | "ok" | "bad" | "error";
  detail: string;
  work: string[];
}

export function VerifySeal({
  date,
  uid,
  label = "Verify this edition",
  help = true,
  row = false,
  icon = true,
  onState,
  compact = false,
  onResult,
}: {
  date: string;
  uid: string;
  label?: string;
  help?: boolean;
  /** inside the record row: Verified and its links stay on the row, the rest drops under it */
  row?: boolean;
  /** draw the seal icon here; the record box draws its own single icon instead */
  icon?: boolean;
  /** told every state change, so a parent can show the seal filling in */
  onState?: (state: "idle" | "working" | "ok" | "bad" | "error") => void;
  /** render only the check word and its links; the parent shows the report via onResult */
  compact?: boolean;
  onResult?: (r: VerifyResult) => void;
}) {
  const [state, setState] = useState<"idle" | "working" | "ok" | "bad" | "error">("idle");
  const [detail, setDetail] = useState("");
  const [work, setWork] = useState<string[]>([]);
  const [showWork, setShowWork] = useState(false);
  // the last settled outcome, shown through a recheck
  const lastDone = useRef<"ok" | "bad" | "error">("ok");
  useEffect(() => {
    if (state === "ok" || state === "bad" || state === "error") lastDone.current = state;
  }, [state]);
  useEffect(() => {
    onState?.(state);
    onResult?.({ state, detail, work });
    // the parent's callback identity may change every render; the state is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, detail, work]);
  // back to the untouched state, work log and all, so someone can be shown
  // the check from the start without reloading the page
  const reset = () => {
    setState("idle");
    setDetail("");
    setWork([]);
    setShowWork(false);
  };

  const run = async () => {
    setState("working");
    setDetail("");
    const runNumber = work.filter((l) => l.startsWith("run ")).length + 1;
    const lines: string[] = [`run ${runNumber} · ${new Date().toUTCString().slice(17, 25)} UTC`];
    const finish = () => setWork((prev) => [...prev, ...lines]);
    // the fetches often finish in a couple hundred milliseconds, too fast to
    // register as a check, so the checking state holds for at least 800ms;
    // any longer and it reads as a spinner for show
    const startedAt = Date.now();
    try {
      const [fileText, record] = await Promise.all([
        fetch(`/day/${date}/edition.json`).then((r) => r.text()),
        sealedRecord(uid),
      ]);
      await new Promise((r) => setTimeout(r, Math.max(0, 800 - (Date.now() - startedAt))));
      lines.push(`fetched /day/${date}/edition.json · ${new TextEncoder().encode(fileText).length} bytes`);
      if (!record) {
        lines.push("could not reach base.easscan.org for the sealed hash");
        finish();
        setState("error");
        setDetail("Could not reach the public record. The do-it-yourself steps on /verify work without it.");
        return;
      }
      const recomputed = await sha256Hex(fileText);
      lines.push(`sha256 of those bytes in this browser: ${recomputed}`);
      lines.push(`sealed hash read from base.easscan.org: ${record.hash}`);
      lines.push(recomputed === record.hash ? "compare: match" : "compare: MISMATCH");
      finish();
      if (recomputed === record.hash) {
        setState("ok");
        setDetail(`Hash matches ${record.sealedAt} onchain attestation.`);
      } else {
        setState("bad");
        setDetail("This content does not match the sealed record. Either the edition changed after sealing or the tooling has a bug. Use the do-it-yourself steps on /verify to confirm independently.");
      }
    } catch {
      lines.push("something failed before the comparison");
      finish();
      setState("error");
      setDetail("Something failed while checking. The do-it-yourself steps on /verify work without this button.");
    }
  };

  const seal = (
    <svg
      className="seal-icon"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
  if (compact) {
    // the check word and its links only; the report is the parent's to show.
    // A recheck keeps the done layout and swaps only the word, so nothing
    // around it jumps while the check runs.
    const rechecking = state === "working" && work.length > 0;
    if (!rechecking && (state === "idle" || state === "working")) {
      return (
        <button type="button" className="linklike verify-compact" onClick={run} disabled={state === "working"}>
          {state === "working" ? "checking…" : label === "Verify this edition" ? "Verify" : label}
        </button>
      );
    }
    const shown = rechecking ? lastDone.current : state;
    return (
      <span className={`verify-compact-done${shown === "ok" ? " verify-ok" : " verify-bad"}`}>
        <span className="verify-static">{shown === "ok" ? "Verified" : "Failed"}</span> (
        <button type="button" className="linklike verify-reset" onClick={reset} title="Back to the unverified state" disabled={rechecking}>
          reset
        </button>{" "}
        /{" "}
        <button type="button" className="linklike verify-reset" onClick={run} title="Run the check again" disabled={rechecking}>
          {rechecking ? "checking…" : "recheck"}
        </button>
        )
      </span>
    );
  }
  return (
    <span className={`verify-seal${state === "ok" ? " sealed" : ""}${row ? " inrow" : ""}`}>
      {state === "ok" ? (
        // Verified is a fact, not a control: reset and check again are the
        // links; the sentence with the match is its own line
        <>
          <span className="verify-ok">
            {icon ? <>{seal} </> : null}<span className="verify-static">Verified</span>{" "}
            (
            <button type="button" className="linklike verify-reset" onClick={reset} title="Back to the unverified state">
              reset
            </button>
            ,{" "}
            <button type="button" className="linklike verify-reset" onClick={run} title="Run the check again">
              check again
            </button>
            )
          </span>
          <span className="verify-detail">
            {detail}
            {work.length > 0 ? (
              <>
                {" "}
                <button
                  type="button"
                  className="linklike verify-work-toggle"
                  onClick={() => setShowWork((s) => !s)}
                  title="The steps each verify run took, newest last"
                >
                  <span className="verify-word">{showWork ? "hide" : "show"}</span> {showWork ? "▴" : "▾"}
                </button>
              </>
            ) : null}
          </span>
        </>
      ) : (
        <button type="button" className="linklike verify-idle" onClick={run} disabled={state === "working"}>
          {icon ? <>{seal} </> : null}<span className="verify-word">{state === "working" ? "checking…" : label}</span>
        </button>
      )}
      {help ? (
        <>
          {" "}
          <a href="/verify" className="verify-help" title="How verification works (opens in a new tab)" target="_blank" rel="noopener">
            ?
          </a>
        </>
      ) : null}
      {state === "bad" ? <span className="verify-bad"> ✗ {detail}</span> : null}
      {state === "error" ? <span className="verify-err"> {detail}</span> : null}
      {work.length > 0 && state !== "ok" ? (
        <>
          {" "}
          <button
            type="button"
            className="linklike verify-work-toggle"
            onClick={() => setShowWork((s) => !s)}
            title="The steps each verify run took, newest last"
          >
            <span className="verify-word">{showWork ? "hide" : "show"}</span> {showWork ? "▴" : "▾"}
          </button>
        </>
      ) : null}
      {state === "bad" || state === "error" ? (
        <>
          {" "}
          <button type="button" className="linklike verify-reset" onClick={reset} title="Back to the unverified state">
            <span className="verify-word">reset</span>
          </button>
        </>
      ) : null}
      {showWork && work.length > 0 ? (
        <span className="verify-steps">
          {work.map((line, i) => (
            <span key={i} className={`verify-step${line.startsWith("run ") ? " run" : ""}`}>
              {line}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
