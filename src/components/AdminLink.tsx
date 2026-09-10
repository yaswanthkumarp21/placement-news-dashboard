"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Footer Admin link, visible only in browsers that have logged into the
 * admin. Keyed off the cosmetic oa_admin_ui cookie set at login: readable
 * from JS, grants nothing, real auth stays the httpOnly session cookie that
 * isAdmin() checks. Renders nothing on the server and before mount, so
 * visitors get zero output and hydration always matches. Beside it, the
 * deploy's commit, so a "pushed as" hash can be checked from any page.
 */
export function AdminLink({ build }: { build?: { sha: string; short: string; url?: string } | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(document.cookie.split("; ").includes("oa_admin_ui=1"));
  }, []);
  if (!show) return null;
  return (
    <>
      <Link href="/admin">Admin</Link>
      {build ? (
        build.url ? (
          <a href={build.url} rel="noopener" className="build-id" title={`This deploy was built from commit ${build.short}`}>
            build {build.short}
          </a>
        ) : (
          <span className="build-id" title={`This deploy was built from commit ${build.short}`}>
            build {build.short}
          </span>
        )
      ) : null}
    </>
  );
}
