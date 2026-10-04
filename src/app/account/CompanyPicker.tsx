"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Company = { id: string; name: string; industry: string | null };

const GUEST_KEY = "guest-companies-off";

export function CompanyPicker({ userId, companies, initiallyOff }: { userId: string | null; companies: Company[]; initiallyOff: string[] }) {
  const [off, setOff] = useState<Set<string>>(new Set(initiallyOff));
  // guest mode (no login): remember choices in this browser instead of the database
  useEffect(() => {
    if (userId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
      if (Array.isArray(saved)) setOff(new Set(saved));
    } catch {}
  }, [userId]);
  const [error, setError] = useState("");
  const groups = useMemo(() => {
    const m = new Map<string, Company[]>();
    for (const c of companies) {
      const k = c.industry ?? "Other";
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return [...m.entries()];
  }, [companies]);

  async function setCompanies(ids: string[], on: boolean) {
    setError("");
    const prev = off;
    const next = new Set(off);
    for (const id of ids) {
      if (on) next.delete(id);
      else next.add(id);
    }
    setOff(next);
    if (!userId) {
      try {
        localStorage.setItem(GUEST_KEY, JSON.stringify([...next]));
        window.dispatchEvent(new CustomEvent("pn-local", { detail: GUEST_KEY }));
      } catch {}
      return;
    }
    const db = supabaseBrowser();
    const res = on
      ? await db.from("user_deselected_companies").delete().eq("user_id", userId).in("company_id", ids)
      : await db.from("user_deselected_companies").upsert(ids.map((company_id) => ({ user_id: userId, company_id })));
    if (res.error) {
      setOff(prev);
      setError("Could not save that change. Please try again.");
    }
  }

  const onCount = companies.length - off.size;
  return (
    <div>
      <p className="pn-pick-count">{onCount} of {companies.length} companies on</p>
      {error ? <p className="pn-err">{error}</p> : null}
      {groups.map(([industry, list]) => {
        const ids = list.map((c) => c.id);
        const allOn = ids.every((id) => !off.has(id));
        return (
          <section key={industry} className="pn-group">
            <div className="pn-group-h">
              <span>{industry}</span>
              <button onClick={() => setCompanies(ids, !allOn)}>{allOn ? "Turn all off" : "Turn all on"}</button>
            </div>
            <div className="pn-pick">
              {list.map((c) => (
                <button key={c.id} aria-pressed={!off.has(c.id)} onClick={() => setCompanies([c.id], off.has(c.id))}>
                  {c.name}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
