"use client";
import { useCallback, useEffect, useState } from "react";

/** Browser-only storage used while login is off. Each key is shared live between components on the page. */
export const KEYS = { off: "guest-companies-off", saved: "pn-saved", onboarded: "pn-onboarded", theme: "pn-theme" } as const;
const EVT = "pn-local";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function useLocal<T>(key: string, fallback: T): [T, (v: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    setReady(true);
    const onCustom = (e: Event) => {
      if ((e as CustomEvent).detail === key) sync();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) sync();
    };
    window.addEventListener(EVT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
      setValue(v);
      window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
    },
    [key],
  );
  return [value, set, ready];
}

export function useSaved() {
  const [saved, setSaved, ready] = useLocal<string[]>(KEYS.saved, []);
  // read the latest list at click time so quick successive saves never overwrite each other
  const toggle = (id: string) => {
    const now = read<string[]>(KEYS.saved, []);
    setSaved(now.includes(id) ? now.filter((x) => x !== id) : [...now, id]);
  };
  return { saved, toggle, ready };
}
