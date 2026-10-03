"""Builds data/roles.csv and supabase/seed_roles.sql from the NMIMS Ops & Supply Chain list.
Source: Operations_Supply_Chain_Companies.md (Drive). Run: python scripts/build_roles.py
Names are kept EXACTLY as in the source; doubtful ones are flagged, not corrected.
"""
import csv, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent

SECTORS = {
    "A": ("Conglomerate, Manufacturing, Real Estate, Oil & Gas, Automobiles & Aviation", "Leadership Programs (CDP, FMP, FLDP)"),
    "B": ("Startup, Logistics & E-commerce", "Area Operations & Supply Chain Roles"),
    "C": ("FMCG, FMCD & Retail", "Sales, Distribution & Supply Chain Roles"),
    "D": ("Consulting", "Supply Chain Consulting & Operations Improvement Roles"),
    "E": ("IT / Analytics, Pharma, Media, Telecom", "Supply Chain Consulting & Operations Roles"),
    "F": ("Banking, Financial Services & Insurance", "Operations & Logistics Roles"),
}
OPS, SC, LOG, DIST, SALES = "operations", "supply-chain", "logistics", "distribution", "sales-ops"

# (company as written in source, sector, [(role title, function)], flag or "")
D = [
 ("Aditya Birla Group","A",[("Operations",OPS),("Supply Chain",SC)],"Group-level; Aditya Birla Opus is listed separately under FMCG"),
 ("Bosch","A",[("Operations Management",OPS)],""),
 ("Eaton","A",[("Supply Chain",SC),("Operations",OPS)],""),
 ("Godrej & Boyce","A",[("Operations",OPS)],""),
 ("GE HealthCare","A",[("Operations",OPS)],""),
 ("GE Vernova","A",[("Supply Chain",SC)],""),
 ("Honeywell","A",[("Operations",OPS)],""),
 ("IndiGo","A",[("Supply Chain",SC),("Logistics",LOG)],""),
 ("Jindal Steel & Power (JSPL)","A",[("Supply Chain",SC)],""),
 ("KEAN","A",[("Operations",OPS)],"Name unclear - check spelling / which company"),
 ("Maruti Suzuki","A",[("Manufacturing",OPS),("Operations",OPS)],""),
 ("Neterwala","A",[("Operations",OPS)],"Small/private group - little news likely"),
 ("Reliance Industries","A",[("Supply Chain",SC),("Logistics",LOG)],""),
 ("Saint Gobain","A",[("Supply Chain",SC)],""),
 ("Schneider Electric","A",[("Operations",OPS),("Supply Chain",SC)],""),
 ("Shell","A",[("Supply Chain Management",SC)],""),
 ("Sobha","A",[("Real Estate Operations",OPS)],""),
 ("TAS (Tata Automotive Services)","A",[("Operations",OPS)],"Check: may be 'Tata Advanced Systems' instead"),
 ("Tata Power","A",[("Operations",OPS)],""),
 ("Yokohama","A",[("Supply Chain",SC)],""),
 ("Zeiss","A",[("Operations",OPS)],""),
 ("Vikram Solar","A",[("Operations",OPS),("Supply Chain",SC)],""),
 ("Dimexon","A",[("Manufacturing Operations",OPS)],"Name unclear - check spelling / little news likely"),
 ("Inorbit","A",[("Retail Operations",OPS)],"Probably Inorbit Malls - confirm"),
 ("Cimcor","A",[("Operations",OPS)],"Name unclear - check spelling / little news likely"),
 ("Chalet","A",[("Operations",OPS)],"Probably Chalet Hotels - confirm"),
 ("Apriani Energy","A",[("Operations",OPS)],"Name unclear - check spelling / little news likely"),
 ("Evonth Steel","A",[("Operations",OPS)],"Name unclear - check spelling / little news likely"),
 ("AllCargo Logistics","B",[("Logistics",LOG),("Supply Chain",SC)],""),
 ("API Logistics","B",[("Supply Chain Management",SC)],""),
 ("Carwale","B",[("Operations",OPS)],""),
 ("ClickTech","B",[("Supply Chain",SC)],"Name unclear - little news likely"),
 ("Eternal (Shyam Autotech)","B",[("Supply Chain",SC),("Logistics",LOG)],"Eternal is Zomato's parent; 'Shyam Autotech' unclear - confirm which"),
 ("FedEx","B",[("Supply Chain",SC),("Logistics",LOG)],""),
 ("Flipkart","B",[("Supply Chain",SC),("Logistics",LOG)],""),
 ("Groww","B",[("Operations",OPS)],""),
 ("Lenskaart","B",[("Operations",OPS),("Supply Chain",SC)],"Spelled 'Lenskart' publicly - confirm"),
 ("Mphasis","B",[("Operations",OPS),("Logistics",LOG)],""),
 ("NxtPe","B",[("Logistics Operations",LOG)],"Name unclear - little news likely"),
 ("PhonePe","B",[("Supply Chain",SC),("Operations",OPS)],""),
 ("SundayRigel","B",[("Retail Operations",OPS)],"Name unclear - little news likely"),
 ("Aditya Birla Opus","C",[("Distribution",DIST),("Supply Chain",SC)],"Overlaps with Aditya Birla Group"),
 ("ABInBev","C",[("Sales & Distribution Operations",SALES)],""),
 ("Asian Paints","C",[("Distribution Management",DIST)],""),
 ("Berger Paints","C",[("Sales",SALES),("Supply Chain",SC)],""),
 ("Britannia","C",[("Distribution",DIST),("Supply Chain",SC)],""),
 ("Diageo","C",[("Supply Chain",SC),("Distribution",DIST)],""),
 ("Frootle","C",[("Retail Operations",OPS)],"Name unclear - little news likely"),
 ("Global Detergent Factory","C",[("Supply Chain",SC)],"Name unclear - little news likely"),
 ("Hector Beverages","C",[("Sales Operations",SALES)],""),
 ("Johnson & Johnson","C",[("Supply Chain",SC)],""),
 ("Jubilant Food Works","C",[("Distribution Management",DIST)],""),
 ("Kenve","C",[("Retail Operations",OPS)],"Name unclear - little news likely"),
 ("Liebherr","C",[("Supply Chain",SC)],""),
 ("Loreal","C",[("Distribution",DIST)],"Spelled 'L'Oreal' publicly"),
 ("Marico","C",[("Sales & Distribution",SALES)],""),
 ("PepsiCo","C",[("Supply Chain",SC),("Distribution",DIST)],""),
 ("Pidilite","C",[("Supply Chain Management",SC)],""),
 ("Rich's","C",[("Supply Chain",SC)],"Name unclear - confirm which company"),
 ("Samsung Electronics","C",[("Supply Chain",SC)],""),
 ("Signify","C",[("Distribution Operations",DIST)],""),
 ("Tata Consumer Products","C",[("Distribution",DIST),("Supply Chain",SC)],""),
 ("V-Guard","C",[("Supply Chain",SC)],""),
 ("Welspun","C",[("Supply Chain Management",SC)],""),
 ("Wipro","C",[("Retail Operations",OPS)],"Wipro is IT; may mean Wipro Consumer Care - confirm"),
 ("Zydus Wellness","C",[("Supply Chain",SC)],""),
 ("Accenture Strategy","D",[("Operations Consulting",OPS)],""),
 ("Bain & Company","D",[("Operations Excellence",OPS)],""),
 ("Cedar","D",[("Operations Consulting",OPS)],"Probably Cedar Consulting - confirm"),
 ("Deloitte","D",[("Supply Chain Consulting",SC)],""),
 ("EY (Ernst & Young)","D",[("Operations Advisory",OPS)],""),
 ("KPMG","D",[("Operations Transformation",OPS)],""),
 ("Michael Page","D",[("Operations Recruitment",OPS)],"Recruiter, not an ops employer - news relevance low"),
 ("PwC","D",[("Supply Chain Advisory",SC)],""),
 ("Stanton Chase","D",[("Executive Search for Operations Roles",OPS)],"Executive search firm - news relevance low"),
 ("ACG (Associated Capsules)","E",[("Supply Chain",SC)],""),
 ("Airtel","E",[("Operations",OPS)],""),
 ("Ashnik","E",[("Operations",OPS)],"Small firm - little news likely"),
 ("Cipla","E",[("Supply Chain",SC)],""),
 ("GSK (GlaxoSmithKline)","E",[("Supply Chain",SC)],""),
 ("Karix","E",[("Operations",OPS)],"Small firm - little news likely"),
 ("HDFC Bank","F",[("Operations",OPS)],""),
 ("HDFC ERGO","F",[("Operations",OPS),("Supply Chain",SC)],""),
 ("Kotak","F",[("Operations",OPS)],"Kotak Mahindra Bank? - confirm"),
 ("Maruti Insurance","F",[("Operations",OPS)],"Unclear which company - confirm"),
]

