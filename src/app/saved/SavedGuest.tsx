"use client";
import { TileCard } from "@/components/TileCard";
import { useSaved } from "@/lib/local";
import type { Tile } from "@/lib/tiles";

export function SavedGuest({ tiles }: { tiles: Tile[] }) {
  const { saved, ready } = useSaved();
  const byId = new Map(tiles.map((t) => [t.id, t]));
  const items = saved.map((id) => byId.get(id)).filter(Boolean) as Tile[];
  if (!ready) return null;
  if (!items.length) return <div className="pn-empty">Nothing saved yet. Tap the star on any story to keep it here.</div>;
  return (
    <div className="pn-list">
      {items.map((t) => (
        <TileCard key={t.id} t={t} showTheme />
      ))}
    </div>
  );
}
