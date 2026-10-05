// Daily news job. Runs in GitHub Actions (never on a PC). Plain Node, no build step.
//
//   node scripts/daily/run.mjs            real run: fetch -> dedupe -> AI summary -> write to Supabase
//   node scripts/daily/run.mjs --dry      fetch + dedupe only, prints a sample, writes nothing
//   LIMIT_COMPANIES=5 node ...            test on the first N companies only
//
// Secrets come from the environment only (GitHub secrets): SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY.
// Only public headlines and outlet names are ever sent to the free AI model.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";

const DRY = process.argv.includes("--dry");
const LIMIT = Number(process.env.LIMIT_COMPANIES || 0);
const LOOKBACK_DAYS = process.env.LOOKBACK_DAYS || "2";
const BATCH = 12; // headlines per AI request (free plan allows ~50 requests a day, so we batch)
const MAX_PER_COMPANY = 6; // newest N per company per run keeps the AI budget safe
const MAX_AI_REQUESTS = 45; // stay under the free daily cap
const MAX_MS = 45 * 60 * 1000; // hard stop; unfinished items stay "pending" and finish next run
const T0 = Date.now();

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const OR_KEY = process.env.OPENROUTER_API_KEY || "";
const MODELS = [
  process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-lightning:free",
  process.env.OPENROUTER_MODEL_BACKUP || "nvidia/nemotron-3-super-120b-a12b:free",
];

const stats = { companies: 0, found: 0, clustered: 0, alreadyHave: 0, newItems: 0, retried: 0, enriched: 0, irrelevant: 0, pending: 0, aiRequests: 0, feedErrors: 0, written: 0, offTopic: 0, capped: 0 };
const log = (...a) => console.log(...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const timeLeft = () => MAX_MS - (Date.now() - T0);

// ---------- companies (data/roles.csv) ----------
function parseCsvLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function loadCompanies() {
  const lines = fs.readFileSync(path.join(process.cwd(), "data", "roles.csv"), "utf-8").split(/\r?\n/).filter(Boolean);
  const head = parseCsvLine(lines[0]);
  const [iId, iName, iSector] = [head.indexOf("company_id"), head.indexOf("company"), head.indexOf("sector")];
  const seen = new Map();
  for (const l of lines.slice(1)) {
    const f = parseCsvLine(l);
    if (!seen.has(f[iId])) seen.set(f[iId], { id: f[iId], name: f[iName], industry: f[iSector] });
  }
  return [...seen.values()];
}
// what to type into the news search (strip bracketed bits; a few names need help)
const SEARCH_NAME = { "ey-ernst-young": "EY India", "cedar-consulting": "Cedar Consulting India", "shell": "Shell India", "bain-company": "Bain & Company India" };
const searchName = (c) => SEARCH_NAME[c.id] ?? c.name.replace(/\s*\([^)]*\)/g, "").trim();

// Extra names a headline may use instead of the company name (subsidiaries and brands).
const EXTRA_TOKENS = {
  "aditya-birla-group": ["hindalco", "ultratech", "grasim", "aditya birla"],
  "aditya-birla-opus": ["birla opus", "opus paints"],
  "reliance-industries": ["reliance", "jiomart", "jio platforms"],
  "pepsico": ["pepsico", "varun beverages"],
  "flipkart": ["flipkart", "ekart"],
  "tata-consumer-products": ["tata consumer"],
  "godrej-boyce": ["godrej"],
  "maruti-suzuki": ["maruti"],
  "wipro-consumer-care": ["wipro consumer", "wipro enterprises"],
};
// Hindi, Bengali, Tamil, Telugu headlines are skipped: the app and the AI step are English-only.
const isEnglish = (h) => !/[ऀ-෿]/.test(h);
const STOP = new Set(["group", "india", "limited", "ltd", "company", "industries", "products", "the"]);
/** True when the headline itself names the company (or a known brand of it). Cuts search noise before any AI is used. */
function namesCompany(c, headline) {
  const h = ` ${norm(headline)} `;
  const base = norm(searchName(c)).split(" ").filter((w) => w && !STOP.has(w));
  const phrase = base.slice(0, 2).join(" ");
  const tokens = [phrase, ...(EXTRA_TOKENS[c.id] || [])].filter(Boolean).map((t) => ` ${t}`);
  return tokens.some((t) => h.includes(t));
}