# ---- Yash's confirmations (3 Oct 2026) ----
# Renamed as confirmed:
RENAME = {"Lenskaart": "Lenskart", "Loreal": "L'Oreal", "Cedar": "Cedar Consulting", "Wipro": "Wipro Consumer Care"}
# Dropped: all banking (sector F), plus every name that was flagged as unclear/unconfirmed.
EXCLUDE = {"KEAN","Dimexon","Cimcor","Apriani Energy","Evonth Steel","ClickTech","NxtPe","SundayRigel",
           "Frootle","Kenve","Global Detergent Factory","Rich's","Inorbit","Chalet",
           "TAS (Tata Automotive Services)","Eternal (Shyam Autotech)"}
D = [(RENAME.get(n, n), sec, roles, ("" if n in RENAME else flag)) for n, sec, roles, flag in D
     if sec != "F" and n not in EXCLUDE]
SECTORS.pop("F")

def slug(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")

assert len({slug(d[0]) for d in D}) == len(D), "duplicate slug"

(root / "data").mkdir(exist_ok=True)
with open(root / "data" / "roles.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["company_id", "company", "sector", "role", "function", "level", "track", "flag"])
    for name, sec, roles, flag in D:
        for title, fn in roles:
            lvl = "Leadership program (CDP/FMP/FLDP)" if sec == "A" else ""
            w.writerow([slug(name), name, SECTORS[sec][0], title, fn, lvl, SECTORS[sec][1], flag])

def q(s): return "'" + s.replace("'", "''") + "'"
lines = ["-- Seed: companies + roles from NMIMS Ops & Supply Chain list (generated by scripts/build_roles.py)",
         "-- Run in Supabase SQL Editor AFTER schema.sql. Safe to re-run.", ""]
for name, sec, roles, flag in D:
    lines.append(f"insert into companies (id,name,industry,is_default) values ({q(slug(name))},{q(name)},{q(SECTORS[sec][0])},true) "
                 f"on conflict (id) do update set name=excluded.name, industry=excluded.industry;")
lines.append("")
for name, sec, roles, flag in D:
    for title, fn in roles:
        lvl = q("Leadership program (CDP/FMP/FLDP)") if sec == "A" else "null"
        desc = q(f"{SECTORS[sec][1]}. Source: NMIMS SBM Placement Report 2025-26.")
        lines.append(f"insert into roles (company_id,title,function,level,description) values ({q(slug(name))},{q(title)},{q(fn)},{lvl},{desc}) "
                     f"on conflict (company_id,title) do update set function=excluded.function, level=excluded.level, description=excluded.description;")
(root / "supabase" / "seed_roles.sql").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("companies:", len(D), "roles:", sum(len(d[2]) for d in D), "flagged:", sum(1 for d in D if d[3]))
