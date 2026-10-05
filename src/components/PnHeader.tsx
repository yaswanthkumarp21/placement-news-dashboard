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
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
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
          <Link className="pn-brand" href="/">
            <span className="pn-logo" aria-hidden="true" />
            <span>
              Placement <em>News</em>
            </span>
          </Link>
          <nav>
            <Link className="pn-navlink" href="/saved">Saved</Link>
            <Link className="pn-navlink" href="/account">My companies</Link>
            <button className="pn-theme" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} title={theme === "light" ? "Dark theme" : "Light theme"}>
              {theme === "light" ? "☾" : "☀"}
            </button>
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
