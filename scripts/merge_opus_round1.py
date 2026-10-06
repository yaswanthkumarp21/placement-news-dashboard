"""Merge the Opus gap-fill blocks (round 1, 2026-10-05/06) into data/industry-facts.json.

Items were dropped when their source link did not back the number (company-revenue charts that cite one
company's page for all companies, ONDC GMV that matches the GeM figure, a state-level diesel number, an
aggregator source for ONGC). Dropped items are listed in notFound/conflicts instead.
"""
import json, io, re

P = "data/industry-facts.json"
d = json.load(io.open(P, encoding="utf-8"))
ind = {i["id"]: i for i in d["industries"]}


def F(label, value, period, name, url, date):
    return {"label": label, "value": value, "period": period, "sourceName": name, "sourceUrl": url, "sourceDate": date}


def Pol(name, what, sname, url, date):
    return {"name": name, "what": what, "sourceName": sname, "sourceUrl": url, "sourceDate": date}


def Ch(id, kind, title, sub, unit, items, sname, url, date):
    return {"id": id, "kind": kind, "title": title, "subtitle": sub, "unit": unit, "items": items,
            "sourceName": sname, "sourceUrl": url, "sourceDate": date}


MON = {m: i for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), 1)}


def tkey(t):
    m = re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? (\d{4})", t["date"])
    if m:
        return (int(m.group(2)), MON[m.group(1)])
    y = re.search(r"(\d{4})", t["date"])
    return (int(y.group(1)), 0) if y else (0, 0)


def merge(i, add):
    for k in ("marketSize", "growth", "gdpJobs", "exportsFdi", "policies", "drivers", "challenges", "opsAngle", "conflicts", "charts"):
        if add.get(k):
            i.setdefault(k, [])
            i[k].extend(add[k])
    if add.get("timeline"):
        past = [t for t in i["timeline"] if not t.get("future")] + add["timeline"]
        fut = [t for t in i["timeline"] if t.get("future")]
        i["timeline"] = sorted(past, key=tkey) + fut
    have = {c.lower() for c in i["players"]["companies"]}
    for n in add.get("players", []):
        if n.lower() not in have:
            i["players"]["companies"].append(n)
            have.add(n.lower())
    ids = [c["id"] for c in i["charts"]]
    assert len(ids) == len(set(ids)), ids
    i["asOf"] = "2026-10-06"


