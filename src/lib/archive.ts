import fs from "node:fs";
import path from "node:path";

/**
 * Reads the research files in data/archive/R*.md (written in the v2 prompt format) straight from disk.
 * Drop a new file in that folder and it appears on /year-archive on the next page load. No database step.
 * (The same files will later be loaded into Supabase by a loader script.)
 */

export type Source = { label: string; url: string };
export type ArchiveEntry = {
  id: string;
  company: string;
  slug: string;
  sector: string;
  date: string | null; // YYYY-MM-DD, or null when the research could not establish it
  dateNote: string | null;
  headline: string;
  recap: string;
  keyNumbers: string;
  sources: Source[];
  sourceQuality: string;
  confidence: string;
  theme: string;
  roleRelevance: string;
  why: string;
};
export type CompanyDoc = {
  name: string;
  slug: string;
  sector: string;
  entries: ArchiveEntry[];
  sections: Record<string, string[]>; // other sections of the company's file, as raw lines
};

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function linksIn(text: string): Source[] {
  const out: Source[] = [];
  for (const m of text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) out.push({ label: m[1], url: m[2] });
  return out;
}

const FIELD = /^- \*\*(.+?):\*\*\s*(.*)$/;

export function loadArchive(): CompanyDoc[] {
  const dir = path.join(process.cwd(), "data", "archive");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /^R\d+.*\.md$/i.test(f)).sort();
  } catch {
    return [];
  }

  const byName = new Map<string, CompanyDoc>();
  for (const file of files) {
    const lines = fs.readFileSync(path.join(dir, file), "utf-8").split(/\r?\n/);
    let company: CompanyDoc | null = null;
    let section = "";
    let cur: Record<string, string> | null = null;
    let curHead: { date: string | null; note: string | null; headline: string } | null = null;
    let field = "";

    const flush = () => {
      if (company && cur && curHead) {
        company.entries.push({
          id: `${company.slug}-${company.entries.length}`,
          company: company.name,
          slug: company.slug,
          sector: company.sector,
          date: curHead.date,
          dateNote: curHead.note,
          headline: curHead.headline,
          recap: cur["Recap"] ?? "",
          keyNumbers: cur["Key numbers"] ?? "",
          sources: linksIn(cur["Source"] ?? ""),
          sourceQuality: cur["Source quality"] ?? "",
          confidence: cur["Confidence"] ?? "",
          theme: cur["Theme"] ?? "Other",
          roleRelevance: cur["Role relevance"] ?? "",
          why: cur["Why it matters"] ?? "",
        });
      }
      cur = null;
      curHead = null;
      field = "";
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      const co = line.match(/^# (.+?) \| (.+)$/);
      if (co) {
        flush();
        const name = co[1].trim();
        const key = slugify(name);
        company = byName.get(key) ?? { name, slug: key, sector: co[2].trim(), entries: [], sections: {} };
        byName.set(key, company);
        section = "";
        continue;
      }
      if (!company) continue;
      const sec = line.match(/^## (.+)$/);
      if (sec) {
        flush();
        section = sec[1].trim();
        continue;
      }
      if (section.startsWith("News entries")) {
        const head = line.match(/^### \[(.+?)\]\s*(.*)$/);
        if (head) {
          flush();
          const when = head[1].trim();
          const iso = /^\d{4}-\d{2}-\d{2}$/.test(when);
          curHead = { date: iso ? when : null, note: iso ? null : when, headline: head[2].trim() };
          cur = {};
          continue;
        }
        if (!cur) continue;
        const f = line.match(FIELD);
        if (f) {
          field = f[1].trim();
          cur[field] = f[2].trim();
        } else if (field && line.trim() && !line.startsWith("---") && !line.startsWith("#")) {
          cur[field] = `${cur[field]} ${line.trim()}`.trim();
        }
        continue;
      }
      if (section && line.trim() && line.trim() !== "---") (company.sections[section] ??= []).push(line);
    }
    flush();
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
