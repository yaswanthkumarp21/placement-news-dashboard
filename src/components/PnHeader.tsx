"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Daily News" },
  { href: "/facts", label: "Ind. Facts" },
  { href: "/year-news", label: "Year News" },
];

export function PnHeader() {
  const path = usePathname();
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
