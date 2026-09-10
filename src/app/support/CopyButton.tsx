"use client";

import { useState } from "react";

/** Copies the raw address; the label flips for a moment so the click reads as done. */
export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn tipjar-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          // clipboard blocked: the address is selectable text right beside the button
        }
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
