import type { VercelConfig } from "@vercel/config/v1";

// No Vercel cron on purpose: Vercel's free (Hobby) plan only allows daily crons, and this app's
// scheduled work runs in GitHub Actions instead (planned: the daily news job).
export const config: VercelConfig = {
  framework: "nextjs",
};