// ---------- fetching (Google News RSS) ----------
const parser = new Parser();
const TOPICS = '(operations OR "supply chain" OR plant OR manufacturing OR logistics OR capacity OR distribution OR results OR expansion OR deal OR layoffs OR restructuring)';
async function fetchCompany(c) {
  const q = encodeURIComponent(`"${searchName(c)}" ${TOPICS} when:${LOOKBACK_DAYS}d`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; placement-news-bot)" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feed = await parser.parseString(await res.text());
  return (feed.items || []).map((it) => {
    const title = (it.title || "").trim();
    const cut = title.lastIndexOf(" - ");
    return {
      companyId: c.id, company: c.name, industry: c.industry,
      headline: cut > 20 ? title.slice(0, cut) : title,
      outlet: cut > 20 ? title.slice(cut + 3) : "",
      url: it.link || "",
      date: (it.isoDate || new Date().toISOString()).slice(0, 10),
    };
  });
}

// ---------- dedupe ----------
const words = (s) => new Set(norm(s).split(" ").filter((w) => w.length > 2));
const jaccard = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
const keyOf = (it) => crypto.createHash("sha1").update(`${it.companyId}|${norm(it.headline).slice(0, 90)}`).digest("hex").slice(0, 24);

/** Same story from several outlets (for one company) becomes one item with "also covered by" links. */
function cluster(items) {
  const out = [];
  for (const it of items) {
    const w = words(it.headline);
    const hit = out.find((o) => o.companyId === it.companyId && jaccard(o._w, w) >= 0.6);
    if (hit) {
      hit.alsoCovered.push({ name: it.outlet, url: it.url });
      stats.clustered++;
    } else out.push({ ...it, _w: w, alsoCovered: [] });
  }
  return out.map(({ _w, ...rest }) => ({ ...rest, key: keyOf(rest) }));
}

// ---------- Supabase (REST, service role) ----------
const sbHeaders = () => ({ apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" });
async function sbGet(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`Supabase read failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
async function sbUpsert(rows) {
  for (let i = 0; i < rows.length; i += 100) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?on_conflict=dedupe_key`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows.slice(i, i + 100)),
    });
    if (!res.ok) throw new Error(`Supabase write failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    stats.written += Math.min(100, rows.length - i);
  }
}

// ---------- AI summary (OpenRouter free models, batched) ----------
const TYPES = ["results", "deal", "leadership", "expansion", "layoffs", "hiring", "regulation", "product", "restructuring", "risk", "other"];
const FUNCS = ["operations", "supply-chain", "logistics", "distribution", "sales-ops"];
const SYSTEM = `You help MBA students (Operations and Supply Chain track) prepare for interviews and group discussions in India.
You get a numbered list of news HEADLINES, each tagged with a company. You only see the headline, so never state a number, name, date or fact that is not in the headline. You may use well-known general business knowledge about how companies and industries work, but never invent specifics.
For each item return an object:
  id: the number given
  relevant: true only if the story is about that company's own business: operations, supply chain, plants, capacity, distribution, deals, results, leadership, restructuring, regulation or strategy. false for share-price or stock-tip stories, "stock costs" or "stock surges" articles, discount-sale promotions, earnings-call transcript listings, stories mainly about another company, and anything not in English
  story: 2 to 5 lowercase words naming the underlying EVENT, identical for items that report the same event (for example "schneider ptc acquisition")
  recap: one plain sentence saying what happened, using only what the headline says (empty string if not relevant). Keep hedges such as "nears", "reportedly" or "plans"
  bullets: exactly 3 pointers a student can SAY in an interview or group discussion. Each is one complete STATEMENT (never a question), at most 30 words, in plain confident language:
    1. what the news signals about the company's strategy or operations (an inference);
    2. a ready-to-say link to an operations or supply chain concept (capacity planning, make-versus-buy, inventory, network design, localisation, working capital, lead time and so on);
    3. a balanced counterpoint: the main risk or trade-off to mention.
    Use hedges like "likely", "suggests" or "could" for anything beyond the headline. Never start a bullet with Ask, How, What or Why. (empty list if not relevant)
  type: one of ${TYPES.join(", ")}
  functions: list from ${FUNCS.join(", ")}
  importance: integer 1 to 10 for how useful this is for an Ops interview or GD (0 if not relevant)
Reply with ONLY a JSON array of these objects. No markdown, no commentary.`;

async function callModel(model, items) {
  const user = items.map((it, i) => `${i + 1}. [${it.company}] ${it.headline} (${it.outlet || "unknown outlet"}, ${it.date})`).join("\n");
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (stats.aiRequests >= MAX_AI_REQUESTS || timeLeft() < 60_000) throw new Error("ai-budget");
    stats.aiRequests++;
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OR_KEY}`, "Content-Type": "application/json", "X-Title": "Placement News daily job" },
      body: JSON.stringify({ model, temperature: 0.2, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }] }),
      signal: AbortSignal.timeout(150000),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = Math.min(90, Number(res.headers.get("retry-after")) || 20 * attempt);
      log(`  ${model}: HTTP ${res.status}, waiting ${wait}s (try ${attempt}/3)`);
      await sleep(wait * 1000);
      continue;
    }
    if (res.status === 401 || res.status === 402 || res.status === 403) throw new Error(`OpenRouter refused the key (HTTP ${res.status}). Check OPENROUTER_API_KEY.`);
    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) { log(`  ${model}: reply was not JSON, retrying`); continue; }
    try {
      const arr = JSON.parse(m[0]);
      if (Array.isArray(arr)) return arr;
    } catch { log(`  ${model}: could not parse JSON, retrying`); }
  }
  throw new Error(`model-failed:${model}`);
}

