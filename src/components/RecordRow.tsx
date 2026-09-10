"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { OnchainContent } from "@/components/OnchainContent";
import { VerifySeal, type VerifyResult } from "@/components/VerifySeal";

/**
 * A frozen day's onchain record. The label carries the one seal icon, which
 * fills blue once the browser check passes, and the check itself: Verify,
 * then Verified (reset / recheck). Under it, one row: the attestation on
 * EAS and its transaction on Base, the version count when there is one,
 * the json file. The hash, the version rows and the check's own report
 * open under all of it.
 */
export function RecordRow({
  date,
  uid,
  easHref,
  baseHref,
  downloadHref,
  hash,
  versionsLabel,
  versions,
}: {
  date: string;
  /** the attestation uid; absent when the day is sealed but not yet attested */
  uid?: string;
  easHref?: string;
  /** the attesting transaction on Basescan, or the attester's address for days sealed before the transaction was kept */
  baseHref?: string;
  downloadHref: string;
  hash: string;
  /** "v2 of 2" when the edition has been updated, with the rows it opens */
  versionsLabel?: string;
  versions?: ReactNode;
}) {
  const [showVersions, setShowVersions] = useState(false);
  const [decode, setDecode] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [result, setResult] = useState<VerifyResult>({ state: "idle", detail: "", work: [] });
  const [showWork, setShowWork] = useState(false);
  const verified = result.state === "ok";
  // through a recheck the last report stays on screen, its steps growing
  // in place, so the box never blinks empty
  const settled = result.state === "ok" || result.state === "bad" || result.state === "error";
  const rechecking = result.state === "working" && result.work.length > 0;
  const lastDetail = useRef("");
  if (settled) lastDetail.current = result.detail;
  // the check's words change width (Verify, then Verified (reset / recheck)),
  // so the slot around them is measured and the tab glides to the new width
  // in step with the seal filling in, instead of jumping
  const slotInner = useRef<HTMLSpanElement>(null);
  const [slotWidth, setSlotWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = slotInner.current;
    if (!el) return;
    const measure = () => setSlotWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <>
      <span className={`day-record-label${verified ? " verified" : ""}`}>
        <svg
          className={`seal-icon${verified ? " sealed" : ""}`}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>{" "}
        <span>Onchain record</span>
        {uid ? (
          <>
            <span className="record-sep">·</span>
            <span className="verify-slot" style={slotWidth != null ? { width: slotWidth } : undefined}>
              <span ref={slotInner} className="verify-slot-inner">
                <VerifySeal date={date} uid={uid} compact onResult={setResult} />
              </span>
            </span>{" "}
            <a href="/verify" className="hash-help" target="_blank" rel="noopener" title="How verification works, and how to check it without trusting this site">
              ?
            </a>
          </>
        ) : null}
      </span>
      <div className="day-colophon">
        <div className="record-row">
          {uid && easHref ? (
            <span>
              Attested this day&apos;s snapshot (
              <a href={downloadHref} title="This day's sealed json file">
                download json file
              </a>
              ,{" "}
              <button
                type="button"
                className="linklike record-toggle"
                onClick={() => setShowHash((v) => !v)}
                aria-expanded={showHash}
                title="The sha256 of the json file, the fingerprint the attestation records"
              >
                show hash
              </button>
              ) with{" "}
              <a href={easHref} rel="noopener" title={`The attestation on EAS. UID ${uid}`}>
                EAS
              </a>{" "}
              on{" "}
              {baseHref ? (
                <a href={baseHref} rel="noopener" title="The attesting transaction on Basescan">
                  Base
                </a>
              ) : (
                "Base"
              )}{" "}
              (
              <button
                type="button"
                className="linklike record-toggle"
                onClick={() => setDecode((v) => !v)}
                aria-expanded={decode}
                title="Read the sealed file straight out of the attestation on Base, decoded here"
              >
                decode
              </button>
              ).
            </span>
          ) : (
            <span>
              Sealed this day&apos;s snapshot (
              <a href={downloadHref} title="This day's sealed json file">
                download json file
              </a>
              ,{" "}
              <button
                type="button"
                className="linklike record-toggle"
                onClick={() => setShowHash((v) => !v)}
                aria-expanded={showHash}
                title="The sha256 of the json file"
              >
                show hash
              </button>
              ), attestation pending.
            </span>
          )}
          {versionsLabel && versions ? (
            <>
              <span className="record-sep">·</span>
              <button
                type="button"
                className="linklike record-toggle"
                onClick={() => setShowVersions((v) => !v)}
                aria-expanded={showVersions}
                title="Every version of this edition"
              >
                {versionsLabel}
              </button>
            </>
          ) : null}
        </div>
        {showHash ? (
          <div className="record-hash">
            Hash of json file: <span className="edition-hash">{hash}</span>{" "}
            <a href="/verify#sha256" className="hash-help" target="_blank" rel="noopener">
              ?
            </a>
          </div>
        ) : null}
        {decode && uid ? (
          <div className="record-body">
            <OnchainContent uid={uid} bare />
          </div>
        ) : null}
        {showVersions && versions ? <div className="record-body">{versions}</div> : null}
        {settled || rechecking ? (
          <div className={`record-verify ${result.state === "bad" ? "verify-bad" : result.state === "error" ? "verify-err" : "verify-detail"}`}>
            {settled ? result.detail : lastDetail.current}
            {result.work.length > 0 ? (
              <>
                {" "}
                <button type="button" className="linklike record-toggle" onClick={() => setShowWork((v) => !v)} title="The steps each verify run took, newest last">
                  {showWork ? "hide steps" : "show steps"}
                </button>
              </>
            ) : null}
            {showWork ? (
              <span className="verify-steps">
                {result.work.map((line, i) => (
                  <span key={i} className={`verify-step${line.startsWith("run ") ? " run" : ""}`}>
                    {line}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

