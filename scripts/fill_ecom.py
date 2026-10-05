import json, io

P = "data/industry-facts.json"
d = json.load(io.open(P, encoding="utf-8"))

RAIL = ("Ministry of Railways, on PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2247768&reg=3&lang=1", "2026-04-01")
NLP = ("DPIIT, Ministry of Commerce, on PIB (3 years of National Logistics Policy)", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2167224&reg=48&lang=2", "2025-09-16")
INFRA = ("PIB backgrounder on infrastructure", "https://www.pib.gov.in/PressNoteDetails.aspx?NoteId=158838&ModuleId=3&reg=5&lang=1", "2026-06-09")
GIG = ("Ministry of Labour, on PIB (gig and platform workers)", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2200767&reg=3&lang=1", "2025-12-09")
ONDC = ("DPIIT, on PIB (ONDC)", "https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2146920&reg=3&lang=2", "2025-07-22")


def F(label, value, period, src):
    return {"label": label, "value": value, "period": period, "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


def C(id, kind, title, subtitle, unit, items, src):
    return {"id": id, "kind": kind, "title": title, "subtitle": subtitle, "unit": unit, "items": items,
            "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


def Pol(name, what, src):
    return {"name": name, "what": what, "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


ec = {
    "id": "ecom",
    "name": "E-commerce and logistics",
    "asOf": "2026-10-05",
    "overview": "E-commerce sells goods online and logistics is everything that moves them: trucks, trains, ports, warehouses and the last-mile rider. The two are tied together because an online order is only as good as the delivery behind it. For Ops students this is the most direct supply chain industry, and this page is strongest on the logistics side, where official data is available.",
    "bigIdea": "India is building a national logistics system (a policy, a data platform, freight corridors and bigger ports) while e-commerce and quick commerce push delivery to the doorstep, so the winners are firms that cut cost and time per parcel.",
    "flow": [
        {"label": "Order", "stat": "ONDC: an open network, not a marketplace", "note": "Sellers listed on any ONDC app can be found by buyers on any other app (DPIIT, 2025)."},
        {"label": "Move by rail and road", "stat": "1,670 million tonnes by rail", "note": "Indian Railways carried a record freight load in FY2025-26 (PIB)."},
        {"label": "Gateway ports", "stat": "915 MMT at major ports", "note": "Ports handle about 95% of trade by volume (PIB, June 2026)."},
        {"label": "Last mile", "stat": "Aggregators pay 1-2% of turnover", "note": "Delivery riders are now covered by a social security fund funded by platforms (PIB, Dec 2025)."},
    ],
    "timeline": [
        {"date": "2015", "title": "Sagarmala programme launched", "detail": "Port-led development; 78 projects worth ₹5,356.75 crore completed by March 2026 (PIB)."},
        {"date": "17 Sep 2022", "title": "National Logistics Policy launched", "detail": "Goals: cut logistics costs to global benchmarks and reach the top 25 in the Logistics Performance Index by 2030 (DPIIT, on PIB)."},
        {"date": "By Sep 2025", "title": "India ranked 38th in the World Bank LPI", "detail": "DPIIT credits the LEADS index for supporting the rise to 38th (PIB)."},
        {"date": "16 Sep 2025", "title": "ULIP crosses 160 crore transactions", "detail": "The Unified Logistics Interface Platform connects over 30 digital systems; the Logistics Data Bank tracked over 75 million EXIM containers across 101 inland container depots (PIB)."},
        {"date": "Nov 2025", "title": "Labour codes recognise gig and platform workers", "detail": "Aggregators must pay 1-2% of annual turnover (capped at 5% of payouts to workers) into a social security fund (PIB backgrounder, 9 Dec 2025)."},
        {"date": "1 Apr 2026", "title": "Railways report record FY2025-26 freight", "detail": "1,670 million tonnes, up 3.25%; fertiliser +13.49%, pig iron and steel +13.11% (PIB)."},
        {"date": "9 Jun 2026", "title": "Port performance data published", "detail": "Major port capacity 1,726 MMTPA; cargo 915 MMT; vessel turnaround 48.8 hours against 94 hours in 2014 (PIB)."},
        {"date": "2030", "title": "Target: top 25 in the Logistics Performance Index", "detail": "The stated goal of the National Logistics Policy; India was 38th at last report.", "future": True},
    ],
    "charts": [
        C("railgrowth", "bars", "Rail freight growth by commodity", "FY2025-26 over FY2024-25, % growth", "%",
          [{"label": "Fertilisers", "value": 13.49}, {"label": "Pig iron and steel", "value": 13.11}, {"label": "Iron ore", "value": 6.74, "note": "190.12 MT"},
           {"label": "Cement", "value": 4.74, "note": "157.17 MT"}, {"label": "All freight", "value": 3.25, "note": "1,670 MT"}], RAIL),
        C("wagons", "columns", "Wagons handled by Indian Railways", "Lakh wagons (1 lakh = 100,000)", "lakh",
          [{"label": "FY2024-25", "value": 279.12}, {"label": "FY2025-26", "value": 291.86, "note": "+4.56%"}], RAIL),
        C("portcap", "columns", "Major port capacity", "Million tonnes per annum (MMTPA)", "MMTPA",
          [{"label": "2014", "value": 873}, {"label": "2026", "value": 1726}], INFRA),
        C("portcargo", "columns", "Cargo handled at major ports", "Million tonnes (MMT)", "MMT",
          [{"label": "2014", "value": 581}, {"label": "2026", "value": 915}], INFRA),
        C("turnaround", "columns", "Vessel turnaround time at major ports", "Hours; lower is better", "hours",
          [{"label": "2014", "value": 94}, {"label": "2026", "value": 48.8}], INFRA),
        C("coastal", "columns", "Coastal shipping cargo", "Million tonnes (MMT)", "MMT",
          [{"label": "2014-15", "value": 74}, {"label": "Latest", "value": 215.29}], INFRA),
        C("oprat", "columns", "Major ports operating ratio", "% of income spent on operations; lower is better", "%",
          [{"label": "2014", "value": 65}, {"label": "2026", "value": 41}], INFRA),
        C("states", "bars", "State action on logistics", "Number of States and Union Territories, Sep 2025", "",
          [{"label": "Have a State Logistics Policy", "value": 27}, {"label": "Granted industry status to logistics", "value": 19},
           {"label": "Preparing Logistics Action Plans", "value": 14}, {"label": "Policy still in draft", "value": 9}], NLP),
    ],
    "marketSize": [
        F("Freight carried by Indian Railways", "1,670 million tonnes (record)", "FY2025-26", RAIL),
        F("Wagons handled by Indian Railways", "2,91,86,475", "FY2025-26", RAIL),
        F("Cargo handled at major ports", "915 MMT; capacity 1,726 MMTPA", "2026", INFRA),
        F("Share of India's trade moved by sea", "about 95% of volume and 70% of value", "2026", INFRA),
        F("Transactions on ULIP", "over 160 crore", "as of Aug 2025", NLP),
        F("Containers tracked in the Logistics Data Bank", "over 75 million EXIM containers across 101 ICDs", "as of Sep 2025", NLP),
    ],
    "growth": [
        F("Rail freight loading", "+3.25% to a record 1,670 MT", "FY2025-26", RAIL),
        F("Rail freight of fertiliser and of pig iron and steel", "+13.49% and +13.11%", "FY2025-26", RAIL),
        F("Major port cargo", "581 MMT to 915 MMT", "2014 to 2026", INFRA),
        F("Coastal shipping cargo", "74 MMT to 215.29 MMT", "2014-15 to latest", INFRA),
    ],
    "gdpJobs": [
        F("Logistics professionals trained", "over 65,000", "2023 to 2025", NLP),
        F("Universities and institutes offering logistics courses", "over 100", "as of Sep 2025", NLP),
        F("Ports net annual surplus", "₹1,805 crore (2014) to ₹10,910 crore (2026)", "2014 to 2026", INFRA),
    ],
    "exportsFdi": [
        F("Trade carried by maritime routes", "about 95% of volume, 70% of value", "2026", INFRA),
        F("Indian-flagged ships", "1,250 (2014) to 1,593 (2026)", "2014 to 2026", INFRA),
        F("Vessel turnaround time", "94 hours to 48.8 hours", "2014 to 2026", INFRA),
    ],
    "policies": [
        Pol("National Logistics Policy (2022)", "Aims to cut logistics cost to global benchmarks, reach the top 25 in the Logistics Performance Index by 2030 and build a data-driven decision system. Three years on, 27 States and UTs have State Logistics Policies and 19 have given logistics industry status.", NLP),
        Pol("Unified Logistics Interface Platform (ULIP)", "Connects more than 30 digital systems through APIs; over 160 crore transactions by Aug 2025.", NLP),
        Pol("LEADS index and Sectoral Policy for Efficient Logistics (SPEL)", "LEADS ranks States on logistics ease; SPEL builds sector plans. Coal policy notified and cement plan finalised; steel, fertiliser and food processing plans in draft.", NLP),
        Pol("Code on Social Security: gig and platform workers", "Defines aggregators and platform workers; aggregators pay 1-2% of annual turnover (capped at 5% of worker payouts) to a social security fund; workers get Aadhaar-linked IDs on e-Shram.", GIG),
        Pol("Open Network for Digital Commerce (ONDC)", "An open protocol, not a marketplace: sellers on any ONDC app can be found from any other. Meant to cut customer acquisition cost for small sellers.", ONDC),
        Pol("Sagarmala Programme", "Port-led development linking ports to industry and logistics networks; 78 projects worth ₹5,356.75 crore completed by March 2026.", INFRA),
    ],
    "drivers": [
        "Record rail freight: 1,670 MT in FY2025-26, with steel and fertiliser growing over 13% (PIB).",
        "Bigger, faster ports: capacity 1,726 MMTPA and turnaround time down to 48.8 hours (PIB).",
        "Digital backbone: ULIP crossed 160 crore transactions and the Logistics Data Bank tracks EXIM containers (DPIIT).",
        "State-level policy push: 27 States and UTs have State Logistics Policies (DPIIT).",
        "More coastal movement: coastal cargo rose from 74 MMT to 215.29 MMT (PIB).",
        "Open commerce rails: ONDC lets small sellers reach many buyer apps and lowers acquisition cost (DPIIT).",
    ],
    "challenges": [
        "Infrastructure gaps, regulatory harmonisation and low digital literacy among smaller logistics operators remain (DPIIT, Sep 2025).",
        "The logistics cost study with NCAER was still being finalised, so the true cost level is not yet officially published in sources opened (DPIIT).",
        "Nine States still had logistics policies in draft (DPIIT, Sep 2025).",
        "Sector plans for steel, fertiliser and food processing logistics were still drafts (DPIIT).",
        "New cost for platforms: aggregators must pay 1-2% of turnover into a worker fund (PIB, Dec 2025).",
        "Overall rail freight growth is only 3.25%, so more cargo must shift from road through terminals and corridors (PIB).",
    ],
    "players": {
        "structure": "Delivery runs on a mix of marketplaces, quick-commerce apps, courier and 3PL firms, and the railways and ports. No verified market-share or revenue figures for private players were found in official sources, so the names below are well-known employers, not a ranking.",
        "companies": ["Amazon India", "Flipkart", "Delhivery", "Blue Dart", "Blinkit", "Swiggy Instamart", "Zepto", "Reliance Retail (JioMart)", "BigBasket", "Mahindra Logistics", "TCI", "Adani Ports"],
    },
    "opsAngle": [
        "Cost per parcel is the core metric: speed, density of orders and returns rate decide it, and policy aims to cut the system's logistics cost.",
        "Mode shift matters: steel, fertiliser and cement already move by rail at double-digit growth, so network design should use rail and coastal shipping where speed allows (PIB).",
        "Port dwell and turnaround drive import lead times: turnaround is 48.8 hours against 94 in 2014, so inventory buffers for imported parts can shrink (PIB).",
        "Visibility tools exist: ULIP and the Logistics Data Bank give container-level tracking that planners can use for ETAs (DPIIT).",
        "Last-mile labour is now a regulated cost: platform payouts attract a 1-2% turnover contribution, which changes delivery economics (PIB).",
        "Dark stores and rural routes need different networks: a hub-and-spoke for slow parcels and many small nodes for 10-minute delivery.",
        "Reverse logistics and returns are a hidden cost in e-commerce that a good plan must price in.",
    ],
    "interviewNumbers": [
        {"label": "Freight carried by Indian Railways", "value": "1,670 million tonnes", "period": "FY2025-26"},
        {"label": "Rail freight growth", "value": "+3.25%", "period": "FY2025-26"},
        {"label": "Cargo at major ports", "value": "915 MMT", "period": "2026"},
        {"label": "Major port capacity", "value": "1,726 MMTPA", "period": "2026"},
        {"label": "Vessel turnaround time", "value": "48.8 hours (94 in 2014)", "period": "2026"},
        {"label": "Share of trade by sea", "value": "95% volume, 70% value", "period": "2026"},
        {"label": "ULIP transactions", "value": "over 160 crore", "period": "Aug 2025"},
        {"label": "India's Logistics Performance Index rank", "value": "38th", "period": "latest cited, Sep 2025"},
        {"label": "Aggregator contribution for gig workers", "value": "1-2% of turnover", "period": "from Nov 2025"},
        {"label": "Coastal shipping cargo", "value": "215.29 MMT", "period": "latest"},
    ],
    "gdQuestions": [
        "Should quick commerce be regulated as strictly as a normal retailer, given its dark stores and rider load?",
        "Who should bear the cost of gig worker social security: platforms, customers or the government?",
        "Can India cut logistics costs to global benchmarks by 2030 without a big shift from road to rail and coastal shipping?",
        "Is ONDC a real threat to Amazon and Flipkart or just a policy experiment?",
        "Is 10-minute delivery a genuine service or a race to the bottom for riders and margins?",
        "Should private companies build more rail cargo terminals, or should Railways do it?",
        "Will data platforms like ULIP matter more than new roads for logistics efficiency?",
        "Do faster ports help small exporters or mostly large importers?",
        "Should States compete or coordinate on logistics policy?",
        "Is returns handling the biggest unsolved cost problem in Indian e-commerce?",
    ],
    "conflicts": [
        "The 16% of GDP logistics cost figure is quoted widely, but the PIB release read does not give it; the NCAER study to settle it was still being finalised, so it is not used as a fact.",
    ],
    "notFound": [
        "Size of India's e-commerce and quick-commerce markets from an official source: only trade-press and IBEF figures were seen, so none are used.",
        "Quick-commerce market shares and dark-store counts (reported by Datum, Reuters-cited): secondary only, not verified.",
        "GST on delivery and platform fees: not opened.",
        "Press Note 3 of 2026 allowing inventory-based FDI e-commerce for exports (reported 23 July 2026): seen only on law-firm pages, not on an official page.",
        "Gati Shakti Cargo Terminals (142 operating, 146 MT handled in FY2025-26) and Dedicated Freight Corridor completion: seen only in trade summaries, not on an opened PIB page.",
        "ONDC and GeM latest transaction and seller counts: differing figures in search snippets; no opened official page.",
        "Private player revenue and market share (Delhivery, Blue Dart, Amazon, Flipkart): company pages not opened.",
    ],
}

for i, ind in enumerate(d["industries"]):
    if ind["id"] == "ecom":
        d["industries"][i] = ec
io.open(P, "w", encoding="utf-8", newline="\n").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print("ok", len(ec["charts"]), len(ec["interviewNumbers"]), len(ec["gdQuestions"]))
