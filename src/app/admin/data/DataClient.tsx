"use client";

import { AdminChrome, type AdminChromeData } from "../shared";
import { DistributionPanel, type DistributionData } from "./DistributionPanel";
import { FlowPanel, type FlowData } from "./FlowPanel";

export type DataTab = "flow" | "distribution";

/**
 * One data section, two tabs sharing one chart kit: Flow is what comes
 * in (stories created), Distribution is what goes out (feed, MCP, clicks,
 * searches, signups). Same controls, same marks, read the same way.
 */
export function DataClient({ chrome, tab, flow, distribution }: { chrome: AdminChromeData; tab: DataTab; flow: FlowData; distribution: DistributionData }) {
  return (
    <div>
      <AdminChrome chrome={chrome} />
      <h2 id="data">Data</h2>
      <div className="source-filters data-tabs">
        <a className={`filter-chip${tab === "flow" ? " on" : ""}`} href="/admin/data?tab=flow" title="what comes in: stories created">
          Flow
        </a>
        <a className={`filter-chip${tab === "distribution" ? " on" : ""}`} href="/admin/data?tab=distribution" title="what goes out: feed, MCP, clicks, searches, signups">
          Distribution
        </a>
      </div>
      {tab === "flow" ? <FlowPanel data={flow} /> : <DistributionPanel data={distribution} />}
    </div>
  );
}