const deadModels = new Set(); // a model that timed out or failed is skipped for the rest of this run
async function enrichBatch(items) {
  for (const model of MODELS) {
    if (deadModels.has(model) && deadModels.size < MODELS.length) continue;
    try {
      const arr = await callModel(model, items);
      return { model, arr };
    } catch (e) {
      if (String(e.message).startsWith("OpenRouter refused") || e.message === "ai-budget") throw e;
      deadModels.add(model);
      log(`  ${model} failed (${e.message}); skipping it for the rest of this run`);
    }
  }
  return null;
}

function applyResult(it, r) {
  const bullets = Array.isArray(r?.bullets) ? r.bullets.map((b) => String(b).trim()).filter(Boolean).slice(0, 3) : [];
  const relevant = r?.relevant === true && bullets.length > 0;
  it.status = "done";
  it.story = norm(String(r?.story || ""));
  it.recap = relevant ? String(r.recap || "").trim() : "";
  it.bullets = relevant ? bullets : [];
  it.type = TYPES.includes(r?.type) ? r.type : "other";
  it.functions = Array.isArray(r?.functions) ? r.functions.filter((f) => FUNCS.includes(f)) : [];
  it.importance = relevant ? Math.max(1, Math.min(10, Math.round(Number(r.importance) || 5))) : 0;
  relevant ? stats.enriched++ : stats.irrelevant++;
}

