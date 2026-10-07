"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { KEYS } from "@/lib/local";

const EVT = "pn-local";
const WATCH: string[] = [KEYS.saved, KEYS.off, KEYS.onboarded];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

/**
 * Keeps saved stories and company choices in step with the signed-in account.
 * Guests are untouched (browser storage only). On sign-in the browser's list and the account's list are merged, so nothing saved as a guest is lost.
 */
export function PrefsSync() {
  useEffect(() => {
    const db = supabaseBrowser();
    let userId: string | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let applying = false;

    async function push() {
      if (!userId) return;
      await db.from("user_prefs").upsert({
        user_id: userId,
        saved: read<string[]>(KEYS.saved, []),
        off: read<string[]>(KEYS.off, []),
        onboarded: read<boolean>(KEYS.onboarded, false),
        updated_at: new Date().toISOString(),
      });
    }

    async function pull() {
      const { data } = await db.from("user_prefs").select("saved,off,onboarded").eq("user_id", userId!).maybeSingle();
      applying = true;
      const localSaved = read<string[]>(KEYS.saved, []);
      if (data) {
        write(KEYS.saved, [...new Set([...(data.saved ?? []), ...localSaved])]);
        write(KEYS.off, data.onboarded ? data.off ?? [] : read<string[]>(KEYS.off, []));
        write(KEYS.onboarded, Boolean(data.onboarded) || read<boolean>(KEYS.onboarded, false));
      }
      applying = false;
      await push();
    }

    const onLocal = (e: Event) => {
      if (applying || !userId || !WATCH.includes((e as CustomEvent).detail)) return;
      clearTimeout(timer);
      timer = setTimeout(push, 700);
    };
    window.addEventListener(EVT, onLocal);

    db.auth.getUser().then(({ data }) => {
      if (data.user) {
        userId = data.user.id;
        pull();
      }
    });
    const { data: sub } = db.auth.onAuthStateChange((_ev, session) => {
      const id = session?.user?.id ?? null;
      if (id && id !== userId) {
        userId = id;
        pull();
      }
      if (!id) userId = null;
    });
    return () => {
      window.removeEventListener(EVT, onLocal);
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  return null;
}
