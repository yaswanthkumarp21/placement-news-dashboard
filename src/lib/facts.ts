import fs from "node:fs";
import path from "node:path";

export type Fact = { label: string; value: string; period?: string; sourceName?: string; sourceUrl?: string; sourceDate?: string };
export type Policy = { name: string; what: string; sourceName?: string; sourceUrl?: string; sourceDate?: string };
export type Industry = {
  id: string;
  name: string;
  asOf: string | null;
  overview: string;
  marketSize?: Fact[];
  growth?: Fact[];
  gdpJobs?: Fact[];
  exportsFdi?: Fact[];
  policies?: Policy[];
  drivers?: string[];
  players?: { structure: string; companies: string[] };
  challenges?: string[];
  opsAngle?: string[];
  interviewNumbers?: { label: string; value: string; period?: string }[];
  gdQuestions?: string[];
  conflicts?: string[];
  notFound?: string[];
};

/** Industry recaps from data/industry-facts.json (built from official sources only; never from ibef.org). */
export function loadIndustries(): Industry[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "industry-facts.json"), "utf-8");
    return (JSON.parse(raw) as { industries: Industry[] }).industries;
  } catch {
    return [];
  }
}

export const hasRecap = (i: Industry) => Boolean(i.overview && i.marketSize?.length);
