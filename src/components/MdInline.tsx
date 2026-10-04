import type { ReactNode } from "react";

/** Tiny safe renderer for the markdown the research files use: [text](url), **bold**, *italic*. No raw HTML. */
export function MdInline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    const tok = m[0];
    if (tok.startsWith("[")) {
      const mm = tok.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (mm)
        nodes.push(
          <a key={i++} href={mm[2]} target="_blank" rel="noreferrer">
            {mm[1]}
          </a>,
        );
    } else if (tok.startsWith("**")) nodes.push(<strong key={i++}>{tok.slice(2, -2)}</strong>);
    else nodes.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    last = idx + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

/** Renders a block of raw lines as bullets / numbered items / plain lines. */
export function MdBlock({ lines }: { lines: string[] }) {
  const items = lines.filter((l) => !/^\|[\s:|-]+\|?$/.test(l.trim()));
  return (
    <ul style={{ margin: "6px 0", paddingLeft: 20 }}>
      {items.map((l, i) => (
        <li key={i} style={{ margin: "3px 0" }}>
          <MdInline text={l.replace(/^\s*(?:[-*]|\d+\.)\s+/, "")} />
        </li>
      ))}
    </ul>
  );
}
