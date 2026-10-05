import json, io

P = "data/industry-facts.json"
d = json.load(io.open(P, encoding="utf-8"))

NIQ = ("NielsenIQ Q2 2026 figures, reported by RetailIntel", "https://retailintel.in/signal/india-fmcg-volumes-slip-2-as-kiranas-contract-and-online-cha-9df4e451", "2026-09-27")
HUL = ("Hindustan Unilever results release", "https://www.hul.co.in/news/press-releases/2026/march-quarter-and-financial-year-2026-results/", "2026-04-30")
ITC = ("ITC FY26 FMCG results, reported by Outlook Business", "https://www.outlookbusiness.com/corporate/itcs-fmcg-revenue-rises-to-24210-cr-in-fy26-foods-business-crosses-20000-cr", "2026-07-20")
PLI = ("Ministry of Food Processing Industries, on PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2291793&reg=48&lang=2", "2026-07-30")
GST = ("Ministry of Finance, on PIB (56th GST Council)", "https://gstcouncil.gov.in/sites/default/files/2025-09/press_release_press_information_bureau_0.pdf", "2025-09-03")
BUD = ("Ministry of Finance, on PIB (Budget 2025-26)", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2098406&reg=48&lang=2", "2025-02-01")
FDI = ("Ministry of Commerce and Industry, on PIB", "https://www.pib.gov.in/newsite/PrintRelease.aspx?relid=192173&reg=3&lang=2", "2019-07-24")


def F(label, value, period, src):
    return {"label": label, "value": value, "period": period, "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


def C(id, kind, title, subtitle, unit, items, src):
    return {"id": id, "kind": kind, "title": title, "subtitle": subtitle, "unit": unit, "items": items,
            "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


def Pol(name, what, src):
    return {"name": name, "what": what, "sourceName": src[0], "sourceUrl": src[1], "sourceDate": src[2]}


fm = {
    "id": "fmcg",
    "name": "FMCG and retail",
    "asOf": "2026-10-05",
    "overview": "FMCG (fast-moving consumer goods) is everyday packaged stuff: soap, shampoo, tea, biscuits, noodles. Companies make it in bulk and push it through distributors to millions of small shops, and increasingly to supermarkets and quick-commerce apps. It matters because volume, price and channel mix decide who wins, and every one of them is a supply chain problem.",
    "bigIdea": "Indian FMCG is a distribution game that is changing channels fast: volumes were weak in April-June 2026 (down 2%) while modern trade and online grew, so winning means serving the corner shop and the dark store at once.",
    "flow": [
        {"label": "Make", "stat": "PLI-supported food sales ₹1,08,854 crore", "note": "Factories and food processors scale up, helped by the food processing PLI scheme (FY2025-26 sales, PIB)."},
        {"label": "Distribute", "stat": "ITC reaches about 7 million outlets", "note": "Stockists and wholesalers feed small shops across the country (ITC, FY26)."},
        {"label": "Sell", "stat": "Traditional trade volume down 6%", "note": "Corner shops are shrinking in volume while modern trade is up 17.5% (NielsenIQ, Q2 2026)."},
        {"label": "Fast channels", "stat": "E-commerce value +57.7%", "note": "Online and quick commerce grow far faster than the market, forcing smaller packs and dark-store supply (NielsenIQ, Q2 2026)."},
    ],
    "timeline": [
        {"date": "1 Feb 2025", "title": "Budget 2025-26 removes income tax up to ₹12 lakh", "detail": "No tax up to ₹12 lakh income (₹12.75 lakh for salaried) under the new regime; the Finance Minister said it would boost household consumption (PIB)."},
        {"date": "3 Sep 2025", "title": "GST Council approves two main rates", "detail": "Four slabs become 5% and 18%, plus 40% on a few goods; hair oil, soap, shampoo, toothpaste, butter, ghee, namkeen and noodles move to 5% (GST Council release on PIB)."},
        {"date": "Apr-Jun 2026", "title": "FMCG volumes fall 2% in the quarter", "detail": "Rural volume down 5% and 68% of categories lost volume, while online grew fast (NielsenIQ, via RetailIntel)."},
        {"date": "30 Apr 2026", "title": "HUL reports its best growth in 12 quarters", "detail": "March quarter turnover ₹16,207 crore, underlying volume growth 6% (HUL)."},
        {"date": "20 Jul 2026", "title": "ITC FMCG passes ₹24,000 crore", "detail": "FY26 FMCG revenue ₹24,210 crore; foods above ₹20,000 crore; quick commerce sales up 57% (Outlook Business)."},
        {"date": "30 Jul 2026", "title": "Food processing PLI results published", "detail": "Investment of ₹9,207 crore against a ₹7,722 crore commitment; ₹3,271.44 crore incentives paid up to June 2026 (PIB)."},
        {"date": "27 Sep 2026", "title": "Q2 channel data reported", "detail": "Traditional trade volume -6%, modern trade +17.5%, e-commerce value +57.7% (NielsenIQ, via RetailIntel)."},
        {"date": "FY 2026-27", "title": "Food processing PLI scheme period ends", "detail": "The approved outlay runs from FY2021-22 to FY2026-27; what follows has not been announced in sources opened.", "future": True},
    ],
    "charts": [
        C("niqvol", "bars", "Volume change by channel (size of move)", "Q2 2026, % change in volume. ▲ means up, ▼ means down", "%",
          [{"label": "Modern trade ▲", "value": 17.5}, {"label": "Urban ▲", "value": 0.1}, {"label": "Overall market ▼", "value": 2},
           {"label": "Rural ▼", "value": 5}, {"label": "Traditional trade ▼", "value": 6}], NIQ),
        C("fast", "bars", "Fastest-growing channels", "Q2 2026, % growth", "%",
          [{"label": "E-commerce value", "value": 57.7}, {"label": "Quick commerce", "value": 40, "note": "market expansion"},
           {"label": "E-commerce volume", "value": 34.8}, {"label": "Dark-store footprint", "value": 48}], NIQ),
        C("hulq", "bars", "HUL, March quarter 2026", "Year-on-year growth, %", "%",
          [{"label": "Revenue", "value": 8}, {"label": "Underlying sales growth", "value": 7}, {"label": "Underlying volume growth", "value": 6},
           {"label": "EBITDA", "value": 6}, {"label": "Profit before exceptional items", "value": 4}], HUL),
        C("itc", "columns", "ITC FMCG revenue", "₹ crore, FY21 against FY26 (10.5% a year over five years)", "₹ crore",
          [{"label": "FY21", "value": 14730}, {"label": "FY26", "value": 24210}], ITC),
        C("plisales", "columns", "Sales of PLI-supported food products", "₹ crore", "₹ crore",
          [{"label": "FY2019-20", "value": 58758}, {"label": "FY2025-26", "value": 108854}], PLI),
        C("plitarget", "progress", "Food processing PLI against targets", "Delivered against the target or commitment", "",
          [{"label": "Investment (₹ crore, against commitment)", "value": 9207, "target": 7722},
           {"label": "Jobs (lakh, against target)", "value": 3.35, "target": 2.5},
           {"label": "Incentives paid (₹ crore, against outlay)", "value": 3271.44, "target": 10900}], PLI),
        C("gstnew", "bars", "GST on everyday goods after the reform", "New rate, %. Earlier rates in the note", "%",
          [{"label": "Hair oil, soap, shampoo, toothpaste", "value": 5, "note": "from 18% or 12%"},
           {"label": "Butter, ghee, noodles, chocolates", "value": 5, "note": "from 12% or 18%"},
           {"label": "UHT milk, paneer (packaged), rotis", "value": 0, "note": "from 5%"}], GST),
        C("taxband", "bars", "Income tax rate by income band", "New regime from Budget 2025-26, % rate", "%",
          [{"label": "₹4-8 lakh", "value": 5}, {"label": "₹8-12 lakh", "value": 10}, {"label": "₹12-16 lakh", "value": 15},
           {"label": "₹16-20 lakh", "value": 20}, {"label": "₹20-24 lakh", "value": 25}, {"label": "Above ₹24 lakh", "value": 30}], BUD),
    ],
    "marketSize": [
        F("HUL turnover in the March quarter", "₹16,207 crore (revenue +8%)", "Jan-Mar 2026", HUL),
        F("ITC FMCG revenue", "₹24,210 crore; foods above ₹20,000 crore", "FY2025-26", ITC),
        F("ITC retail outlets reached", "nearly 7 million outlets; about 280 million households", "FY2025-26", ITC),
        F("Sales of food products supported by the PLI scheme", "₹1,08,854 crore, up from ₹58,758 crore", "FY2025-26 against FY2019-20", PLI),
        F("Food processing PLI approved outlay", "₹10,900 crore; 163 applications from 127 companies", "FY2021-22 to FY2026-27", PLI),
    ],
    "growth": [
        F("FMCG volume growth", "down 2%; value up 0.8%; price up 2.8%", "Apr-Jun 2026", NIQ),
        F("HUL underlying volume growth", "6% (underlying sales 7%), highest in 12 quarters", "Jan-Mar 2026", HUL),
        F("E-commerce growth in FMCG", "value +57.7%, volume +34.8%", "Apr-Jun 2026", NIQ),
        F("ITC quick commerce sales", "up 57%", "FY2025-26", ITC),
    ],
    "gdpJobs": [
        F("Jobs created under the food processing PLI", "about 3.35 lakh direct and indirect, against a target of 2.50 lakh", "to June 2026", PLI),
        F("Food processing capacity created under PLI", "34 lakh metric tons a year", "to June 2026", PLI),
        F("Jobs from the (discontinued) Mega Food Park scheme", "1,02,440 direct and indirect expected from 41 approved parks", "scheme closed 1 Apr 2021", PLI),
    ],
    "exportsFdi": [
        F("FDI in single-brand retail", "100% allowed under the automatic route", "policy in force, as stated 2019", FDI),
        F("Local sourcing rule", "30% of purchases from India if foreign investment is above 51%", "as stated 2019", FDI),
        F("FDI received by single-brand retail", "USD 1,636.24 million", "April 2006 to April 2019", FDI),
        F("Support for branding food products abroad", "50% of eligible spend, up to 3% of sales or ₹50 crore a year", "PLI scheme, July 2026", PLI),
    ],
    "policies": [
        Pol("GST rationalisation (next-generation GST)", "Four slabs reduced to 5% and 18%, with 40% on a select few goods. Hair oil, toilet soap, shampoos, toothbrushes and toothpaste fell to 5%; butter, ghee, namkeens, instant noodles and chocolates fell to 5%; UHT milk, paneer and Indian breads went to nil.", GST),
        Pol("Income tax relief in Budget 2025-26", "No tax up to ₹12 lakh (₹12.75 lakh for salaried) under the new regime; the government said it would boost household consumption.", BUD),
        Pol("PLI scheme for food processing (PLISFPI)", "Pays incentives on incremental sales of processed food. Outlay ₹10,900 crore for FY2021-22 to FY2026-27; ₹3,271.44 crore paid up to June 2026; 212 locations in 22 states.", PLI),
        Pol("FDI in single-brand retail", "100% foreign investment through the automatic route; above 51% foreign holding, 30% of purchases must come from India.", FDI),
        Pol("Mega Food Park scheme (closed)", "Cluster-based storage and processing hubs; discontinued from 1 April 2021 after approving 41 parks, of which 25 are operational.", PLI),
    ],
    "drivers": [
        "Tax relief for households: no income tax up to ₹12 lakh and cheaper everyday goods under the new GST rates (PIB).",
        "GST cut to 5% on soap, shampoo, toothpaste, ghee, noodles and more, which lowers shelf prices on staples (GST Council release).",
        "Premiumisation and market development: HUL says premium soaps, bodywash and liquids grew double digit (HUL, March quarter 2026).",
        "Fast-growing digital channels: e-commerce value +57.7% and ITC quick commerce sales +57% (NielsenIQ; ITC).",
        "Modern trade expansion: volume up 17.5% in Q2 2026 (NielsenIQ).",
        "Government push on processing: PLI sales of ₹1,08,854 crore and jobs above target (PIB).",
    ],
    "challenges": [
        "Weak volumes: market volume fell 2% and 68% of categories lost volume in April-June 2026 (NielsenIQ).",
        "Rural slowdown: rural volumes down 5% while urban rose only 0.1% (NielsenIQ).",
        "Corner shops losing volume: traditional trade down 6%, which hurts the biggest distribution network (NielsenIQ).",
        "Cost volatility: HUL cited commodity and currency volatility from geopolitical tension and 'calibrated pricing actions' (HUL).",
        "Price-led value growth: value rose 0.8% only because price rose 2.8% while volumes fell (NielsenIQ).",
        "Mass skin care stayed subdued even as premium grew (HUL, March quarter 2026).",
    ],
    "players": {
        "structure": "A few large listed groups sell through a huge small-shop network. HUL turnover was ₹16,207 crore in one quarter and ITC FMCG was ₹24,210 crore in FY26; ITC alone reaches about 7 million outlets. The names below are well-known FMCG and retail employers, not a ranking by size; only HUL and ITC figures were verified here.",
        "companies": ["Hindustan Unilever", "ITC", "Nestle India", "Britannia Industries", "Tata Consumer Products", "Dabur India", "Marico", "Godrej Consumer Products", "Colgate-Palmolive India", "Reliance Retail", "Avenue Supermarts (DMart)", "Lenskart"],
    },
    "opsAngle": [
        "Last-mile reach is the moat: ITC serves about 7 million outlets, so route design, stockist fill rates and delivery frequency decide availability (ITC, FY26).",
        "Channel-specific supply: modern trade (+17.5% volume), e-commerce and dark stores need different pack sizes, order patterns and replenishment than corner shops (NielsenIQ).",
        "Volume is falling while price is rising: with volume -2% and price +2.8%, plants run below plan and every cost-saving and pack-mix decision matters (NielsenIQ).",
        "Cost shocks: HUL points to commodity and currency volatility; hedging, supplier diversification and local sourcing cut risk (HUL).",
        "Automation in warehousing: ITC runs 12 integrated facilities plus automated centres to optimise inventory (ITC, FY26).",
        "Demand sensing matters most after the GST cut: price changes shift demand quickly, so forecast and inventory policy must adjust within weeks (GST Council release).",
        "Premium and fast-moving mixes behave differently: premium lines are low-volume and high-margin, so SKU rationalisation and shelf-space trade-offs matter (HUL).",
    ],
    "interviewNumbers": [
        {"label": "FMCG market volume change", "value": "down 2%", "period": "Apr-Jun 2026"},
        {"label": "FMCG market value change", "value": "up 0.8% (price +2.8%)", "period": "Apr-Jun 2026"},
        {"label": "Traditional trade volume", "value": "down 6%", "period": "Apr-Jun 2026"},
        {"label": "Modern trade volume", "value": "up 17.5%", "period": "Apr-Jun 2026"},
        {"label": "E-commerce value growth", "value": "+57.7%", "period": "Apr-Jun 2026"},
        {"label": "HUL underlying volume growth", "value": "6%", "period": "Jan-Mar 2026"},
        {"label": "ITC FMCG revenue", "value": "₹24,210 crore", "period": "FY2025-26"},
        {"label": "ITC outlets reached", "value": "about 7 million", "period": "FY2025-26"},
        {"label": "GST on soap, shampoo, toothpaste", "value": "5% (from 18% or 12%)", "period": "from the 2025 reform"},
        {"label": "Food processing PLI sales", "value": "₹1,08,854 crore", "period": "FY2025-26"},
    ],
    "gdQuestions": [
        "Kirana stores are losing volume while quick commerce booms: should FMCG companies back the corner shop or the dark store?",
        "Volumes fell 2% while prices rose 2.8%: is FMCG growth healthy or just inflation?",
        "Did the GST cut on everyday goods help consumers or companies more?",
        "Rural volumes are down 5%: is rural India still the growth engine for FMCG?",
        "Should FMCG firms launch smaller, cheaper packs or push premium products?",
        "Is a 100% FDI-open single-brand retail policy enough, or should multi-brand retail also open up?",
        "How should an FMCG supply chain differ for quick commerce and general trade?",
        "Does the food processing PLI scheme create real manufacturing champions or just subsidised sales?",
        "Will large companies' own quick-commerce and direct-to-consumer channels hurt their distributors?",
        "How should FMCG companies protect margins against commodity and currency volatility without hurting volume?",
    ],
    "conflicts": [
        "NielsenIQ numbers were read in a RetailIntel summary dated 27 Sep 2026, not in NielsenIQ's own report, so treat them as reported figures.",
        "Search snippets on the kirana share of sales (81% to 79%, December 2024) and the 'about 13 million' kirana count came from secondary sources and are not used as facts here.",
    ],
    "notFound": [
        "Total size of the Indian FMCG market in ₹ crore from an official source: not found in pages opened.",
        "Retail sector size, organised retail share and retail employment from an official source: not found.",
        "FDI in multi-brand retail (reported as 51% with government approval): seen only in law-firm and educational pages, not on an official page opened.",
        "Effective date of the GST changes (reported as 22 Sep 2025): the PIB text read does not state it; confirmed only in secondary pages.",
        "Nestle India, Britannia and Tata Consumer FY26 results: company pages not opened.",
        "HUL and DPIIT retail FDI inflow for recent years: not found (DPIIT PDF could not be read).",
        "Edible-oil import duty change and Q1 FY27 price-hike commentary: pages blocked, not verified.",
    ],
}

for i, ind in enumerate(d["industries"]):
    if ind["id"] == "fmcg":
        d["industries"][i] = fm
io.open(P, "w", encoding="utf-8", newline="\n").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print("ok", len(fm["charts"]), len(fm["interviewNumbers"]), len(fm["gdQuestions"]))