// ---------- main ----------
async function main() {
  log(`Daily news job · ${DRY ? "DRY RUN (nothing is written)" : "real run"} · ${new Date().toISOString()}`);
  if (!DRY && (!SUPABASE_URL || !SERVICE_KEY)) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for a real run.");
  const noAI = !OR_KEY;
  if (noAI) log("No OPENROUTER_API_KEY: stories are saved as 'pending' and summarised on a later run.");

  let companies = loadCompanies();
  if (LIMIT) companies = companies.slice(0, LIMIT);

  // REPROCESS=1: rewrite the stories already stored (last 4 days) with the current prompt, no new fetching
  if (process.env.REPROCESS === "1") {
    const all = new Map(loadCompanies().map((c) => [c.id, c]));
    const since = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);
    const rows = await sbGet(`articles?select=dedupe_key,company_id,headline,source_name,source_url,published_at,industry,also_covered&view=eq.daily&published_at=gte.${since}&limit=1000`);
    const queue = [];
    for (const r of rows) {
      const c = all.get(r.company_id);
      const it = { key: r.dedupe_key, companyId: r.company_id, company: c?.name || r.company_id, industry: r.industry, headline: r.headline, outlet: r.source_name || "", url: r.source_url, date: r.published_at, alsoCovered: r.also_covered || [] };
      if (!c || !isEnglish(it.headline) || !namesCompany(c, it.headline)) {
        Object.assign(it, { status: "done", bullets: [], importance: 0, recap: "", type: "other", functions: [], story: "" });
        stats.offTopic++;
      }
      queue.push(it);
    }
    if (LIMIT) queue.splice(LIMIT); // in rewrite mode the limit means "only the first N stories" (for a quick test)
    stats.retried = queue.length;
    log(`Reprocess mode: ${queue.length} stored stories (${stats.offTopic} will be dropped as off-topic or not English); the rest are rewritten.`);
    if (DRY) {
      for (const it of queue.filter((q) => q.status === "done").slice(0, 15)) log(` - dropped: [${it.company}] ${it.headline.slice(0, 90)}`);
      return finish();
    }
    return enrichAndStore(queue, noAI);
  }

  // 1. fetch
  let raw = [];
  for (const c of companies) {
    if (timeLeft() < 120_000) { log("Time budget nearly used, stopping the fetch."); break; }
    try {
      const all = await fetchCompany(c);
      const named = all.filter((it) => isEnglish(it.headline) && namesCompany(c, it.headline));
      stats.offTopic += all.length - named.length;
      raw.push(...named.sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_PER_COMPANY * 2)); // keep a few extra: some merge into one story
      stats.companies++;
    } catch (e) {
      stats.feedErrors++;
      log(`  feed error for ${c.name}: ${e.message}`);
    }
    await sleep(900); // be polite to Google News
  }
  stats.found = raw.length;
  log(`Fetched ${raw.length} headlines for ${stats.companies} companies.`);

  // 2. same-story collapse, then drop what we already have
  let items = cluster(raw);
  {
    const per = new Map();
    items = items.sort((a, b) => b.date.localeCompare(a.date)).filter((it) => {
      const n = (per.get(it.companyId) || 0) + 1;
      per.set(it.companyId, n);
      if (n > MAX_PER_COMPANY) { stats.capped++; return false; }
      return true;
    });
  }
  let existing = new Set();
  let retry = [];
  if (!DRY) {
    const since = new Date(Date.now() - 14 * 86400000).toISOString();
    existing = new Set((await sbGet(`articles?select=dedupe_key&view=eq.daily&fetched_at=gte.${since}&limit=10000`)).map((r) => r.dedupe_key));
    retry = await sbGet(`articles?select=dedupe_key,company_id,headline,source_name,source_url,published_at,industry,also_covered&view=eq.daily&status=eq.pending&limit=60`);
  }
  const fresh = items.filter((it) => !existing.has(it.key));
  stats.alreadyHave = items.length - fresh.length;
  stats.newItems = fresh.length;
  const nameById = new Map(companies.map((c) => [c.id, c.name]));
  const retryItems = retry.map((r) => ({
    key: r.dedupe_key, companyId: r.company_id, company: nameById.get(r.company_id) || r.company_id, industry: r.industry,
    headline: r.headline, outlet: r.source_name || "", url: r.source_url, date: r.published_at, alsoCovered: r.also_covered || [],
  }));
  stats.retried = retryItems.length;
  const queue = [...fresh, ...retryItems.filter((r) => !fresh.some((f) => f.key === r.key))];
  log(`New: ${fresh.length} · already stored: ${stats.alreadyHave} · pending from earlier: ${retryItems.length}`);

  if (DRY) {
    log("\nSample of what would be processed:");
    for (const it of queue.slice(0, 12)) log(` - [${it.company}] ${it.headline}  (${it.outlet}, ${it.date})${it.alsoCovered.length ? `  +${it.alsoCovered.length} more outlets` : ""}`);
    return finish();
  }
  if (!queue.length) { log("Nothing new today. Skipping the AI step."); return finish(); }

  return enrichAndStore(queue, noAI);
}

