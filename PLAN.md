# Placement News Dashboard: Current Plan

Merged from Drive briefs v1 -> v2 -> v3 (v3 is authoritative) plus Yash's chat additions of 2 Oct 2026.
Owner: Yash (MBA II, NMIMS). ~6 lab users. Non-technical owner: explain in plain language, do the work, ask only for things only he can do.

## Product
For each COMPANY + ROLE a student targets, show the news that matters for interviews / GDs and WHY it matters.
No cap on items per company; relevance to the role is the only filter.

## Hard rules
- Zero ongoing cost (free tiers only). Fully cloud; nothing depends on Yash's PC.
- Link posted manually to Slack. No Slack bot.
- PUBLIC GitHub repo. Secrets only in GitHub/Vercel secrets. Never commit a key.
- No full-article storage. No paid news/LLM APIs. NewsAPI free tier not allowed.
- Never invent news: every entry needs a real source link.

## Architecture
GitHub Actions (scheduler/worker) -> Supabase (NEW separate project, 2nd and last free slot) <- Vercel (Next.js, reads Supabase; no redeploy for new data).
Base: open-aggregator (cloned at D:\placement-dashboard). Keep: feed fetching incl. gnews, MCP endpoint, Next.js shell. Replace: Blob storage -> Supabase, admin password -> Supabase Auth, 5-min Vercel cron -> GitHub Actions. Remove: email, social bots, podcasts, sponsors, wordmap, attestations. Rewrite: front-end tabs, small custom pipeline instead of the 3,000-line pipeline.ts.

## Inputs Yash provides (ask first)
1. ROLES DATABASE (.md and/or Excel, descriptive text). Extract table: company, role, function, level. Show it, get confirmation, flag ambiguity.
2. Company + industry list: derive from roles DB; ask for extras.

## Mechanism A: Year Archive (Jan-Oct 2026) = research pass, NOT RSS backfill
- Claude with live web search, per company-role pair. Knowledge ends ~June 2026; Jul-Oct must come from search.
- One .md per company in /data/archive/, grouped by role/function. Idempotent load script -> Supabase.
- Entry: date, headline, 1-2 line recap, source link (required), function tag(s), type tag, WHY IT MATTERS (mandatory).
- Unverifiable claims go in an "unverified, excluded" section, never in the data.
- Batches of 10-20 companies, /data/archive/PROGRESS.md for resume, show 3-5 samples per batch for spot-check.
- New company/role later: research that pair, then run load script.

## Mechanism B: Daily feed (GitHub Actions, ~3:30am IST = 22:00 UTC, + manual "Run now")
Fetch RSS (Google News primary, GDELT secondary, GNews JSON fallback) -> dedupe vs Supabase, collapse same story -> ONE batched OpenRouter call per 15-20 headlines producing recap + function tags + why-it-matters (JSON) -> write to Supabase. Skip if no news. 45-min hard stop.
- Model: OpenRouter free. Primary nvidia/nemotron-3.5-lightning:free, backup nvidia/nemotron-3-super-120b-a12b:free. Single setting. VERIFY IDs exist first.
- Limits: 20 req/min, 50 req/day (1,000/day if $10 credit bought). Handle 429 with wait/retry then fallback model.
- On failure: store RSS snippet, status "pending", fill next run. Never show empty.
- Send only public headlines/snippets. Report requests/day before first run.
- Log duration/failures first week; try 1-2 other overnight slots.

## Dashboard
- HOME "Latest" (daily feed), "Year Archive", **Saved** tab, role filter (company + role/function) in Latest and Archive. Source link + why-it-matters on every item. Mobile-friendly.

## Yash's additions (chat, 2 Oct) - override v3's "view-only" default
1. LOGIN required. 200+ companies hardcoded as defaults; user deselects ones they don't want (opt-out). Store only deselections.
2. SAVED tab: user saves "hot news" from daily tab into personal saved list (per user, in Supabase).
3. INFERENCE: each item gives 1-3 pointers on how an MBA student can use it in interview/GD. Inference matters more than the news.

## Data model (Supabase)
articles: headline, recap, source_url, why_it_matters (inference pointers, 1-3), company, industry, function_tags, type_tag, source_name, published_at, fetched_at, dedupe_key, view (archive|daily), status (done|pending), also_covered_by.
companies / roles: config tables. profiles (Supabase Auth), user_company_prefs (deselected), saved_items (user, article, saved_at). RLS on user tables.

## Phases
1. DONE: clone, run locally, summarize.
2. Create Supabase project (guide Yash through clicks), tables, auth, RLS.
3. Roles database -> structured table -> confirm -> company list.
4. Research-pass test on 3 company-role pairs; show quality.
5. Full research pass in batches + spot-checks; load; build Year Archive + role filter.
6. OpenRouter test (recap, tags, why-it-matters) on small batch; report quality + request count.
7. Daily workflow + Latest view.
8. Login, company deselection, Saved tab.
9. Deploy to Vercel; live link.
10. Verify: manual run, no duplicates, role filter, mobile, add test company-role end to end.
11. README: add company/role, rerun research + load, rerun jobs, change model.

## Decisions (confirmed by Yash, 3 Oct 2026)
1. Inference: 1-3 short pointers per item.
2. Role-specific when a student has picked a role; generic when none picked.
3. Launch focus: OPS roles (assumed "ODS" = Ops; confirm). Other functions added later.
4. Sign-in: Google only.
5. Signup: open to anyone with the link.
6. Admin: Yash can view and remove users.
Still defaulted (not yet confirmed): company/role list edited by Claude Code on request; home keeps 30 days then rolls into archive; industry digest = bullets with source link; duplicate stories collapsed with "also covered by N sources"; daily folds into Year Archive.

## Out of scope
Slack bot/posts, full-article storage, paid APIs, Projects 2 (interview-prep assistant) and 3 (GPT voice interviewer).

## Done means
Live Vercel link: login, company/role selection, news with source + why-it-matters in Latest and Year Archive, Saved tab; daily job on GitHub Actions overnight, free services only; adding company/role = simple edit + research run for that pair; optional /api/mcp.
