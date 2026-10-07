"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Shows who is signed in (or invites a guest to sign in) at the top of My companies. */
export function AccountBar() {
  const [info, setInfo] = useState<{ email: string; admin: boolean } | null | undefined>(undefined);
  useEffect(() => {
    const db = supabaseBrowser();
    db.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setInfo(null);
      const { data: p } = await db.from("profiles").select("is_admin").eq("id", data.user.id).maybeSingle();
      setInfo({ email: data.user.email ?? "your account", admin: Boolean(p?.is_admin) });
    });
  }, []);
  if (info === undefined) return null;
  if (info === null)
    return (
      <p className="pn-note">
        You are browsing as a guest, so your picks stay in this browser. <Link href="/login?next=/account">Sign in with Google</Link> to keep them on every device.
      </p>
    );
  return (
    <p className="pn-note">
      Signed in as {info.email}{info.admin ? " (admin)" : ""}. Your saved stories and company picks sync to your account.
      {info.admin ? <> <Link href="/manage/users">Manage users</Link></> : null}
    </p>
  );
}
