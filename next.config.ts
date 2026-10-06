import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // hide the floating Next.js dev badge (the round "N")
  devIndicators: false,
  // no generated AGENTS.md/CLAUDE.md clutter in the repo
  agentRules: false,
  // config/ is read from disk at runtime (identity, feeds, prompts, section
  // rules): make sure it ships inside the serverless bundle.
  outputFileTracingIncludes: {
    "/**": ["./config/**/*", "./data/archive/**/*"],
  },
};

export default nextConfig;
