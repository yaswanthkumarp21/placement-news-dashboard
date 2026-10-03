import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Supabase client acting as the signed-in user (reads their session cookie). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // called from a Server Component: the proxy refreshes cookies instead
        }
      },
    },
  });
}

export async function currentUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

/** The signed-in user's profile row, or null. */
export async function currentProfile() {
  const { supabase, user } = await currentUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data } = await supabase.from("profiles").select("id,email,full_name,is_admin").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: data };
}
