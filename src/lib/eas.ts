/**
 * The transaction behind an attestation, from EAS's public index, for days
 * sealed before the pipeline started keeping the hash itself. Cached a day
 * per uid, since it never changes.
 */
export async function attestationTxFor(uid: string): Promise<string | null> {
  if (!/^0x[0-9a-fA-F]{64}$/.test(uid)) return null;
  try {
    const res = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "query($id:String!){ attestation(where:{id:$id}){ txid } }", variables: { id: uid } }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { attestation?: { txid?: string } } };
    const tx = json.data?.attestation?.txid;
    return tx && /^0x[0-9a-fA-F]{64}$/.test(tx) ? tx : null;
  } catch {
    return null;
  }
}
