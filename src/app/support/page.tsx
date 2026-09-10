import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CopyButton } from "./CopyButton";
import { siteIdentity, tipJar } from "@/lib/site";
import { loadState } from "@/lib/state";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  const site = siteIdentity();
  return {
    title: "Support",
    description: `Reader tips keep ${site.siteName} independent. One address, mainnet and every layer.`,
    // a page nobody links to must not get indexed
    ...(tipJar().live ? {} : { robots: { index: false } }),
  };
}

/**
 * The tip jar: the configured name and address, a copy button, and a QR
 * code drawn on the server (no external call). Exists only while
 * config/site.json has tipJar.live true and an address. House style for
 * this copy: no em dashes, no semicolons.
 */
export default async function SupportPage() {
  const tips = tipJar();
  if (!tips.live) notFound();
  const site = siteIdentity();
  const sponsorOn = await loadState()
    .then((st) => Boolean(st.sponsorPageEnabled))
    .catch(() => false);

  // EIP-681 payment URI: wallets that scan it open a send to the address
  const qr = await QRCode.toString(`ethereum:${tips.address}`, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#000000ff", light: "#ffffffff" },
  });

  return (
    <main className="wrap page single roomy">
      <div className="prose">
        <h1>Support {site.siteName}</h1>

        <div className="tipjar">
          {tips.ens ? <div className="tipjar-ens">{tips.ens}</div> : null}
          <div className="tipjar-addr">
            <code>{tips.address}</code>
            <CopyButton text={tips.address} />
          </div>
          {/* built on the server, no external call: the SVG is inline */}
          <div className="tipjar-qr" aria-label={`QR code for ${tips.ens || tips.address}`} dangerouslySetInnerHTML={{ __html: qr }} />
        </div>

        <p>Accepts ETH or USDC on mainnet or any Ethereum layer.</p>
        {sponsorOn ? (
          <p>
            Any company or person who wants to reach the audience reading {site.siteName} can check out the available{" "}
            <Link href="/sponsor">sponsor options</Link>.
          </p>
        ) : null}
      </div>
    </main>
  );
}
