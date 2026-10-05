import json, io

P = "data/industry-facts.json"
d = json.load(io.open(P, encoding="utf-8"))

CONS = ("PPAC, consumption of petroleum products", "https://ppac.gov.in/consumption/products-wise", "2026-04-06")
CONSG = ("PPAC consumption data, growth calculated by this site", "https://ppac.gov.in/consumption/products-wise", "2026-04-06")
IMP = ("PPAC, import and export", "https://ppac.gov.in/import-export", "2026-07-21")
PROD = ("PPAC, indigenous crude oil production", "https://ppac.gov.in/production/indigenous-crude-oil", "2026-06-01")
REF = ("PPAC, installed refinery capacity", "https://ppac.gov.in/infrastructure/installed-refinery-capacity", "2026-04-01")
WA = ("Ministry of Petroleum and Natural Gas briefing, on PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2238525&reg=3&lang=1", "2026-03-11")
ETH = ("PIB backgrounder on the Ethanol Blended Petrol programme", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2283376&reg=3&lang=1", "2026-07-10")


def F(label, value, period, src):
    return {"label": label, "value": value, "period": period, "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


def C(id, kind, title, subtitle, unit, items, src):
    return {"id": id, "kind": kind, "title": title, "subtitle": subtitle, "unit": unit, "items": items,
            "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


def Pol(name, what, src):
    return {"name": name, "what": what, "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


og = {
    "id": "oilgas",
    "name": "Oil and gas",
    "asOf": "2026-10-05",
    "overview": "Oil and gas covers finding crude, importing it, refining it into petrol, diesel, LPG and jet fuel, and moving it to millions of customers through pipelines, tankers and fuel stations. India produces little crude and imports most of what it burns, so this industry is really a giant supply chain problem: ships, refineries, storage and delivery, under price and geopolitical pressure.",
    "bigIdea": "India imports almost ten times the crude it produces, refines it into fuels at home and ships surplus out, so supply security (where crude and LPG come from, and how fast the system adapts) is the central story, as the March 2026 West Asia disruption showed.",
    "flow": [
        {"label": "Source", "stat": "245.77 MT crude imported", "note": "India produced only 25.98 MT of crude in FY2025-26 (PPAC)."},
        {"label": "Ship in", "stat": "70% of crude outside Hormuz", "note": "Up from about 55% earlier, after sourcing from around 40 countries (Ministry briefing, March 2026)."},
        {"label": "Refine", "stat": "267.1 MMTPA capacity", "note": "Installed refining capacity on 1 April 2026 (PPAC)."},
        {"label": "Deliver", "stat": "241.6 MT consumed", "note": "Diesel is the largest product at 94.7 MT; over one lakh retail outlets serve petrol and diesel (PPAC; PIB)."},
    ],
    "timeline": [
        {"date": "2001", "title": "Ethanol blending pilot", "detail": "The first step of a two-decade programme (PIB)."},
        {"date": "Jan 2013", "title": "Ethanol policy notified", "detail": "Target of 5% blending in 10 States and UTs; blending stayed near 1.5% until 2014 (PIB)."},
        {"date": "May 2018", "title": "National Policy on Biofuels", "detail": "Allowed maize and surplus grain as feedstock, not only sugarcane (PIB)."},
        {"date": "Jun 2022", "title": "E10 target met", "detail": "Five months ahead of schedule (PIB)."},
        {"date": "8-9 Mar 2026", "title": "LPG and natural gas orders issued", "detail": "Refineries told to maximise LPG; a Natural Gas Control Order protects priority users (Ministry briefing on PIB)."},
        {"date": "11 Mar 2026", "title": "Government briefs on West Asia disruption", "detail": "About 47.4 MMSCMD of gas supply hit; domestic LPG output raised about 25% (PIB)."},
        {"date": "1 Apr 2026", "title": "Refining capacity stands at 267.1 MMTPA", "detail": "PPAC's installed capacity table (PPAC)."},
        {"date": "Nov 2025 to Jun 2026", "title": "20% ethanol blending reached for the year", "detail": "Blending was 19.2% in 2024-25 and 20% in 2025-26 so far (PIB, 10 Jul 2026)."},
        {"date": "31 Mar 2027", "title": "Current gas price ceiling period ends", "detail": "PPAC lists a gas price ceiling for 1 Oct 2026 to 31 Mar 2027; the value was not read.", "future": True},
    ],
    "charts": [
        C("cons", "bars", "Fuel consumption by product", "FY2025-26, million tonnes", "MT",
          [{"label": "Diesel (HSD)", "value": 94.71}, {"label": "Petrol (MS)", "value": 42.59}, {"label": "LPG", "value": 33.17},
           {"label": "Petroleum coke", "value": 18.4}, {"label": "Naphtha", "value": 11.73}, {"label": "Bitumen", "value": 8.7}, {"label": "ATF (jet fuel)", "value": 9.16}], CONS),
        C("consgrow", "bars", "Fuel demand growth", "FY2025-26 over FY2024-25, % (calculated from PPAC tonnage)", "%",
          [{"label": "Petrol (MS)", "value": 6.5}, {"label": "LPG", "value": 5.9}, {"label": "Diesel (HSD)", "value": 3.6},
           {"label": "ATF", "value": 2.0}, {"label": "All products", "value": 1.0}], CONSG),
        C("crude", "bars", "Crude oil: made at home vs imported", "FY2025-26, million tonnes", "MT",
          [{"label": "Crude imported", "value": 245.77}, {"label": "Crude produced in India", "value": 25.98}], IMP),
        C("crudem", "columns", "Monthly crude imports", "Oct 2025 to Mar 2026, million tonnes", "MT",
          [{"label": "Oct", "value": 21.0}, {"label": "Nov", "value": 21.24}, {"label": "Dec", "value": 21.59},
           {"label": "Jan", "value": 21.09}, {"label": "Feb", "value": 20.13}, {"label": "Mar", "value": 19.39}], IMP),
        C("lpgm", "columns", "Monthly LPG imports", "Oct 2025 to Mar 2026, thousand tonnes", "'000 t",
          [{"label": "Oct", "value": 1917}, {"label": "Nov", "value": 1816}, {"label": "Dec", "value": 1996},
           {"label": "Jan", "value": 2172}, {"label": "Feb", "value": 1700}, {"label": "Mar", "value": 807}], IMP),
        C("exports", "bars", "Fuels exported", "FY2025-26, million tonnes (total 61.43)", "MT",
          [{"label": "Diesel (HSD)", "value": 27.32}, {"label": "Petrol (MS)", "value": 16.67}, {"label": "ATF", "value": 6.81}], IMP),
        C("refs", "bars", "Largest refineries by capacity", "As on 1 April 2026, million tonnes a year", "MMTPA",
          [{"label": "Reliance RPL (SEZ), Jamnagar", "value": 35.2}, {"label": "Reliance Jamnagar", "value": 33.0}, {"label": "Nayara, Vadinar", "value": 20.0},
           {"label": "BPCL Kochi", "value": 15.5}, {"label": "IOC Panipat", "value": 15.0}, {"label": "IOC Paradip", "value": 15.0},
           {"label": "MRPL Mangalore", "value": 15.0}, {"label": "HPCL Vizag", "value": 15.0}], REF),
        C("ethanol", "columns", "Ethanol blended in petrol", "Share of petrol, % (2025-26 is November to June)", "%",
          [{"label": "2020-21", "value": 8.1}, {"label": "2021-22", "value": 10.0}, {"label": "2022-23", "value": 12.1},
           {"label": "2023-24", "value": 14.6}, {"label": "2024-25", "value": 19.2}, {"label": "2025-26", "value": 20}], ETH),
        C("gas", "bars", "Natural gas in March 2026", "Million standard cubic metres a day (MMSCMD)", "MMSCMD",
          [{"label": "Total consumption", "value": 189}, {"label": "Produced in India", "value": 97.5}, {"label": "Supply hit by force majeure", "value": 47.4}], WA),
    ],
    "marketSize": [
        F("Installed refining capacity", "267.116 MMTPA (267,116 thousand tonnes)", "1 April 2026", REF),
        F("Petroleum product consumption", "241.6 million tonnes (provisional)", "FY2025-26", CONS),
        F("Crude oil imported", "245.77 million tonnes", "FY2025-26", IMP),
        F("Crude oil produced in India (without condensate)", "25.98 million tonnes (27.95 with condensate)", "FY2025-26", PROD),
        F("Daily crude consumption", "about 55 lakh barrels", "March 2026", WA),
        F("Natural gas consumption", "about 189 MMSCMD, of which 97.5 produced in India", "March 2026", WA),
    ],
    "growth": [
        F("Petroleum product consumption", "+1.0% to 241.6 MT (calculated from PPAC: 239.2 MT in FY2024-25)", "FY2025-26", CONSG),
        F("Petrol, LPG and diesel demand", "+6.5%, +5.9% and +3.6%", "FY2025-26", CONSG),
        F("Ethanol share in petrol", "19.2% (2024-25) to 20% (2025-26)", "2024-25 to 2025-26", ETH),
        F("Consumption in August 2026", "down 2.8% year on year", "Aug 2026", ("PPAC, consumption of petroleum products", "https://ppac.gov.in/consumption/products-wise", "2026-09-09")),
    ],
    "gdpJobs": [
        F("Bank finance for ethanol plants, storage and logistics", "close to ₹1 lakh crore a year (public sector banks)", "as stated July 2026", ETH),
        F("Ethanol supply available a year", "about 1,200 crore litres, against 500-600 crore litres needed for 10% blending in 2021", "2021 to 2026", ETH),
        F("Retail outlets selling petrol and diesel", "over one lakh", "as stated July 2026", ETH),
    ],
    "exportsFdi": [
        F("Petroleum products exported", "61.43 million tonnes (diesel 27.32, petrol 16.67, ATF 6.81)", "FY2025-26", IMP),
        F("Net import (crude plus products minus exports)", "230.53 million tonnes", "FY2025-26", IMP),
        F("Countries India imports crude from", "around 40", "March 2026", WA),
        F("Share of crude imports arriving outside the Strait of Hormuz", "about 70%, against about 55% earlier", "March 2026", WA),
    ],
    "policies": [
        Pol("Ethanol Blended Petrol programme", "Blends ethanol made from sugarcane, maize and surplus grain into petrol to cut crude imports and support farmers. Blending rose from about 1.5% in 2014 to 20% in 2025-26.", ETH),
        Pol("Natural Gas Control Order, 9 March 2026", "Under the Essential Commodities Act: household PNG and vehicle CNG get 100% supply; industry and tea about 80%; fertiliser about 70%; refineries and petrochemicals take about a 35% cut.", WA),
        Pol("LPG maximisation order, 8 March 2026", "Refineries and petrochemical complexes divert propane, butane and related streams into LPG; domestic LPG output rose about 25% and all of it went to households.", WA),
        Pol("Allocation committee for commercial LPG", "A three-member committee of executive directors from IOCL, HPCL and BPCL reviews supply to restaurants, hotels and other commercial users.", WA),
        Pol("Subsidised LPG for Ujjwala (PMUY) households", "PMUY households pay ₹613 per cylinder while the Delhi price for others is ₹913 after a ₹60 rise (March 2026).", WA),
    ],
    "drivers": [
        "Rising fuel demand: petrol +6.5%, LPG +5.9% and diesel +3.6% in FY2025-26 (PPAC).",
        "Large, modern refining base: 267.1 MMTPA, with two Jamnagar refineries together at 68.2 MMTPA (PPAC).",
        "Export earnings: 61.43 MT of fuels shipped out in FY2025-26 (PPAC).",
        "Ethanol blending: 20% reached, cutting crude needs and creating a ₹1 lakh crore a year financing wave (PIB).",
        "Diverse crude sourcing: about 40 supplier countries and 70% of imports arriving outside Hormuz (Ministry briefing).",
        "Refineries ran at very high utilisation, in some cases above 100% (Ministry briefing).",
    ],
    "challenges": [
        "Import dependence: 245.77 MT imported against 25.98 MT produced (PPAC).",
        "Hormuz exposure: about 60% of LPG is imported and about 90% of that came through the Strait of Hormuz (Ministry briefing, March 2026).",
        "Gas supply shocks: 47.4 MMSCMD was hit by force majeure in March 2026, forcing cuts to industry (Ministry briefing).",
        "LPG import collapse: 807 thousand tonnes in March 2026 against 1,700 in February (PPAC).",
        "Demand softness: total consumption fell 2.8% in August 2026 (PPAC).",
        "Controversy over E20: the government issued detailed FAQs after concerns from consumers and carmakers (PIB, July 2026).",
    ],
    "players": {
        "structure": "Refining is led by state-owned IOC, BPCL, HPCL and subsidiaries plus Reliance's two Jamnagar refineries (68.2 MMTPA together) and Nayara (20 MMTPA); ONGC and Oil India produce most crude. The names below are major employers, not a ranking by size.",
        "companies": ["Indian Oil (IOCL)", "Bharat Petroleum (BPCL)", "Hindustan Petroleum (HPCL)", "ONGC", "Oil India", "Reliance Industries", "Nayara Energy", "MRPL", "Numaligarh Refinery", "GAIL", "Chennai Petroleum (CPCL)", "HPCL-Mittal Energy"],
    },
    "opsAngle": [
        "Crude procurement is a portfolio problem: India moved from about 55% to 70% of imports arriving outside Hormuz by adding suppliers, which costs freight and grade-fit trade-offs (Ministry briefing).",
        "Refinery yield decisions move supply: diverting propane and butane to LPG raised domestic LPG output about 25% in days (Ministry briefing).",
        "Priority allocation under shortage: household PNG and CNG 100%, industry about 80%, refineries about 65% of normal gas; operations teams must plan for rationing rules.",
        "Storage and inventory are the buffer: LPG imports dropping to 807 thousand tonnes in March shows why days of cover matter (PPAC).",
        "Product mix drives logistics: diesel is 94.7 MT and petrol 42.6 MT, so tanker, pipeline and depot flow plans centre on those two (PPAC).",
        "Blending changes fuel supply chains: E20 needs ethanol sourcing, storage and blending at depots across over one lakh outlets (PIB).",
        "Export versus domestic: 61.43 MT of products were exported, so refiners balance export margins against domestic availability (PPAC).",
    ],
    "interviewNumbers": [
        {"label": "Crude oil imported", "value": "245.77 million tonnes", "period": "FY2025-26"},
        {"label": "Crude oil produced in India", "value": "25.98 million tonnes", "period": "FY2025-26"},
        {"label": "Petroleum product consumption", "value": "241.6 million tonnes", "period": "FY2025-26"},
        {"label": "Installed refining capacity", "value": "267.1 MMTPA", "period": "1 April 2026"},
        {"label": "Diesel consumption", "value": "94.7 million tonnes", "period": "FY2025-26"},
        {"label": "Share of LPG that is imported", "value": "about 60%", "period": "March 2026"},
        {"label": "Natural gas consumption", "value": "189 MMSCMD (97.5 domestic)", "period": "March 2026"},
        {"label": "Ethanol in petrol", "value": "20%", "period": "2025-26"},
        {"label": "Crude imports arriving outside Hormuz", "value": "about 70% (from 55%)", "period": "March 2026"},
        {"label": "Fuel exports", "value": "61.43 million tonnes", "period": "FY2025-26"},
    ],
    "gdQuestions": [
        "India imports most of its crude: is energy security a bigger risk than energy price?",
        "Should India build much larger strategic petroleum reserves, and who should pay?",
        "Is 20% ethanol blending a smart import-cutting move or a risk to vehicles and food crops?",
        "After the Strait of Hormuz disruption, should India diversify crude suppliers even if it costs more?",
        "Should LPG go first to households or to commercial users during a shortage?",
        "Can natural gas replace more oil in transport and industry, or is the supply too import-reliant?",
        "Should state-owned oil companies absorb price shocks to protect consumers?",
        "Is exporting petrol and diesel while importing crude good business or a distraction?",
        "Will electric vehicles cut diesel and petrol demand fast enough to change refinery investment plans?",
        "How should an oil marketing company plan its supply chain for a month of disrupted shipping?",
    ],
    "conflicts": [
        "Search summaries quote refining capacity of 256.8 MMTPA with 22 refineries; the PPAC table opened for 1 April 2026 totals 267.116 MMTPA, so the page uses PPAC. The older number probably predates a capacity addition.",
        "Crude production 27.95 MT includes condensate; crude alone is 25.98 MT. The page uses 25.98 MT for the import comparison.",
        "PPAC's FY2025-26 data are provisional; growth rates on this page are calculated by dividing PPAC's two annual totals, not published by PPAC.",
    ],
    "notFound": [
        "Share of oil and gas in GDP, jobs and government revenue from an official page: not found.",
        "India's crude import bill in dollars and rupees for FY2025-26: not opened (only tonnes found).",
        "Strategic petroleum reserve capacity (reported as 5.33 MMT): seen only in secondary summaries.",
        "LPG consumer count (reported as 33.5 crore) and city gas network size: secondary or unopened pages.",
        "The Natural Gas and Petroleum Products Distribution Order dated 24 March 2026: seen only in a search summary.",
        "Reliance, ONGC, IOC, BPCL and HPCL results: company pages not opened.",
        "Retail price and under-recovery details: the daily price PDFs and the gas price ceiling value were not read.",
        "Hormuz and West Asia status after March 2026: the PIB briefings opened are from March only.",
    ],
}

tl = og["timeline"]
item = [t for t in tl if t["date"].startswith("Nov 2025")][0]
tl.remove(item)
tl.insert(4, item)

for i, ind in enumerate(d["industries"]):
    if ind["id"] == "oilgas":
        d["industries"][i] = og
io.open(P, "w", encoding="utf-8", newline="\n").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print("ok", len(og["charts"]), len(og["interviewNumbers"]), len(og["gdQuestions"]))
