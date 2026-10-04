import { loadArchive, type ArchiveEntry } from "./archive";

/** A story as the UI shows it: headline, company, three inference bullets. Serializable (sent to client components). */
export type Tile = {
  id: string;
  co: string; // company name
  slug: string; // archive slug
  csvId: string | null; // id in data/roles.csv (what users select), or null when the company is not in the list
  date: string | null;
  dateNote: string | null;
  headline: string;
  bullets: string[];
  theme: string;
  role: string;
  recap: string;
  keyNumbers: string;
  sources: { l: string; u: string }[];
  single: boolean;
  score: number;
};

// archive slug -> roles.csv company_id, where the two differ
const ALIAS: Record<string, string> = { jspl: "jindal-steel-power-jspl" };

const ABBR = /\b(vs|e\.g|i\.e|approx|Rs|Cr|No|Mr|Dr|etc|St|Ltd|Inc|Co)\.$/i;

/** Splits the "why it matters" paragraph into up to 3 bullets. (Placeholder until the prompt returns 3 bullets.) */
export function toBullets(why: string): string[] {
  const raw = why.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(₹])/);
  let out: string[] = [];
  for (const part of raw) {
    if (out.length && ABBR.test(out[out.length - 1])) out[out.length - 1] += ` ${part}`;
    else out.push(part);
  }
  out = out.map((x) => x.trim()).filter(Boolean);
  if (out.length > 3) out = [out[0], out[1], out.slice(2).join(" ")];
  return out;
}

const IMPORTANT = /(result|margin|capex|capacity|restructur|layoff|demerger|spin|deal|acqui|risk|cost|regulat|tariff|supply|localis|export|guidance|outlook)/i;

/** Placeholder ranking: the AI model will replace this. Newer, number-backed, multi-source, decision-relevant stories rank higher. */
function score(e: ArchiveEntry, bullets: string[]): number {
  let s = 0;
  if (e.date) {
    const days = (Date.now() - new Date(`${e.date}T00:00:00`).getTime()) / 86400000;
    s += Math.max(0, 1 - days / 270) * 40;
  } else s += 5;
  if (e.keyNumbers) s += 15;
  s += Math.min(e.sources.length, 3) * 5;
  if (!/single/i.test(e.confidence)) s += 5;
  if (IMPORTANT.test(`${e.theme} ${e.headline}`)) s += 10;
  s += bullets.length * 3;
  return Math.round(s * 10) / 10;
}

export function loadTiles(): Tile[] {
  const tiles: Tile[] = [];
  for (const d of loadArchive()) {
    for (const e of d.entries) {
      const bullets = toBullets(e.why);
      tiles.push({
        id: e.id,
        co: e.company,
        slug: e.slug,
        csvId: ALIAS[e.slug] ?? e.slug,
        date: e.date,
        dateNote: e.dateNote,
        headline: e.headline,
        bullets,
        theme: e.theme,
        role: e.roleRelevance,
        recap: e.recap,
        keyNumbers: e.keyNumbers,
        sources: e.sources.map((s) => ({ l: s.label, u: s.url })),
        single: /single/i.test(e.confidence),
        score: score(e, bullets),
      });
    }
  }
  return tiles.sort((a, b) => b.score - a.score);
}
