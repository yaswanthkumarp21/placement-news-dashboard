import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentProfile } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata = { title: "Manage users" };
export const dynamic = "force-dynamic";

async function removeUser(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const { profile } = await currentProfile();
  if (!profile?.is_admin || !id || id === profile.id) return; // admin only; never remove yourself
  const admin = supabaseAdmin();
  if (!admin) return;
  const { data: target } = await admin.from("profiles").select("is_admin").eq("id", id).maybeSingle();
  if (target?.is_admin) return; // admins can't be removed from here
  await admin.auth.admin.deleteUser(id); // cascades to profile, deselections, saved items
  revalidatePath("/manage/users");
}

export default async function ManageUsers() {
  const { supabase, user, profile } = await currentProfile();
  if (!user) redirect("/login?next=/manage/users");
  if (!profile?.is_admin) notFound();

  const { data: users } = await supabase.from("profiles").select("id,email,full_name,is_admin,created_at").order("created_at");
  const canRemove = Boolean(supabaseAdmin());

  return (
    <main style={{ maxWidth: 820, margin: "24px auto", padding: "0 16px" }}>
      <h1>Manage users</h1>
      <p>
        <Link href="/account">&larr; My companies</Link>
      </p>
      {!canRemove ? (
        <p style={{ color: "#a60" }}>
          Removing users is switched off: the server has no SUPABASE_SERVICE_ROLE_KEY yet. You can still see everyone below.
        </p>
      ) : null}
      <p>{users?.length ?? 0} user(s)</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(users ?? []).map((u) => (
            <tr key={u.id} style={{ borderTop: "1px solid #8884" }}>
              <td>
                {u.full_name ?? ""}
                {u.is_admin ? " (admin)" : ""}
              </td>
              <td>{u.email}</td>
              <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
              <td>
                {u.is_admin || u.id === user.id ? null : (
                  <form action={removeUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" disabled={!canRemove} style={{ cursor: canRemove ? "pointer" : "not-allowed" }}>
                      Remove
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
