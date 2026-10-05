You are building the "Industry facts" recap for a placement-news app used by MBA students (Operations and Supply Chain track) at NMIMS, India. Today is 5 October 2026. For each of the six industries below, produce a complete recap a student can read in two minutes and use in interviews and group discussions.

USE LIVE WEB SEARCH AND OPEN EVERY PAGE YOU CITE. Make sure web search is turned on in this chat.

=== SOURCING RULES (important) ===
1. Use PRIMARY and original sources only: Press Information Bureau (pib.gov.in), the ministry for that industry, DPIIT (FDI data), RBI, NITI Aayog, Economic Survey and Union Budget documents, TRAI/SIAM/ACMA/IPA/Invest India style official bodies, listed-company annual reports and investor presentations, and reputable business press (Business Standard, Economic Times, Mint, Reuters).
2. DO NOT use ibef.org as a source and do not reproduce its text, numbers or charts. Its terms forbid reuse without consent.
3. Every number needs: the value exactly as the source states it, what it measures, the period it refers to (for example FY25), the source name, the exact URL you opened, and the date of the source. If you cannot open the page, do not use the number.
4. Prefer the latest official figure. If two sources disagree, list both in "conflicts" and do not pick one silently.
5. Write all prose in your own words. Facts and numbers are fine; do not copy sentences from any source.
6. Never invent or estimate a figure. If something is not available, say "not found" and explain what you tried.

=== INDUSTRIES ===
1. Auto and manufacturing (passenger vehicles, auto components, EVs, general manufacturing)
2. FMCG and retail
3. E-commerce and logistics
4. Pharma
5. Oil and gas
6. Services (IT-BPM and professional services including consulting)

=== WHAT TO PRODUCE FOR EACH INDUSTRY: A SHORT TEN-POINT RECAP ===
THIS IS A ONE-TIME, RICHER STUDY PAGE. Give depth, but keep every item short and verified. Respect these limits.
1. overview: 2 sentences, plain language.
2. marketSize: 4 to 9 facts.
3. growth: 3 to 6 facts (growth rates, outlook, adoption trends).
4. gdpJobs: 3 to 6 facts (share of GDP, jobs, investment).
5. exportsFdi: 3 to 6 facts (exports, imports, FDI, key trading partners, tariffs).
6. policies: 5 to 8 schemes or rules (include recent tax or tariff changes), one or two sentences each on what it does, with the year and the key numbers.
7. drivers: 6 to 8, one short line each, each tied to a verified number or event.
8. players: one sentence on how the industry is structured, and 6 company names.
9. challenges: 6 to 8, one short line each, each tied to a verified number or event.
10. opsAngle: 6 to 8 lines, one sentence each, from an operations and supply chain seat, written as something a student can say aloud in an interview.
Also: interviewNumbers (exactly 10 numbers a student should be able to quote, each with its period) and gdQuestions (exactly 10, each a debatable question tied to a verified fact).
STUDY-PAGE ELEMENTS (new), so students remember the industry:
 - bigIdea: ONE memorable sentence (at most 30 words) that captures the industry's story, using only facts you verified. It should contain a tension, for example "growing fast, but ...".
 - flow: exactly 4 steps showing how the industry works from start to end (for example parts makers, vehicle makers, sold at home, sold abroad). Each step has a short label, ONE verified number ("stat") and a short note saying what the number is and its period.
 - timeline: 8 to 12 dated events (oldest first) that matter: launches of schemes, key reports, record years, and upcoming deadlines. Use only dates you verified. Mark an upcoming deadline with "future": true. Each has a short date like "Sep 2024", a title, and one line of detail.
CHARTS (new): also give 8 to 12 "charts" built ONLY from numbers you verified above, so the app can draw infographics. Choose the kind that fits:
 - "bars": compare 2 to 6 categories at one point in time (for example sales by segment, exports versus imports);
 - "columns": a short series of 3 to 6 periods (for example growth by year);
 - "progress": achieved versus target (each item has value and target in the same unit).
Every chart needs a plain title, a subtitle saying the period and unit, a numeric "value" for every item (a plain number, no text or commas), an optional short "note" (for example "+10.7%"), and its own source name, link and date. Never put an estimate in a chart.
A "fact" is one number with a short label. Do not stack several numbers into one fact.

=== EXACT OUTPUT FORMAT (my software reads this) ===
Output ONE JSON object per industry, each in its own fenced json code block, preceded by a line "FILE: <industry-id>.json" where industry-id is one of: auto, fmcg, ecom, pharma, oilgas, services.

{
  "id": "fmcg",
  "name": "FMCG and retail",
  "asOf": "YYYY-MM-DD (date you researched it)",
  "bigIdea": "one memorable sentence",
  "flow": [ { "label": "Parts makers", "stat": "₹7.60 lakh crore", "note": "component industry turnover, FY26" } ],
  "timeline": [ { "date": "Sep 2024", "title": "...", "detail": "...", "future": false } ],
  "overview": "...",
  "charts": [
    { "id": "sales", "kind": "bars", "title": "...", "subtitle": "FY2025-26, in lakh units", "unit": "lakh",
      "items": [ { "label": "...", "value": 217.06, "note": "+10.7%" } ],
      "sourceName": "...", "sourceUrl": "https://...", "sourceDate": "YYYY-MM-DD" },
    { "id": "growth", "kind": "columns", "title": "...", "subtitle": "...", "unit": "%", "items": [ { "label": "2023-24", "value": 12.7 } ], "sourceName": "...", "sourceUrl": "https://...", "sourceDate": "YYYY-MM-DD" },
    { "id": "target", "kind": "progress", "title": "...", "subtitle": "...", "items": [ { "label": "...", "value": 26.59, "target": 28.30, "note": "as of June 2026" } ], "sourceName": "...", "sourceUrl": "https://...", "sourceDate": "YYYY-MM-DD" }
  ],
  "marketSize": [ { "label": "...", "value": "...", "period": "FY25", "sourceName": "...", "sourceUrl": "https://...", "sourceDate": "YYYY-MM-DD" } ],
  "growth": [ same shape ],
  "gdpJobs": [ same shape ],
  "exportsFdi": [ same shape ],
  "policies": [ { "name": "...", "what": "one sentence with the year and one number", "sourceName": "...", "sourceUrl": "https://...", "sourceDate": "YYYY-MM-DD" } ],
  "drivers": ["...", "...", "..."],
  "players": { "structure": "one sentence", "companies": ["...", "...", "...", "...", "...", "..."] },
  "challenges": ["...", "...", "..."],
  "opsAngle": ["...", "...", "..."],
  "interviewNumbers": [ { "label": "...", "value": "...", "period": "..." } ],
  "gdQuestions": ["...", "...", "..."],
  "conflicts": ["any place two sources disagree, one line each"],
  "notFound": ["anything you could not verify, one line each"]
}

=== HOW TO WORK ===
Do two industries per batch. After each batch, show a short table (industry, number of facts, number of conflicts, number of "not found") and 3 sample facts with their source links so I can spot-check, then STOP and wait for me to say "continue". Quality and verified sources matter more than speed. Start with industries 1 and 2.