async function enrichAndStore(queue, noAI) {
  // 3. AI summary in batches (items of one company sit together so same-event stories share a batch)
  const todo = queue.filter((it) => it.status !== "done").sort((a, b) => a.companyId.localeCompare(b.companyId));
  if (!noAI) {
    let failedInARow = 0;
    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH);
      try {
        const out = await enrichBatch(batch);
        if (!out) {
          log(`Batch ${i / BATCH + 1}: all models failed; items stay pending.`);
          if (++failedInARow >= 2) { log("Two batches in a row failed on every model: stopping the AI step for this run."); break; }
          continue;
        }
        failedInARow = 0;
        const byId = new Map(out.arr.map((r) => [Number(r.id), r]));
        batch.forEach((it, idx) => { const r = byId.get(idx + 1); if (r) applyResult(it, r); });
        log(`Batch ${i / BATCH + 1}: ${out.model}, ${batch.filter((b) => b.status === "done").length}/${batch.length} summarised`);
      } catch (e) {
        if (String(e.message).startsWith("OpenRouter refused")) throw e;
        log(`Stopping AI step: ${e.message}`);
        break;
      }
    }
  }
  for (const it of queue) if (it.status !== "done") { it.status = "pending"; it.bullets = it.bullets || []; stats.pending++; }

  // 3b. the same event under different headlines gets the same event label: keep the first, fold the rest into "also covered"
  {
    const firstByKey = new Map();
    for (const it of queue) {
      if (it.status !== "done" || !it.bullets?.length) continue;
      const k = `${it.companyId}|${it.story || norm(it.bullets[0])}`;
      const keep = firstByKey.get(k);
      if (!keep) { firstByKey.set(k, it); continue; }
      keep.alsoCovered = [...(keep.alsoCovered || []), { name: it.outlet, url: it.url }, ...(it.alsoCovered || [])];
      it.importance = 0; // stored (so it is never re-processed) but hidden
      it.bullets = [];
      stats.clustered++;
    }
  }

  // 4. write
  const rows = queue.map((it) => ({
    dedupe_key: it.key, view: "daily", company_id: it.companyId, industry: it.industry || null,
    headline: it.headline, recap: it.recap || null, source_url: it.url, source_name: it.outlet || null,
    also_covered: it.alsoCovered || [], function_tags: it.functions || [], type_tag: it.type || null,
    published_at: it.date, status: it.status, bullets: it.bullets || [], importance: it.importance ?? null,
  }));
  // In rewrite mode only stories that were really rewritten (or dropped) are written, so a failed run never blanks good data.
  await sbUpsert(process.env.REPROCESS === "1" ? rows.filter((r) => r.status === "done") : rows);
  return finish();
}

function finish() {
  const secs = Math.round((Date.now() - T0) / 1000);
  const summary = [
    `## Daily news run`, ``,
    `| | |`, `|---|---|`,
    `| Companies fetched | ${stats.companies} (${stats.feedErrors} feed errors) |`,
    `| Headlines kept after the title filter | ${stats.found} (${stats.offTopic} dropped as not naming the company) |`,
    `| Dropped by the per-company cap | ${stats.capped} |`,
    `| Merged as same story | ${stats.clustered} |`,
    `| Already stored | ${stats.alreadyHave} |`,
    `| New | ${stats.newItems} (+${stats.retried} pending retried) |`,
    `| Relevant and summarised | ${stats.enriched} |`,
    `| Judged not relevant | ${stats.irrelevant} |`,
    `| Left pending | ${stats.pending} |`,
    `| AI requests used | ${stats.aiRequests} of ~50 free per day |`,
    `| Rows written | ${stats.written} |`,
    `| Duration | ${secs}s |`,
  ].join("\n");
  log("\n" + summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}

main().catch((e) => {
  console.error("JOB FAILED:", e.message);
  process.exit(1);
});