# ------------------------------------------------------------------ OIL AND GAS
SNAP = "https://ppac.gov.in/download.php?file=rep_studies/1790418308_Final_Snapshot_of_Indias_Oil_Gas_data_augpages.pdf"
SNAPN = "PPAC, Snapshot of India's Oil and Gas data"
PIBSPR = "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2243931&reg=20&lang=1"
GASP = "https://ppac.gov.in/download.php?file=whatsnew/1790767903_Gas_Price_Ceiling_October2026-March2027.pdf"
og = {
    "marketSize": [
        F("Crude oil import bill (US dollars)", "$123.38 billion", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
        F("Crude oil import bill (rupees)", "₹10,92,248 crore", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
        F("Active domestic LPG customers", "32.78 crore", "September 2026", SNAPN, SNAP, "2026-08-31"),
        F("Operational CNG stations", "9,096", "July 2026", "PNGRB data in the PPAC snapshot", SNAP, "2026-08-31"),
        F("PNG connections nationwide", "1.76 crore", "July 2026", "PNGRB data in the PPAC snapshot", SNAP, "2026-08-31"),
    ],
    "growth": [
        F("BPCL consolidated net profit growth", "93.8%", "FY26", "Bharat Petroleum results", "https://www.bharatpetroleum.in/images/files/stexchresults26ss.pdf", "2026-05-19"),
        F("Reliance O2C revenue growth", "5.7%", "FY26", "Reliance Industries media release", "https://www.ril.com/sites/default/files/2026-04/24042026_Media_Release_RIL_Q4_FY2025-26_Financial_and_Operational_Performance.pdf", "2026-04-24"),
    ],
    "gdpJobs": [
        F("Petroleum sector share of central government revenue", "14%", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
        F("Combined contribution to the exchequer", "₹8,17,540 crore", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
        F("Crude oil import dependency", "88.7%", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
        F("Petroleum subsidy as share of GDP", "0.08%", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
    ],
    "exportsFdi": [
        F("Strategic petroleum reserve storage capacity", "5.33 MMT", "March 2026", "PIB", PIBSPR, "2026-03-24"),
        F("Indian crude basket average price", "$70.99 a barrel", "FY 2025-26", SNAPN, SNAP, "2026-08-31"),
        F("Gas price ceiling for deepwater and HP-HT fields", "US$ 9.89 per MMBtu", "Oct 2026 to Mar 2027", "PPAC notification", GASP, "2026-09-30"),
        F("Indian Oil crude refining throughput", "75.45 MMT", "FY26", "Indian Oil annual report", "https://iocl.com/download/IndianOil_IAR_Single07082026.pdf", "2026-08-07"),
    ],
    "policies": [
        Pol("Natural Gas and Petroleum Products Distribution Order, 24 March 2026", "Under the Essential Commodities Act, it speeds up gas pipeline laying, requires delivery authentication and sets rationing quotas during the West Asia disruption.", "PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2262414&reg=48&lang=2", "2026-05-18"),
        Pol("Gas price ceiling for deepwater and HP-HT fields", "PPAC fixed the ceiling at US$ 9.89 per MMBtu for October 2026 to March 2027 (notified 30 September 2026).", "PPAC notification", GASP, "2026-09-30"),
        Pol("Domestic (APM) gas price ceiling for ONGC and Oil India", "For October 2026 the price is capped at US$ 7.00 per MMBtu although the formula gave US$ 11.22.", "PPAC notification", "https://ppac.gov.in/download.php?file=gasprice/1790767900_Domestic_Natural_Gas_Price_October_2026.pdf", "2026-09-30"),
    ],
    "charts": [
        Ch("spr", "bars", "Strategic petroleum reserve caverns", "2026, million tonnes", "MMT",
           [{"label": "Padur (Karnataka)", "value": 2.5}, {"label": "Mangaluru (Karnataka)", "value": 1.5}, {"label": "Visakhapatnam (Andhra Pradesh)", "value": 1.33}], "PIB", PIBSPR, "2026-03-24"),
        Ch("lpgmix", "columns", "Active domestic LPG customers", "September 2026, lakh customers", "lakh",
           [{"label": "Other customers", "value": 2220.3}, {"label": "PMUY (Ujjwala) beneficiaries", "value": 1057.2}], SNAPN, SNAP, "2026-08-31"),
    ],
    "timeline": [
        {"date": "Mar 2026", "title": "Strategic petroleum reserve stands at 5.33 MMT", "detail": "Three underground sites hold the reserve; a Phase II expansion of 6.5 MMT was described as under way (PIB).", "future": False},
        {"date": "24 Mar 2026", "title": "Distribution Order notified", "detail": "Controls and faster clearances for city gas pipelines to protect domestic supply (PIB).", "future": False},
        {"date": "30 Sep 2026", "title": "PPAC sets gas price ceilings for the second half of FY27", "detail": "US$ 9.89 per MMBtu for HP-HT fields and a US$ 7.00 cap on APM gas (PPAC).", "future": False},
    ],
    "drivers": [
        "Fast city gas rollout: 9,096 CNG stations and 1.76 crore PNG connections by July 2026 (PNGRB via PPAC).",
        "Government revenue base: petroleum gave ₹8,17,540 crore to the exchequer, about 14% of central revenue, in FY2025-26 (PPAC).",
        "Strategic reserve buffer of 5.33 MMT with a 6.5 MMT Phase II planned (PIB).",
    ],
    "challenges": [
        "Import bill of ₹10,92,248 crore ($123.38 billion) with 88.7% import dependency in FY2025-26 (PPAC).",
        "Gas price gap: the formula price of US$ 11.22 per MMBtu was capped at US$ 7.00 for October 2026, squeezing producer realisation (PPAC).",
        "A reserve of 5.33 MMT is small against daily consumption of about 55 lakh barrels (PIB; PPAC).",
    ],
    "opsAngle": [
        "With 88.7% crude import dependency, planners must coordinate reserve drawdowns with pipeline throughput so refineries keep running when shipping is disrupted (PPAC).",
        "Moving households from LPG cylinders to piped gas (1.76 crore connections) removes bottling and cylinder-delivery bottlenecks (PNGRB).",
        "Capped gas prices change fuel-mix economics for fertiliser and city gas users, so sourcing plans need price-band scenarios (PPAC).",
    ],
    "players": ["GAIL (India) Limited", "Oil and Natural Gas Corporation", "Hindustan Petroleum Corporation"],
    "conflicts": [
        "Crude imports for FY2025-26: PPAC's snapshot table rounds to 245.8 MMT while the monthly report gives 245.38 MMT; this page uses the 245.77 MT total from PPAC's import-export table.",
        "ONGC profit growth (about 30%) was cited only on an aggregator site, so it is not used; the O2C revenue and BPCL profit figures come from company releases.",
    ],
}
merge(ind["oilgas"], og)
o = ind["oilgas"]
for t in o["timeline"]:
    if t["date"].startswith("31 Mar 2027"):
        t["detail"] = "PPAC's ceilings for 1 Oct 2026 to 31 Mar 2027 end: US$ 9.89 per MMBtu for HP-HT fields and US$ 7.00 for APM gas."
o["notFound"] = [n for n in o["notFound"] if not re.match(r"(India's crude import bill|Share of oil and gas|Strategic petroleum reserve capacity|LPG consumer count|The Natural Gas and Petroleum Products Distribution Order|Reliance, ONGC, IOC|Retail price and under-recovery)", n)]
o["notFound"] += [
    "Revenue of IOCL, Reliance, ONGC, BPCL, HPCL and GAIL: a combined chart was dropped because one company link cannot back all six figures.",
    "ONGC and HPCL FY26 profit and throughput from the companies' own filings: not opened.",
    "Retail petrol and diesel price trends and OMC margin data: PPAC daily PDFs not read.",
]

# ------------------------------------------------------------------ E-COMMERCE AND LOGISTICS
BS = "https://www.business-standard.com/industry/news/india-s-ecommerce-market-to-hit-345-bn-by-2030-dark-stores-to-triple-126090200785_1.html"
GEM = "https://pib.gov.in/PressReleasePage.aspx?PRID=2296138"
GCT = "https://pib.gov.in/PressReleasePage.aspx?PRID=2295944"
PN3 = "https://www.dpiit.gov.in/static/uploads/2026/07/ceb0cae74fd4e83094dc6b50c3d53f92.pdf"
EC = {
    "marketSize": [
        F("E-commerce market size", "$125 billion", "CY2024", "Business Standard", BS, "2026-09-02"),
        F("GeM gross merchandise value in the year", "₹5 lakh crore", "FY 2025-26", "PIB", GEM, "2026-08-08"),
        F("GeM cumulative gross merchandise value", "₹20 lakh crore", "as of August 2026", "PIB", GEM, "2026-08-08"),
        F("Dark stores in operation", "2,525", "CY2025", "Business Standard", BS, "2026-09-02"),
    ],
    "growth": [
        F("Delhivery express parcel volume growth", "72%", "Q4 FY26", "The Economic Times", "https://economictimes.indiatimes.com/markets/stocks/earnings/delhivery-q4-results-net-profit-flat-at-rs-72-4-crore-revenue-rises-30-yoy/articleshow/131137327.cms", "2026-05-16"),
        F("Adani Ports cargo volume growth", "11%", "FY26", "The Economic Times (ETInfra)", "https://infra.economictimes.indiatimes.com/news/ports-shipping/adani-ports-reports-9-profit-growth-in-q4-fy26-traffic-surges-past-500-mmt/130629062", "2026-04-30"),
        F("Mahindra Logistics consolidated revenue growth", "15%", "FY26", "Mahindra Logistics press release", "https://mahindralogistics.com/tabs/cms/files/Press_Release_Q4FY26.pdf", "2026-04-23"),
        F("TCI consolidated revenue growth", "9.4%", "FY26", "Transport Corporation of India", "https://tcil.com/wp-content/uploads/2026/06/Transport-Corporation-of-India-Ltd.-TCI-Announces-Strong-Growth-in-Q4-FY2026-Financial-Results.pdf", "2026-05-26"),
    ],
    "gdpJobs": [
        F("Logistics cost as a share of GDP", "7.97%", "2023-24", "PIB (NCAER-DPIIT study)", "https://pib.gov.in/PressReleasePage.aspx?PRID=2168995&reg=48&lang=2", "2025-09-20"),
        F("E-commerce projected share of GDP", "2.5%", "2030 projection", "Business Standard", BS, "2026-09-02"),
        F("GeM registered micro and small enterprise sellers", "12.25 lakh", "August 2026", "PIB", GEM, "2026-08-08"),
    ],
    "exportsFdi": [
        F("FDI cap for inventory-based e-commerce exporting Indian-made goods", "100% (automatic route)", "from Press Note 3, 23 July 2026", "DPIIT", PN3, "2026-07-23"),
        F("Private investment mobilised by the cargo terminal policy", "₹10,000 crore", "July 2026", "PIB", GCT, "2026-08-07"),
        F("Adani Ports annual cargo volume", "500.8 MMT", "FY26", "The Economic Times (ETInfra)", "https://infra.economictimes.indiatimes.com/news/ports-shipping/adani-ports-reports-9-profit-growth-in-q4-fy26-traffic-surges-past-500-mmt/130629062", "2026-04-30"),
        F("Delhivery express parcels in the year", "1 billion", "FY26", "The Economic Times", "https://economictimes.indiatimes.com/markets/stocks/earnings/delhivery-q4-results-net-profit-flat-at-rs-72-4-crore-revenue-rises-30-yoy/articleshow/131137327.cms", "2026-05-16"),
    ],
    "policies": [
        Pol("Press Note 3 of 2026: FDI in export e-commerce", "Issued 23 July 2026: 100% FDI under the automatic route for inventory-based e-commerce entities that export only Indian-made goods.", "DPIIT", PN3, "2026-07-23"),
        Pol("Gati Shakti Multi-Modal Cargo Terminal policy", "142 private cargo terminals with 224 MTPA capacity were commissioned by mid-2026 and handled 146 MT of rail freight in FY26.", "PIB", GCT, "2026-08-07"),
        Pol("TCS on e-commerce sellers cut to 0.5%", "From 10 July 2024 the tax collected at source under Section 52 fell from 1% to 0.5% to ease cash flow for sellers on platforms.", "PIB", "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2027982&reg=48&lang=2", "2024-06-22"),
    ],
    "charts": [
        Ch("qshare", "bars", "Quick commerce market share", "FY26, % share", "%",
           [{"label": "Blinkit", "value": 44, "note": "900M orders"}, {"label": "Zepto", "value": 25}, {"label": "Swiggy Instamart", "value": 20}, {"label": "Others", "value": 11}], "Business Standard", BS, "2026-09-02"),
        Ch("dfc", "bars", "Dedicated freight corridors commissioned", "2026, route kilometres", "km",
           [{"label": "Western DFC (Dadri to JNPT)", "value": 1506}, {"label": "Eastern DFC (Ludhiana to Sonnagar)", "value": 1337}], "PIB", GCT, "2026-08-07"),
        Ch("darkstores", "columns", "Dark stores by platform", "Q4 FY26, stores", "stores",
           [{"label": "Blinkit", "value": 2243}, {"label": "Zepto", "value": 1139}, {"label": "Swiggy Instamart", "value": 1038}], "Business Standard", BS, "2026-09-02"),
    ],
    "timeline": [
        {"date": "Jul 2024", "title": "TCS on e-commerce sellers halved", "detail": "Rate cut from 1% to 0.5% under Section 52 of the GST law (PIB).", "future": False},
        {"date": "20 Sep 2025", "title": "NCAER-DPIIT logistics cost study launched", "detail": "It puts logistics cost at 7.97% of GDP for 2023-24 (PIB).", "future": False},
        {"date": "23 Jul 2026", "title": "Press Note 3 allows export-only inventory e-commerce", "detail": "100% FDI under the automatic route for inventory models that export Indian-made goods (DPIIT).", "future": False},
        {"date": "Aug 2026", "title": "Both dedicated freight corridors operating", "detail": "Eastern (1,337 km) and Western (1,506 km) corridors, with 142 cargo terminals commissioned (PIB).", "future": False},
    ],
    "drivers": [
        "Quick-commerce build-out: dark stores at 2,525 in 2025 and projected to triple by 2030 (Business Standard).",
        "Public procurement online: GeM reached ₹5 lakh crore of annual transactions in FY26 (PIB).",
        "Parcel growth: Delhivery's express parcels grew 72% in Q4 FY26 (Economic Times).",
    ],
    "challenges": [
        "Marketplaces face enforcement against deceptive design (dark patterns) under consumer-protection guidelines.",
        "Quick-commerce economics depend on order density per dark store and on moving into higher-priced non-grocery items (Business Standard).",
        "Small shippers pay more per unit to move goods than large corporate shippers, according to the NCAER study (PIB).",
    ],
    "opsAngle": [
        "With both freight corridors commissioned and 142 cargo terminals running, planners can move containers rail-to-port faster and cut inland transit time (PIB).",
        "Blinkit's 2,243 dark stores show that micro-hub density and neighbourhood routing, not line-haul scale, decide urban delivery cost (Business Standard).",
        "Logistics cost at 7.97% of GDP is the official baseline, so improvement comes from rail-port integration and better utilisation, not from a hypothetical 14% (PIB).",
    ],
    "players": ["Transport Corporation of India", "Blue Dart Express"],
    "conflicts": [
        "Logistics cost: the older figure of 13-14% (and 16%) of GDP in secondary reports differs from 7.97% in the NCAER-DPIIT study on PIB; this page uses the PIB figure.",
        "Dark store counts range from about 2,000 to 2,525 in news, and 2,243 for Blinkit alone in Q4 FY26; figures differ by date and by who counts.",
        "ONDC: a cumulative GMV of ₹18.4 lakh crore appeared in the Opus output against ONDC, but earlier search results gave the same number for GeM; it is not used. ONDC seller counts range from 5 lakh to 7.64 lakh across sources and are not used.",
    ],
}
merge(ind["ecom"], EC)
e = ind["ecom"]
e["conflicts"] = [c for c in e["conflicts"] if not c.startswith("The 16% of GDP")]
e["notFound"] = [n for n in e["notFound"] if not re.match(r"(Size of India's e-commerce|Quick-commerce market shares|Press Note 3 of 2026|Gati Shakti Cargo Terminals|ONDC and GeM latest|Private player revenue)", n)]
e["notFound"] += [
    "ONDC seller and transaction counts: sources disagree, so none are shown.",
    "Combined revenue chart for Adani Ports, Delhivery, Mahindra Logistics, Blue Dart and TCI: dropped because one link cannot back all five figures.",
    "Blue Dart FY26 revenue and quick-commerce platform results from company filings: not opened.",
    "Dark-pattern guideline details (the 13 listed practices): not opened on the official page.",
]

# ------------------------------------------------------------------ FMCG AND RETAIL
FD = "https://www.dpiit.gov.in/static/uploads/2026/07/80e21324272b1aee3dbb34bbb3517d2b.pdf"
PLFS = "https://www.mospi.gov.in/uploads/latestReleases/latest_release_1774607827733_3e8964a9-268b-4cc9-ad65-cfc8a9e32f08_Press_note_AR_PLFS_2025_23032025_V2.1_26032026_final.pdf"
EDO = "https://www.business-standard.com/amp/economy/news/govt-cuts-import-duty-on-refined-palm-oil-and-soybean-oil-to-27-5-126092301504_1.html"
NIQ4 = "https://nielseniq.com/global/en/news-center/2026/niq-gst-2-0-transition-reshapes-indias-fmcg-growth-landscape/"
FM = {
    "marketSize": [
        F("India retail market size", "$690 billion", "2021", "Invest India", "https://www.investindia.gov.in/sector/retail-e-commerce", "2022-02-02"),
        F("India retail market, projected (Redseer estimate)", "above $1.6 trillion", "by 2030", "Business Standard, quoting Redseer", "https://www.business-standard.com/industry/news/india-retail-market-trillion-2030-trade-supply-chains-125032700607_1.html", "2025-03-27"),
        F("Kirana stores in India", "about 13 million", "2024", "Business Standard, citing the distributors' federation", "https://www.business-standard.com/industry/news/kirana-stores-face-tough-diwali-with-30-sales-drop-quick-commerce-thrives-124102500701_1.html", "2024-10-25"),
        F("Nestle India revenue from operations (standalone)", "₹23,154.6 crore (₹231,546.0 million)", "FY26", "Nestle India audited results", "https://www.nestle.in/sites/g/files/pydnoa451/files/2026-04/AFRs31032026signed-1.pdf", "2026-04-21"),
        F("Britannia consolidated revenue from operations", "₹19,151.59 crore", "FY26", "Britannia audited results", "https://media.britannia.co.in/Audited_Consolidated_Financial_Results_31_03_2026_c1fd2887e5.pdf", "2026-05-07"),
    ],
    "growth": [
        F("Tata Consumer India branded business, underlying volume growth", "13%", "FY26", "Tata Consumer results release", "https://www.tataconsumer.com/news/results-quarter-and-year-ended-31st-march-2026", "2026-05-08"),
        F("Marico India underlying volume growth (a seven-year high)", "8%", "FY26", "Marico information update", "https://marico.com/investorspdf/Information_Update_Q4FY26.pdf", "2026-05-05"),
        F("Godrej Consumer underlying volume growth", "6%", "FY26", "Godrej Consumer press release", "https://www.godrejcp.com/uploads/SE_Press_Release_Final_signed_54b3618a58.pdf", "2026-05-06"),
        F("Nestle India total sales growth", "14.9%", "FY26", "Nestle India audited results", "https://www.nestle.in/sites/g/files/pydnoa451/files/2026-04/AFRs31032026signed-1.pdf", "2026-04-21"),
    ],
    "gdpJobs": [
        F("Share of workers in trade, hotels and restaurants", "12.9%", "CY2025", "MoSPI, PLFS annual report press note", PLFS, "2026-03-27"),
        F("Total employment, persons aged 15 and above", "56.2 crore", "Jul-Sep 2025", "PIB, Economic Survey 2025-26", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2220800", "2026-01-30"),
        F("Services share of gross value added", "56.4%", "FY26, first advance estimate", "PIB, Economic Survey 2025-26", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2220800", "2026-01-30"),
    ],
    "exportsFdi": [
        F("Cumulative FDI equity inflow into retail trading", "US$ 5,028.12 million (₹36,740.24 crore)", "Apr 2000 to Mar 2026", "DPIIT FDI fact sheet", "https://www.dpiit.gov.in/static/uploads/2026/06/41192ca92c1de34eb064800fbffa0379.pdf", "2026-06-01"),
        F("FDI equity inflow into single-brand retail", "US$ 161.14 million", "CY2025", "DPIIT", FD, "2026-07-01"),
        F("FDI equity inflow into multi-brand retail", "US$ 9.70 million", "CY2025", "DPIIT", FD, "2026-07-01"),
        F("FDI equity inflow into cash-and-carry wholesale", "US$ 4,142.43 million", "CY2025", "DPIIT", FD, "2026-07-01"),
    ],
    "policies": [
        Pol("FDI in multi-brand retail (Press Note 5, 2012)", "Foreign investment is capped at 51% with government approval, a minimum of US$ 100 million and half of it in back-end infrastructure within three years.", "DPIIT Press Note 5 (2012)", "https://www.dpiit.gov.in/static/uploads/2025/07/384fbc020758137b3622fd8dd7bbf016.pdf", "2012-09-20"),
        Pol("Edible oil duty cut, May 2025", "Basic duty on crude palm, soybean and sunflower oil halved from 20% to 10%; effective duty fell from 27.5% to 16.5%.", "Business Standard", "https://www.business-standard.com/markets/commodities/india-slashes-import-duty-on-crude-edible-oils-to-curb-rising-food-prices-125053001844_1.html", "2025-05-30"),
        Pol("Edible oil duty cut, September 2026", "From 24 September 2026 duty on crude palm and soybean oil fell from 10% to 5% and on crude sunflower oil to 0%, with wholesale food inflation at 7.1% in August 2026.", "Business Standard", EDO, "2026-09-23"),
    ],
    "charts": [
        Ch("fdisub", "bars", "FDI into trading sub-sectors", "CY2025, US$ million", "US$ mn",
           [{"label": "Cash-and-carry wholesale", "value": 4142.43}, {"label": "Single-brand retail", "value": 161.14}, {"label": "E-commerce", "value": 57.32}, {"label": "Multi-brand retail", "value": 9.7}], "DPIIT", FD, "2026-07-01"),
        Ch("workers", "bars", "Where India's workers are employed", "CY2025, % of workers", "%",
           [{"label": "Agriculture", "value": 43.0}, {"label": "Other services", "value": 13.1}, {"label": "Trade, hotels and restaurants", "value": 12.9}, {"label": "Manufacturing", "value": 12.1}, {"label": "Construction", "value": 12.0}, {"label": "Transport, storage and communication", "value": 5.8}], "MoSPI, PLFS annual report", PLFS, "2026-03-27"),
        Ch("oilduty", "bars", "Edible oil basic duty after the September 2026 cut", "From 24 Sep 2026, %", "%",
           [{"label": "Crude palm (was 10%)", "value": 5}, {"label": "Crude soybean (was 10%)", "value": 5}, {"label": "Crude sunflower (was 10%)", "value": 0}, {"label": "Refined palm (was 32.5%)", "value": 27.5}, {"label": "Refined soybean (was 32.5%)", "value": 27.5}, {"label": "Refined sunflower (was 32.5%)", "value": 22.5}], "Business Standard", EDO, "2026-09-23"),
        Ch("niqq4", "columns", "FMCG growth after the GST cut", "Oct-Dec 2025, % year on year", "%",
           [{"label": "Value growth", "value": 7.8}, {"label": "Rural volume growth", "value": 2.9}, {"label": "Urban volume growth", "value": 2.3}], "NielsenIQ press release", NIQ4, "2026-03-13"),
    ],
    "timeline": [
        {"date": "May 2025", "title": "Crude edible oil duty halved", "detail": "Basic duty on crude palm, soybean and sunflower oil cut from 20% to 10% (Business Standard).", "future": False},
        {"date": "9 Aug 2026", "title": "FMCG firms signal price hikes for the September quarter", "detail": "HUL flagged another 2-5%, Godrej Consumer about 5% and Britannia 1.5-2% (Business Standard).", "future": False},
        {"date": "24 Sep 2026", "title": "Edible oil duty cut again", "detail": "Crude palm and soybean oil duty to 5% and crude sunflower oil to 0% (Business Standard).", "future": False},
    ],
    "drivers": [
        "The GST cut on soap, shampoo and toothpaste lifted FMCG value growth to 7.8% in Oct-Dec 2025 (NielsenIQ).",
        "Cheaper edible oil: duty on crude palm and soybean fell to 5% from 24 Sep 2026, easing costs for biscuit, snack and oil makers (Business Standard).",
        "Volume is returning for large players: Tata Consumer India +13%, Marico India +8% and Godrej Consumer +6% in FY26 (company releases).",
    ],
    "challenges": [
        "Input costs rising again: HUL guided 8-10% material inflation for FY27 and took 2-5% price hikes (Business Standard, May 2026).",
        "Small, stepwise price increases: Britannia saw about 1% price impact in Q1 FY27 and planned 1.5-2% more, mostly on Rs 5 and Rs 10 packs (Business Standard).",
        "Fragmented retail: about 13 million kirana stores make distribution reach costly (Business Standard).",
    ],
    "opsAngle": [
        "With about 13 million kiranas, beat planning and distributor reach decide growth as much as the product does (Business Standard).",
        "Britannia holds Rs 5 and Rs 10 price points and changes pack weight, so every price move becomes a packaging and line-changeover task (Business Standard).",
        "DMart ran 500 stores at a 7.8% standalone EBITDA margin in FY26, which shows how tightly a low-price retailer must run its supply chain (company results).",
    ],
    "players": ["Nestle India", "Colgate-Palmolive (India)", "Avenue Supermarts (DMart)", "Godrej Consumer Products", "Dabur India", "Marico", "Britannia Industries", "Tata Consumer Products"],
    "conflicts": [
        "Britannia FY26 revenue: ₹19,151.59 crore in the company's consolidated results against ₹18,858 crore in a news report; this page uses the company figure.",
        "Kirana share of FMCG sales: about 85% (Business Standard, Oct 2024) against more than 90% (Business Standard, Jun 2025).",
        "Godrej Consumer FY26: revenue from operations +8.5% (Business Standard) against consolidated sales +9% (company release); revenue and sales differ.",
        "India retail size: $700 billion for 2019 (an Invest India blog) against $690 billion for 2021 (Invest India sector page); both are old.",
        "Edible oil cut, September 2026: basic-duty cuts (10% to 5%) and effective-duty cuts are different bases in two Business Standard reports.",
    ],
}
merge(ind["fmcg"], FM)
f = ind["fmcg"]
f["notFound"] = [n for n in f["notFound"] if not re.match(r"(Total size of the Indian FMCG|Retail sector size|FDI in multi-brand|Nestle India, Britannia|HUL and DPIIT|Edible-oil import duty|Effective date of the GST)", n)]
f["notFound"] += [
    "Current (2025-26) total size of the FMCG market from NielsenIQ, Kantar or a ministry: not found; only IBEF and paid research sellers appeared.",
    "Current organised-retail share and an original NielsenIQ or Kantar page with a kirana count: not found.",
    "The original NielsenIQ Q2 2026 report (the channel figures still come from a RetailIntel summary).",
    "Effective date of the GST changes (22 Sep 2025) on the CBIC rate notification page: the page would not open; the date is supported by PIB and the twin integrated-tax notification.",
    "Customs notification numbers for the edible oil duty cuts: not found on CBIC.",
    "FMCG's share of GDP and retail employment from an official source: not found; only the trade-sector share of workers is shown.",
    "Full-year FY26 volume growth for Nestle India, Britannia, Dabur and Colgate: not disclosed in the pages opened.",
]

io.open(P, "w", encoding="utf-8", newline="\n").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
for k in ("fmcg", "ecom", "oilgas"):
    i = ind[k]
    print(k, len(i["charts"]), len(i["timeline"]), len(i["policies"]), len(i["marketSize"]), len(i["notFound"]), len(i["conflicts"]))
