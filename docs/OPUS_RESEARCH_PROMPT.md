You are doing a research pass for a placement-news dashboard used by MBA students (Operations & Supply Chain track) at NMIMS, India. Today is 3 October 2026. Your job: for each company below, find real news from 1 January 2026 to 3 October 2026 that an MBA student applying for the listed ROLE at that company should know for interviews and group discussions (GDs), and explain WHY it matters.

YOU MUST USE LIVE WEB SEARCH (and open pages). Your built-in knowledge ends around mid-2026, so July to October 2026 can only come from search. Make sure web search / research tools are turned on in this chat before you start.

=== RULES (important) ===
1. Never invent news. Every entry needs a real, working source URL that you actually opened and read. Do not rely on search snippets alone for any number or claim. If a page is blocked or you cannot open it, find another source or leave the claim out.
2. Any claim you could not verify goes in that company's "Unverified, excluded" section, never in an entry. Also list there anything where two sources disagree.
3. Relevance is the only limit: no cap on entries per company. Include news that matters for the ROLE: capacity and plants, supply chain and logistics moves, distribution and dealer network changes, procurement and input costs, results and margins, leadership changes, deals, restructuring, layoffs, regulation, technology/automation, risks. Skip share-price chatter, generic PR and anything irrelevant to operations, supply chain, distribution or the business model behind them.
4. The same story from several outlets = ONE entry with all sources listed.
5. Use the article's publication date as the entry date (YYYY-MM-DD). Keep numbers exactly as the source states them. If you convert units (for example million to crore), say so in the recap.
6. Prefer primary sources (company press release, exchange filing, annual report) and reputable outlets (Business Standard, Economic Times, Mint, Reuters, Moneycontrol, company sites). Mark single-source entries with a "Confidence:" line.
7. Recaps are 1-2 sentences. Be factual. No hype.
8. WHY IT MATTERS is the most valuable part. For each role listed, write 1-3 short pointers: concrete interview/GD angles tied to that role (what could be asked, what trade-off to discuss, which number to quote, which concept it illustrates). No generic filler like "this is important". Also write one "Generic pointer" line (plain, one sentence) for students who have not picked a role.
9. Tag each entry: function = one or more of: operations, supply-chain, logistics, distribution, sales-ops. type = exactly one of: results, deal, leadership, expansion, layoffs, hiring, regulation, product, restructuring, risk, analysis, other. Use type "analysis" for analyst opinion pieces, and say so in the recap.

=== EXACT OUTPUT FORMAT (my software reads this, do not change the structure) ===
Output ONE company per file, each inside its own fenced code block, preceded by a line "FILE: <company-slug>.md" (slug = lowercase letters/numbers/hyphens). Inside:

# <Company name exactly as in my list>
Roles tracked: <roles from my list>
Research status: DONE <date>

## Entries

### YYYY-MM-DD | <Headline in your own words, factual>
- Source: <url> (<Outlet>, <publication date>); <second url> (<Outlet>, <date>)
- Recap: <1-2 sentences>
- Tags: function = <a, b> | type = <type>
- Confidence: single source   (include this line ONLY when there is just one source)
- Generic pointer: <one sentence>
- Why it matters (<Role name exactly as in my list>):
  1. <pointer>
  2. <pointer>
  3. <pointer>
(Repeat the "Why it matters (<Role>)" block for each role of that company. Use 1-3 numbered pointers each.)

## Unverified, excluded
- <claim and why it could not be verified, or sources that conflict>

Sort entries oldest first. If a company truly has no verifiable relevant news in the period, still output the file with "## Entries" containing the line "No verified relevant entries found." and explain in the Unverified section what you tried.

=== HOW TO WORK ===
Work in batches of 10 companies, in the order of my list. After each batch: (a) output the files, (b) show a progress table (company | entries | unverified items), (c) show 3 sample entries so I can spot-check, then STOP and wait for me to say "continue". Quality matters more than speed. Do not skip companies and do not shorten the research to save effort.

=== COMPANY LIST (65 companies) ===
Conglomerate, Manufacturing, Real Estate, Oil & Gas, Automobiles & Aviation:
1. Aditya Birla Group | roles: Operations, Supply Chain
2. Bosch | roles: Operations Management
3. Eaton | roles: Supply Chain, Operations
4. Godrej & Boyce | roles: Operations
5. GE HealthCare | roles: Operations
6. GE Vernova | roles: Supply Chain
7. Honeywell | roles: Operations
8. IndiGo | roles: Supply Chain, Logistics
9. Jindal Steel & Power (JSPL) | roles: Supply Chain
10. Maruti Suzuki | roles: Manufacturing, Operations
11. Neterwala | roles: Operations
12. Reliance Industries | roles: Supply Chain, Logistics
13. Saint Gobain | roles: Supply Chain
14. Schneider Electric | roles: Operations, Supply Chain
15. Shell | roles: Supply Chain Management
16. Sobha | roles: Real Estate Operations
17. Tata Power | roles: Operations
18. Yokohama | roles: Supply Chain
19. Zeiss | roles: Operations
20. Vikram Solar | roles: Operations, Supply Chain

Startup, Logistics & E-commerce:
21. AllCargo Logistics | roles: Logistics, Supply Chain
22. API Logistics | roles: Supply Chain Management
23. Carwale | roles: Operations
24. FedEx | roles: Supply Chain, Logistics
25. Flipkart | roles: Supply Chain, Logistics
26. Groww | roles: Operations
27. Lenskart | roles: Operations, Supply Chain
28. Mphasis | roles: Operations, Logistics
29. PhonePe | roles: Supply Chain, Operations

FMCG, FMCD & Retail:
30. Aditya Birla Opus | roles: Distribution, Supply Chain
31. ABInBev | roles: Sales & Distribution Operations
32. Asian Paints | roles: Distribution Management
33. Berger Paints | roles: Sales, Supply Chain
34. Britannia | roles: Distribution, Supply Chain
35. Diageo | roles: Supply Chain, Distribution
36. Hector Beverages | roles: Sales Operations
37. Johnson & Johnson | roles: Supply Chain
38. Jubilant Food Works | roles: Distribution Management
39. Liebherr | roles: Supply Chain
40. L'Oreal | roles: Distribution
41. Marico | roles: Sales & Distribution
42. PepsiCo | roles: Supply Chain, Distribution
43. Pidilite | roles: Supply Chain Management
44. Samsung Electronics | roles: Supply Chain
45. Signify | roles: Distribution Operations
46. Tata Consumer Products | roles: Distribution, Supply Chain
47. V-Guard | roles: Supply Chain
48. Welspun | roles: Supply Chain Management
49. Wipro Consumer Care | roles: Retail Operations
50. Zydus Wellness | roles: Supply Chain

Consulting:
51. Accenture Strategy | roles: Operations Consulting
52. Bain & Company | roles: Operations Excellence
53. Cedar Consulting | roles: Operations Consulting
54. Deloitte | roles: Supply Chain Consulting
55. EY (Ernst & Young) | roles: Operations Advisory
56. KPMG | roles: Operations Transformation
57. Michael Page | roles: Operations Recruitment
58. PwC | roles: Supply Chain Advisory
59. Stanton Chase | roles: Executive Search for Operations Roles

IT / Analytics, Pharma, Media, Telecom:
60. ACG (Associated Capsules) | roles: Supply Chain
61. Airtel | roles: Operations
62. Ashnik | roles: Operations
63. Cipla | roles: Supply Chain
64. GSK (GlaxoSmithKline) | roles: Supply Chain
65. Karix | roles: Operations

Start with batch 1 (companies 1-10).
