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
KEEP IT SHORT. A student reads this on a phone in two minutes. The whole recap should be about 400 words. Respect these caps exactly.
1. overview: 2 sentences, plain language.
2. marketSize: at most 2 facts.
3. growth: at most 2 facts (growth rate or outlook).
4. gdpJobs: at most 2 facts (share of GDP or jobs).
5. exportsFdi: at most 2 facts (exports, imports or FDI).
6. policies: at most 3 schemes or rules, ONE sentence each on what it does, with the year and one headline number.
7. drivers: exactly 3, one short line each.
8. players: one sentence on how the industry is structured, and 6 company names.
9. challenges: exactly 3, one short line each.
10. opsAngle: exactly 3 bullets, one sentence each, from an operations and supply chain seat.
Also: interviewNumbers (exactly 5 numbers a student should quote, each with its period) and gdQuestions (exactly 3).
CHARTS (new): also give 4 to 6 "charts" built ONLY from numbers you verified above, so the app can draw infographics. Choose the kind that fits:
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
