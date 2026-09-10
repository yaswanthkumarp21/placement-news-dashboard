"use client";

import { useEffect, useState } from "react";

/**
 * Merge and split from the story card itself, for the admin with edit links
 * on, so a wrong grouping is fixed where it is seen instead of in the
 * admin's Stories page. "merge into…" marks this story as the one being
 * absorbed, every other card then offers "merge here", and the pick calls
 * the same merge action the admin page uses. "split" lists this story's
 * links with checkboxes and moves the ticked ones into a new story, both
 * re-edited, the same split action as the admin page. Renders nothing
 * unless this browser has the admin cookie and the edit links toggle on,
 * so the public page is untouched.
 */

interface ToolLink {
  url: string;
  title: string;
  sourceName: string;
}

type MergeSource = { id: string; headline: string } | null;
type StoryRow = { id: string; headline: string; section: string; updatedAt: string };

const SOURCE_EVENT = "story-merge-source";
let mergeSource: MergeSource = null;

function setMergeSource(next: MergeSource) {
  mergeSource = next;
  window.dispatchEvent(new CustomEvent(SOURCE_EVENT));
}

async function call(action: string, payload: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  return (await res.json().catch(() => ({ ok: false, message: `Server returned ${res.status}.` }))) as { ok: boolean; message?: string };
}

export function StoryTools({ id, headline, links }: { id: string; headline: string; links: ToolLink[] }) {
  const [show, setShow] = useState(false);
  const [source, setSource] = useState<MergeSource>(null);
  const [splitting, setSplitting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  // the merge picker: every live story, fetched once on entering merge
  // mode, the last three days shown by default, typing searches them all
  const [all, setAll] = useState<StoryRow[] | null>(null);
  const [query, setQuery] = useState("");
  // split's second destination: an existing story, picked the same way
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setShow(document.cookie.includes("oa_admin_ui=1") && localStorage.getItem("editlinks") === "1");
      } catch {
        setShow(false);
      }
    };
    const sync = () => setSource(mergeSource);
    read();
    sync();
    window.addEventListener("editlinks-pref", read);
    window.addEventListener(SOURCE_EVENT, sync);
    return () => {
      window.removeEventListener("editlinks-pref", read);
      window.removeEventListener(SOURCE_EVENT, sync);
    };
  }, []);

  if (!show) return null;

  const run = async (action: string, payload: Record<string, unknown>, confirmText: string) => {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setStatus("working…");
    const res = await call(action, payload);
    setBusy(false);
    if (res.ok) {
      setMergeSource(null);
      setStatus(res.message ?? "done");
      // the page is server-rendered from state: a reload shows the result
      setTimeout(() => window.location.reload(), 600);
    } else {
      setStatus(res.message ?? "failed");
    }
  };

  const isSource = source?.id === id;

  const loadAll = async () => {
    if (all) return;
    const res = (await call("listStories", {})) as { ok: boolean; stories?: StoryRow[] };
    setAll(res.ok && res.stories ? res.stories : []);
  };
  const startMerge = async () => {
    setMergeSource({ id, headline });
    setQuery("");
    await loadAll();
  };
  const threeDaysAgo = Date.now() - 3 * 86400000;
  const q = query.trim().toLowerCase();
  const candidates = (all ?? [])
    .filter((r) => r.id !== id)
    .filter((r) => (q ? r.headline.toLowerCase().includes(q) : new Date(r.updatedAt).getTime() >= threeDaysAgo))
    .slice(0, q ? 12 : 30);
  const picker = (onPick: (r: StoryRow) => void) => (
    <span className="story-split story-pick">
      <input
        type="search"
        value={query}
        placeholder="type to search every live story, or pick from the last three days"
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {all === null ? (
        <span className="story-tools-note">loading stories…</span>
      ) : candidates.length === 0 ? (
        <span className="story-tools-note">nothing matches</span>
      ) : (
        candidates.map((r) => (
          <button key={r.id} type="button" className="linklike story-pick-row" disabled={busy} onClick={() => onPick(r)}>
            <span className="org">
              {r.section} · {r.updatedAt.slice(5, 10)}
            </span>{" "}
            {r.headline}
          </button>
        ))
      )}
    </span>
  );

  return (
    <span className="story-tools">
      {source && !isSource ? (
        <button
          type="button"
          className="linklike"
          disabled={busy}
          onClick={() => run("merge", { clusterId: source.id, targetId: id }, `Merge “${source.headline}” into “${headline}”?`)}
        >
          merge here
        </button>
      ) : isSource ? (
        <>
          <span className="story-tools-note">pick the story to merge this into, on any card or below</span>
          <button type="button" className="linklike" onClick={() => setMergeSource(null)}>
            cancel
          </button>
          {picker((r) => run("merge", { clusterId: id, targetId: r.id }, `Merge “${headline}” into “${r.headline}”?`))}
        </>
      ) : (
        <>
          <button type="button" className="linklike" disabled={busy} onClick={startMerge}>
            merge into…
          </button>
          {links.length > 1 ? (
            <button
              type="button"
              className="linklike"
              disabled={busy}
              onClick={() => {
                setSplitting((v) => !v);
                setMoving(false);
              }}
            >
              {splitting ? "cancel split" : "split"}
            </button>
          ) : null}
        </>
      )}
      {status ? <span className="story-tools-note">{status}</span> : null}
      {splitting && !source ? (
        <span className="story-split">
          {links.map((l) => (
            <label key={l.url} className="story-split-row">
              <input
                type="checkbox"
                checked={picked.has(l.url)}
                onChange={(e) => {
                  const next = new Set(picked);
                  if (e.target.checked) next.add(l.url);
                  else next.delete(l.url);
                  setPicked(next);
                }}
              />{" "}
              <span className="org">{l.sourceName}:</span> {l.title}
            </label>
          ))}
          <button
            type="button"
            className="linklike"
            disabled={busy || picked.size === 0 || picked.size === links.length}
            onClick={() =>
              run(
                "split",
                { clusterId: id, urls: [...picked] },
                `Split ${picked.size} link${picked.size === 1 ? "" : "s"} out of “${headline}” into a new story? Both get re-edited.`
              )
            }
          >
            split out {picked.size || ""} {picked.size === 1 ? "link" : "links"} into a new story
          </button>
          <button
            type="button"
            className="linklike"
            disabled={busy || picked.size === 0 || picked.size === links.length}
            onClick={async () => {
              setMoving((v) => !v);
              setQuery("");
              await loadAll();
            }}
          >
            {moving ? "cancel move" : "or move them into an existing story…"}
          </button>
          {moving
            ? picker((r) =>
                run(
                  "split",
                  { clusterId: id, urls: [...picked], targetId: r.id },
                  `Move ${picked.size} link${picked.size === 1 ? "" : "s"} out of “${headline}” into “${r.headline}”? Both get re-edited.`
                )
              )
            : null}
        </span>
      ) : null}
    </span>
  );
}
