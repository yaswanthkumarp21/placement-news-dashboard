import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";

export const metadata = { title: "Saved" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const { supabase, user } = await currentUser();
  if (!user) redirect("/login?next=/saved");
  const { data } = await supabase
    .from("saved_items")
    .select("saved_at, articles(id,headline,recap,source_url,source_name,published_at,company_id)")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  return (
    <main style={{ maxWidth: 820, margin: "24px auto", padding: "0 16px" }}>
      <h1>Saved news</h1>
      <p>
        <Link href="/account">&larr; My companies</Link>
      </p>
      {!data?.length ? (
        <p style={{ opacity: 0.7 }}>Nothing saved yet. Stories you save from the daily feed will show up here.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.map((row) => {
            const a = Array.isArray(row.articles) ? row.articles[0] : row.articles;
            if (!a) return null;
            return (
              <li key={a.id} style={{ margin: "16px 0" }}>
                <a href={a.source_url} target="_blank" rel="noreferrer">
                  <strong>{a.headline}</strong>
                </a>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  {a.source_name} · {a.published_at}
                </div>
                {a.recap ? <div>{a.recap}</div> : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
