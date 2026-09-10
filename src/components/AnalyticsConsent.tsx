"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

type Choice = "granted" | "denied" | "unset";

/**
 * Consent-gated analytics: GA is not loaded at all until the visitor accepts.
 * The choice persists in localStorage; the footer "cookies" link reopens it.
 * Admin browsers (the cosmetic oa_admin_ui cookie) are excluded entirely, no
 * GA and no banner, so the operator's own visits never count as readership.
 */
export function AnalyticsConsent({ gaId }: { gaId: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    try {
      if (document.cookie.includes("oa_admin_ui=1")) {
        setChoice("denied");
        return;
      }
      const saved = localStorage.getItem("ga-consent");
      setChoice(saved === "granted" || saved === "denied" ? saved : "unset");
    } catch {
      setChoice("unset");
    }
  }, []);

  function decide(v: "granted" | "denied") {
    try {
      localStorage.setItem("ga-consent", v);
    } catch {}
    setChoice(v);
  }

  if (choice === null) return null;

  return (
    <>
      {choice === "granted" ? <GoogleAnalytics gaId={gaId} /> : null}
      {choice === "unset" ? (
        <div className="consent-banner" role="dialog" aria-label="Cookie consent">
          <span>We use analytics cookies to understand readership. No ads, no tracking beyond that.</span>
          <div className="consent-actions">
            <button className="btn primary" onClick={() => decide("granted")}>
              Accept
            </button>
            <button className="btn" onClick={() => decide("denied")}>
              Decline
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Lets a visitor change their earlier consent choice (used on the privacy
 * page). Clearing the saved choice and reloading brings the banner back. An
 * admin browser never gets the banner or GA, so it is told that instead of
 * reloading into what looks like nothing.
 */
export function CookieSettingsLink({ label = "cookies" }: { label?: string }) {
  const [note, setNote] = useState<string | null>(null);
  return (
    <>
      <button
        className="footer-cookie"
        onClick={() => {
          if (document.cookie.includes("oa_admin_ui=1")) {
            setNote("Admin browsers never run analytics, so there is no choice to change here.");
            return;
          }
          try {
            localStorage.removeItem("ga-consent");
          } catch {}
          window.location.reload();
        }}
      >
        {label}
      </button>
      {note ? <span className="org"> {note}</span> : null}
    </>
  );
}
