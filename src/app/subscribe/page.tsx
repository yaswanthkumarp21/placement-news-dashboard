import { SubscribeForm } from "./SubscribeForm";
import { siteUrl } from "@/lib/config";
import { siteIdentity } from "@/lib/site";

export const metadata = {
  title: "Email digests",
  description:
    "The front page by email: a daily edition at UTC midnight, a weekly edition on Saturday morning, and a monthly edition on the 1st.",
};

/** House style for this copy: no em dashes, no semicolons. */
export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ unsubscribed?: string; confirmed?: string }>;
}) {
  const { unsubscribed, confirmed } = await searchParams;
  const site = siteIdentity();
  const xHandle = site.social?.xHandle;
  const fcHandle = site.social?.farcasterHandle;
  const host = siteUrl().replace(/^https?:\/\//, "");
  return (
    <main className="wrap page single roomy">
      <div className="prose">
        <h1>Email digests</h1>
        {unsubscribed ? <p className="notice">You are unsubscribed. No more emails from us.</p> : null}
        {confirmed ? <p className="notice">Subscription confirmed. See you in the next edition.</p> : null}
        <p>Subscribe to receive an email digest every day, week or month.</p>
        <p>
          See what you would get before you sign up: a <a href="/subscribe/sample/daily">sample daily edition</a>, a{" "}
          <a href="/subscribe/sample/weekly">sample weekly edition</a>, and a{" "}
          <a href="/subscribe/sample/monthly">sample monthly edition</a>, each the most recent one sent.
        </p>
        <SubscribeForm />
        {xHandle || fcHandle ? (
          <>
            <h2>Social media</h2>
            <p>
              Follow{" "}
              {xHandle ? (
                <a href={`https://x.com/${xHandle}`} rel="noopener">
                  @{xHandle} on X
                </a>
              ) : null}
              {xHandle && fcHandle ? " or " : null}
              {fcHandle ? (
                <a href={`https://farcaster.xyz/${fcHandle}`} rel="noopener">
                  @{fcHandle} on Farcaster
                </a>
              ) : null}{" "}
              to get the digests as posts.
            </p>
          </>
        ) : null}
        <h2>RSS</h2>
        <p>
          Add <a href="/feed.xml">{host}/feed.xml</a> to your reader to get the newest 40 stories with headline,
          explainer, section, and permalink.
        </p>
        <h2>MCP</h2>
        <p>
          Add <code>{siteUrl()}/api/mcp</code> to any MCP enabled assistant as a custom connector to pull the top
          stories, the newest items, daily and weekly reviews, the podcasts, or search.
        </p>
      </div>
    </main>
  );
}
