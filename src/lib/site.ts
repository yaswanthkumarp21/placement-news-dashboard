import fs from "node:fs";
import path from "node:path";

/**
 * The site's identity, read from config/site.json (falling back to the
 * tracked config/site.example.json so a fresh clone runs with zero setup).
 * Environment overrides: SITE_URL wins over the configured domain for the
 * canonical URL, MAIL_FROM wins for the outbound From: address.
 */
export interface SiteIdentity {
  /** Display name, used in the header wordmark, page titles, and emails. */
  siteName: string;
  /** Short line shown beside the wordmark and in social cards. */
  tagline: string;
  /** One phrase naming what the site covers, used in public page copy. */
  topic: string;
  /** Canonical domain (no scheme). SITE_URL overrides the derived URL. */
  domain: string;
  /** Public inbound contact address shown on contact/criteria/privacy pages. */
  contactEmail: string;
  /** Optional public account handles; empty strings hide the footer icons. */
  social?: { xHandle?: string; farcasterHandle?: string };
  /**
   * The first day the site published a daily edition (YYYY-MM-DD). The
   * daily archive then names every day since that never froze as "not
   * published" instead of skipping it. Unset or empty means gaps are not
   * marked.
   */
  firstDay?: string;
  /**
   * Writer pages (/by) and byline links are admin-only until this is true.
   * Bylines themselves still show in the kicker as plain text. Flip it once
   * the bylines coming out of your feeds look right.
   */
  writersPublic?: boolean;
  /**
   * Optional links to your analytics dashboards, shown on the admin
   * Distribution page (VERCEL_ANALYTICS_URL and GOOGLE_ANALYTICS_URL env
   * override them). Unset means no link.
   */
  analytics?: { vercelUrl?: string; googleUrl?: string };
  /**
   * An optional tip jar: one address on /support, linked from the footer,
   * the about page, and the digest emails once live is true. ens is the
   * name shown large (optional), address the raw 0x address readers copy.
   * Unset or live false means no support page at all.
   */
  tipJar?: { ens?: string; address?: string; live?: boolean };
}

const configDir = path.join(process.cwd(), "config");

let cached: SiteIdentity | null = null;

export function siteIdentity(): SiteIdentity {
  if (cached) return cached;
  for (const file of ["site.json", "site.example.json"]) {
    const full = path.join(configDir, file);
    if (fs.existsSync(full)) {
      cached = JSON.parse(fs.readFileSync(full, "utf8")) as SiteIdentity;
      return cached;
    }
  }
  cached = {
    siteName: "Open Aggregator",
    tagline: "a curated front page",
    topic: "the news",
    domain: "example.com",
    contactEmail: "you@example.com",
  };
  return cached;
}

/** The tip jar as configured, live only when switched on with an address. */
export function tipJar(): { live: boolean; ens: string; address: string } {
  const t = siteIdentity().tipJar;
  const address = t?.address?.trim() ?? "";
  return { live: Boolean(t?.live && address), ens: t?.ens?.trim() ?? "", address };
}

/** Whether /by and the byline links are public (config writersPublic, default false). */
export function writersPublic(): boolean {
  return siteIdentity().writersPublic === true;
}

/** Outbound From: header. MAIL_FROM env wins, then the configured contact address. */
export function mailFrom(): string {
  return process.env.MAIL_FROM || siteIdentity().contactEmail;
}
