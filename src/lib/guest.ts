import fs from "node:fs";
import path from "node:path";

/**
 * LOGIN SWITCH. Set AUTH_DISABLED=1 in .env.local to browse without signing in (for UI work).
 * Never set it on the live site. Remove the line to turn login back on.
 */
export const AUTH_DISABLED = process.env.AUTH_DISABLED === "1";

export type GuestCompany = { id: string; name: string; industry: string | null };

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** Company list for guest mode, read from data/roles.csv (the database needs a login to read). */
export function guestCompanies(): GuestCompany[] {
  const file = path.join(process.cwd(), "data", "roles.csv");
  const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/).filter(Boolean);
  const head = parseCsvLine(lines[0]);
  const iId = head.indexOf("company_id");
  const iName = head.indexOf("company");
  const iSector = head.indexOf("sector");
  const seen = new Map<string, GuestCompany>();
  for (const line of lines.slice(1)) {
    const f = parseCsvLine(line);
    if (!seen.has(f[iId])) seen.set(f[iId], { id: f[iId], name: f[iName], industry: f[iSector] || null });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
