"use client";

import { useEffect, useState } from "react";

/**
 * Reads what an attestation on Base actually carries, straight from EAS's
 * public index rather than from this site: the edition label, the hash, the
 * hash it supersedes, and the sealed file itself, decoded from the bytes in
 * the calldata. This is how a reader sees with their own eyes that the
 * record on the chain contains the edition, not just a fingerprint of it.
 */
export function OnchainContent({ uid, bare = false }: { uid: string; bare?: boolean }) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  // a field can carry a link to the explorer page where a reader cross-checks
  // it by hand, so this page is never the only witness to what it shows
  const [fields, setFields] = useState<Array<{ name: string; value: string; href?: string; hint?: string }>>([]);
  const [content, setContent] = useState<{ bytes: number; text: string; pretty: string } | null>(null);
  const [error, setError] = useState("");
  // bare: the parent opened us, so read at once
  useEffect(() => {
    if (bare && state === "idle") void read();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bare]);

  const read = async () => {
    setState("working");
    setError("");
    try {
      const res = await fetch("https://base.easscan.org/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: "query($id:String!){ attestation(where:{id:$id}){ decodedDataJson timeCreated attester refUID txid } }",
          variables: { id: uid },
        }),
      });
      const att = (await res.json())?.data?.attestation;
      if (!att) throw new Error("no attestation found at that id");
      const decoded = JSON.parse(att.decodedDataJson) as Array<{ name: string; value: { value: unknown } }>;
      const out: Array<{ name: string; value: string; href?: string; hint?: string }> = [];
      let file: { bytes: number; text: string; pretty: string } | null = null;
      for (const d of decoded) {
        const v = d.value?.value;
        // the edition label and the hash are on the page already, and an
        // all-zero supersedes means nothing was replaced
        if (d.name === "edition" || d.name === "contentHash") continue;
        if (d.name === "supersedes" && typeof v === "string" && /^0x0+$/.test(v)) continue;
        if (d.name === "content" && typeof v === "string" && v.startsWith("0x")) {
          const hex = v.slice(2);
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
          const text = new TextDecoder().decode(bytes);
          let pretty = text;
          try {
            pretty = JSON.stringify(JSON.parse(text), null, 2);
          } catch {}
          file = { bytes: bytes.length, text, pretty };
          continue;
        }
        out.push({ name: d.name, value: typeof v === "string" ? v : JSON.stringify(v) });
      }
      out.unshift({ name: "attester", value: String(att.attester), href: `https://basescan.org/address/${att.attester}`, hint: "every attestation this site has ever made, on Basescan" });
      if (att.refUID && !/^0x0+$/.test(att.refUID)) {
        out.push({ name: "replaces attestation", value: String(att.refUID), href: `https://base.easscan.org/attestation/view/${att.refUID}`, hint: "the earlier version this one supersedes, on EAS scan" });
      }
      if (att.txid) {
        out.unshift({ name: "transaction", value: String(att.txid), href: `https://basescan.org/tx/${att.txid}`, hint: "the transaction on Basescan. Under More details, set View input as to UTF-8 and the file reads out of the raw data" });
      }
      setFields(out);
      setContent(file);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("error");
    }
  };

  const body = (
    <>
      {state === "working" ? <p className="org">reading the chain…</p> : null}
      {state === "error" ? <p className="verify-err">Could not read it: {error}</p> : null}
      {state === "done" ? (
        <>
          {content ? <pre className="onchain-pre">{content.pretty}</pre> : null}
          <p className="org onchain-how">
            {content ? `${content.bytes.toLocaleString("en-US")} bytes, decoded from ` : "This attestation carries the hash only (sealed before the file itself rode along, 2026-09-03). "}
            {fields
              .filter((f) => f.href)
              .map((f, i) => (
                <span key={f.name}>
                  {i > 0 ? (f.name === "attester" ? " sent by the " : ", ") : ""}
                  <a href={f.href} rel="noopener" target="_blank" title={`${f.value}. ${f.hint ?? ""}`}>
                    {f.name === "transaction" ? "the transaction" : f.name === "attester" ? "attester" : f.name}
                  </a>
                </span>
              ))}
            {content
              ? ". To read it by hand, open the transaction on Basescan, choose View input as UTF-8 under More details, and it reads out of the raw data after a run of unreadable characters, which is the transaction's own encoding, not damage."
              : ""}
          </p>
        </>
      ) : null}
    </>
  );
  if (bare) {
    const tx = fields.find((f) => f.name === "transaction");
    return (
      <div className="onchain-bare">
        {state === "working" ? <p className="org">reading the chain…</p> : null}
        {state === "error" ? <p className="verify-err">Could not read it: {error}</p> : null}
        {state === "done" ? (
          <>
            <p className="org onchain-from">
              Read from transaction{" "}
              {tx ? (
                <a href={tx.href} rel="noopener" target="_blank" title={tx.value}>
                  {tx.value.slice(0, 10)}…
                </a>
              ) : (
                "on Base"
              )}{" "}
              on Base{content ? `, ${content.bytes.toLocaleString("en-US")} bytes, decoded in your browser` : ""}.
            </p>
            {content ? <pre className="onchain-pre">{content.pretty}</pre> : <p className="org">This attestation carries the hash only.</p>}
            <p className="org onchain-how">
              To read it by hand, open the transaction on Basescan, choose View input as UTF-8 under More details, and the same
              text reads out of the raw data after a run of unreadable characters, which is the transaction&apos;s own encoding.
            </p>
          </>
        ) : null}
      </div>
    );
  }
  return (
    <details
      className="onchain-content"
      onToggle={(e) => {
        // one dropdown: opening it reads the chain, and everything shows at once
        if ((e.currentTarget as HTMLDetailsElement).open && state === "idle") void read();
      }}
    >
      <summary>read from chain</summary>
      {body}
    </details>
  );
}
