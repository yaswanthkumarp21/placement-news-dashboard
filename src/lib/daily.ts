import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Tile } from "./tiles";

type Row = {
  id: number;
  company_id: string | null;
  headline: string;
  recap: string | null;
  source_url: string;
  source_name: string | null;
  also_covered: { name?: string; url: string }[] | null;
  type_tag: string | null;
  published_at: string;
  bullets: string[] | null;
  importance: number | null;
  companies: { name: string } | { name: string }[] | null;
};

/**
 * Stories written by the daily job (last 30 days, relevant only), as tiles.
 * Read on the server with the service-role key, so no public database access is needed.
 * Returns [] when the key is missing or nothing has been stored yet; the page then shows the demo stories.
 */
export async function loadDailyTiles(): Promise<Tile[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await sb
    .from("articles")
    .select("id,company_id,headline,recap,source_url,source_name,also_covered,type_tag,published_at,bullets,importance,companies(name)")
    .eq("view", "daily")
    .gt("importance", 0)
    .gte("published_at", since)
    .order("importance", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(400);
  if (error || !data) return [];
  return (data as unknown as Row[])
    .filter((r) => r.bullets?.length)
    .map((r) => {
      const co = Array.isArray(r.companies) ? r.companies[0]?.name : r.companies?.name;
      const days = (Date.now() - new Date(`${r.published_at}T00:00:00`).getTime()) / 86400000;
      return {
        id: `d${r.id}`,
        co: co ?? r.company_id ?? "Company",
        slug: r.company_id ?? "",
        csvId: r.company_id,
        date: r.published_at,
        dateNote: null,
        headline: r.headline,
        bullets: r.bullets ?? [],
        theme: r.type_tag ?? "news",
        role: "",
        recap: r.recap ?? "",
        keyNumbers: "",
        sources: [
          { l: r.source_name ?? "Source", u: r.source_url },
          ...(r.also_covered ?? []).map((a) => ({ l: a.name || "Also covered", u: a.url })),
        ],
        single: !(r.also_covered ?? []).length,
        score: (r.importance ?? 0) * 10 + Math.max(0, 20 - days * 4),
      } satisfies Tile;
    })
    .sort((a, b) => b.score - a.score);
}
