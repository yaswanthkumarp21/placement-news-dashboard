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
      <p>
        <strong>{onCount}</strong> of {companies.length} companies on
      </p>
      {error ? <p style={{ color: "#c33" }}>{error}</p> : null}
      {groups.map(([industry, list]) => {
        const ids = list.map((c) => c.id);
        const allOn = ids.every((id) => !off.has(id));
        return (
          <section key={industry} style={{ margin: "20px 0" }}>
            <h2 style={{ fontSize: 16, display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
              {industry}
              <button onClick={() => setCompanies(ids, !allOn)} style={{ fontSize: 12, cursor: "pointer" }}>
                {allOn ? "Turn all off" : "Turn all on"}
              </button>
            </h2>
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 6 }}>
              {list.map((c) => (
                <li key={c.id}>
                  <label style={{ cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={!off.has(c.id)} onChange={(e) => setCompanies([c.id], e.target.checked)} />
                    {c.name}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
