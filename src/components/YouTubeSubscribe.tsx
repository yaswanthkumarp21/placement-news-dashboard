"use client";

import { useEffect, useRef } from "react";

/**
 * YouTube's own Subscribe button for a show, the compact one without a
 * count. Google's widget script draws it, and for a reader signed into
 * YouTube it shows Subscribed or Subscribe and toggles in place; a reader
 * not signed in gets YouTube's sign-in popup first. The script loads once
 * per page and only on pages that render a button, so the rest of the site
 * never talks to Google.
 */
export function YouTubeSubscribe({ channelId }: { channelId: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // the widget takes the theme it is drawn with, so it reads the page's
    // resolved scheme at mount
    const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    el.innerHTML = "";
    const div = document.createElement("div");
    div.className = "g-ytsubscribe";
    div.dataset.channelid = channelId;
    div.dataset.layout = "default";
    div.dataset.count = "hidden";
    div.dataset.theme = dark ? "dark" : "default";
    el.appendChild(div);
    type GAPI = { ytsubscribe?: { go?: (node?: HTMLElement) => void } };
    const w = window as unknown as { gapi?: GAPI; __ytsubLoading?: Promise<void> };
    const render = () => w.gapi?.ytsubscribe?.go?.(el);
    if (w.gapi?.ytsubscribe) {
      render();
      return;
    }
    if (!w.__ytsubLoading) {
      w.__ytsubLoading = new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = "https://apis.google.com/js/platform.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });
    }
    // platform.js draws every .g-ytsubscribe it finds on load; a button added
    // after that needs the explicit call
    void w.__ytsubLoading.then(() => setTimeout(render, 0));
  }, [channelId]);
  return <span className="yt-subscribe" ref={box} />;
}
