"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "Daily News" },
  { href: "/facts", label: "Ind. Facts" },
  { href: "/year-news", label: "Year News" },
];

export function PnHeader() {
  const path = usePathname();
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  useEffect(() => {
    try {
      const t = localStorage.getItem("pn-theme");
      if (t === "light" || t === "dark") {
        setTheme(t);
        document.documentElement.dataset.theme = t;
      }
    } catch {}
  }, []);
  function toggleTheme() {
    const isDark = document.documentElement.dataset.theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("pn-theme", next);
    } catch {}
  }
  const isOn = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className="pn-top">
      <div className="pn-wrap">
        <div className="pn-bar">
          <Link className="pn-brand" href="/">Placement News</Link>
          <nav>
            <Link href="/saved">Saved</Link>
            <Link href="/account">My companies</Link>
            <button className="pn-ghost" onClick={toggleTheme} aria-label="Switch light or dark theme">Theme</button>
          </nav>
        </div>
        <div className="pn-tabs" role="tablist">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={isOn(t.href) ? "on" : ""} role="tab" aria-selected={isOn(t.href)}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
