"use client";
import { useState } from "react";

type Card = { q: string; sub?: string; a: string };

/** Tap-to-flip cards for memorising numbers: the front asks, the back answers. */
export function Flashcards({ cards }: { cards: Card[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const allOpen = open.size === cards.length;
  return (
    <div>
      <div className="pn-fc-bar">
        <span>
          Cover the answer, say the number out loud, then tap to check. <b>{open.size}</b> of {cards.length} revealed
        </span>
        <button className="pn-ghost" onClick={() => setOpen(allOpen ? new Set() : new Set(cards.map((_, i) => i)))}>
          {allOpen ? "Hide all" : "Reveal all"}
        </button>
      </div>
      <div className="pn-fc-grid">
        {cards.map((c, i) => {
          const on = open.has(i);
          return (
            <button key={i} className={`pn-fc${on ? " on" : ""}`} onClick={() => toggle(i)} aria-pressed={on} style={{ ["--fcc" as string]: ["var(--yellow)", "var(--pink)", "var(--green)"][i % 3] }}>
              <span className="pn-fc-in">
                <span className="pn-fc-face front">
                  <small>Do you remember?</small>
                  <b>{c.q}</b>
                  {c.sub ? <em>{c.sub}</em> : null}
                  <i>tap to flip</i>
                </span>
                <span className="pn-fc-face back">
                  <small>Answer</small>
                  <b>{c.a}</b>
                  {c.sub ? <em>{c.sub}</em> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
